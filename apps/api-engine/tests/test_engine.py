import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from main import app
from services.real_life_engine import (
    Injection, LifeEventRequest, calculate_pharmacokinetics, process_real_life_event,
)

AT = datetime(2026, 1, 15, 12, tzinfo=timezone.utc)
client = TestClient(app)
FIXTURES = json.loads((Path(__file__).resolve().parents[3] / "fixtures" / "pharmacokinetics.json").read_text(encoding="utf-8"))


def injection(hours):
    return dict(id=str(uuid4()), doseMg=2.5, site="ABD_SUP_DIR",
                appliedAt=(AT - timedelta(hours=hours)).isoformat(),
                doctorPrescribedConfirmed=True, fourFingersRuleConfirmed=True)


def payload(event_type="ALCOOL_CERVEJA", hours=48):
    return {
        "profile": dict(
            fullName="Teste", medication="TIRZEPATIDE", currentWeightKg=80,
            targetWeightKg=70, heightCm=170, currentDoseMg=2.5,
            preferredInjectionDay=0, preferredInjectionTime="09:00",
            hasLowThighFat=True, hasFluidRestriction=False, timeZone="America/Sao_Paulo",
            dailyProteinGoalG=112, baseWaterGoalMl=2800, isProSubscriber=False,
        ),
        "injections": [injection(hours)], "events": [], "symptoms": [],
        "event": dict(id=str(uuid4()), eventType=event_type, quantity=4,
                      stoppedBySatiety=True, loggedAt=AT.isoformat()),
    }


@pytest.mark.parametrize("fixture", FIXTURES, ids=lambda fixture: fixture["name"])
def test_shared_pharmacokinetics(fixture):
    active, _, phase = calculate_pharmacokinetics(
        [Injection.model_validate(injection(age)) for age in fixture["ages"]], AT,
    )
    assert active == pytest.approx(fixture["expectedMg"], abs=1e-12)
    assert phase.value == fixture["phase"]


def test_four_beers_day_four_and_idempotent_retry():
    body = payload(hours=96)
    body["events"] = [body["event"].copy()]
    result = process_real_life_event(LifeEventRequest.model_validate(body))
    assert result.water_adjustment_ml == 1000
    assert result.daily_water_adjustment_ml == 1000
    assert result.dynamic_water_goal_ml == 3800
    assert result.digestive_warning
    assert "respeitou" in result.message


def test_accumulates_same_local_day_and_ignores_yesterday():
    body = payload()
    body["events"] = [
        {**body["event"], "id": str(uuid4()), "quantity": 2, "loggedAt": "2026-01-15T03:00:00Z"},
        {**body["event"], "id": str(uuid4()), "quantity": 8, "loggedAt": "2026-01-15T02:59:59Z"},
    ]
    result = process_real_life_event(LifeEventRequest.model_validate(body))
    assert result.dynamic_water_goal_ml == 4300


@pytest.mark.parametrize("age,warning", [(48, True), (48.001, False), (-1, False)])
def test_gas_uses_48_hour_symptom_window(age, warning):
    body = payload("BEBIDA_COM_GAS", hours=150)
    body["symptoms"] = [dict(id=str(uuid4()),
        loggedAt=(AT - timedelta(hours=age)).isoformat(), heartburnLevel=3, bloatingLevel=1)]
    result = process_real_life_event(LifeEventRequest.model_validate(body))
    assert result.water_adjustment_ml == 0
    assert result.digestive_warning == warning


def test_gas_peak_without_symptoms():
    response = client.post("/v1/real-life/evaluate", json=payload("BEBIDA_COM_GAS"))
    assert response.status_code == 200
    assert response.json()["digestiveWarning"]
    assert response.json()["waterAdjustmentMl"] == 0
    assert response.headers["cache-control"] == "no-store"


def test_satiety_false_has_no_assumption_of_stopping():
    body = payload()
    body["event"]["stoppedBySatiety"] = False
    result = process_real_life_event(LifeEventRequest.model_validate(body))
    assert "compensar" in result.message
    assert "respeitou" not in result.message


def test_fluid_restriction_suspends_target():
    body = payload()
    body["profile"]["hasFluidRestriction"] = True
    assert process_real_life_event(LifeEventRequest.model_validate(body)).dynamic_water_goal_ml is None


@pytest.mark.parametrize("quantity", [0, -1, 1.5, True, 101, "4"])
def test_invalid_quantities(quantity):
    body = payload()
    body["event"]["quantity"] = quantity
    response = client.post("/v1/real-life/evaluate", json=body)
    assert response.status_code == 422
    assert "input" not in response.json()["detail"][0]


@pytest.mark.parametrize("change", ["timestamp", "future", "zone", "duplicate", "unknown"])
def test_invalid_requests(change):
    body = payload()
    if change == "timestamp":
        body["event"]["loggedAt"] = "2026-01-15T12:00:00"
    elif change == "future":
        body["event"]["loggedAt"] = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    elif change == "zone":
        body["profile"]["timeZone"] = "invalid-zone"
    elif change == "duplicate":
        body["injections"] *= 2
    else:
        body["event"]["eventType"] = "INVALID"
    assert client.post("/v1/real-life/evaluate", json=body).status_code == 422


def test_health_and_local_cors():
    assert client.get("/health").json()["database"] == "not-configured"
    response = client.options("/v1/real-life/evaluate", headers={
        "Origin": "http://localhost:8081", "Access-Control-Request-Method": "POST",
    })
    assert response.headers["access-control-allow-origin"] == "http://localhost:8081"
