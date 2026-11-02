"""Motor determinístico e sem banco: regras das etapas 1 e 2 do Tirze-Life.

A fórmula é reproduzida do prompt mestre. Sua saída em mg é uma quantidade
modelada, não uma concentração sérica medida nem uma recomendação de dose.
"""
from datetime import datetime, timedelta, timezone
from enum import StrEnum
from math import expm1, fsum
from typing import Annotated, Literal
from uuid import UUID
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter
from pydantic import (
    AwareDatetime, BaseModel, ConfigDict, Field, StrictBool,
    field_validator, model_validator,
)
from pydantic.alias_generators import to_camel

HALF_LIFE_HOURS = 120.0
ABSORPTION_RATE = 0.08
DOSES = {2.5, 5.0, 7.5, 10.0, 12.5, 15.0}
MODEL_NOTICE = (
    "Estimativa educacional do modelo de tirzepatida; não mede concentração "
    "sanguínea e não orienta mudanças de dose. O ajuste de água é uma regra "
    "do projeto, não uma prescrição nem proteção contra os efeitos do álcool."
)


class Model(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, extra="forbid",
        allow_inf_nan=False,
    )


class EventType(StrEnum):
    ALCOOL_CERVEJA = "ALCOOL_CERVEJA"
    BEBIDA_COM_GAS = "BEBIDA_COM_GAS"
    FRITURA_GORDURA = "FRITURA_GORDURA"
    DOCE = "DOCE"
    REFEICAO_LIVRE = "REFEICAO_LIVRE"


class Phase(StrEnum):
    NO_DATA = "NO_DATA"
    ABSORPTION = "ABSORPTION"
    PEAK_ACTION = "PEAK_ACTION"
    STABLE_PLATEAU = "STABLE_PLATEAU"
    HALF_LIFE_TAIL = "HALF_LIFE_TAIL"


class Profile(Model):
    full_name: str = Field(min_length=1, max_length=100)
    medication: Literal["TIRZEPATIDE"]
    current_weight_kg: float = Field(ge=20, le=400)
    target_weight_kg: float = Field(ge=20, le=400)
    height_cm: int = Field(ge=80, le=250, strict=True)
    current_dose_mg: float
    preferred_injection_day: int = Field(ge=0, le=6, strict=True)
    preferred_injection_time: str = Field(pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    has_low_thigh_fat: StrictBool
    has_fluid_restriction: StrictBool
    time_zone: str = "America/Sao_Paulo"
    daily_protein_goal_g: int = Field(gt=0, strict=True)
    base_water_goal_ml: int = Field(gt=0, strict=True)
    is_pro_subscriber: StrictBool = False

    @field_validator("time_zone")
    @classmethod
    def valid_zone(cls, value: str) -> str:
        try:
            ZoneInfo(value)
        except (ZoneInfoNotFoundError, ValueError) as exc:
            raise ValueError("Fuso horário inválido.") from exc
        return value

    @field_validator("current_dose_mg")
    @classmethod
    def valid_dose(cls, value: float) -> float:
        if value not in DOSES:
            raise ValueError("Dose de tirzepatida não suportada.")
        return value


Site = Literal[
    "ABD_SUP_DIR", "ABD_INF_DIR", "ABD_SUP_ESQ", "ABD_INF_ESQ",
    "COXA_DIR", "COXA_ESQ", "BRACO_DIR", "BRACO_ESQ",
]


class Injection(Model):
    id: UUID
    dose_mg: float
    site: Site
    applied_at: AwareDatetime
    doctor_prescribed_confirmed: StrictBool
    four_fingers_rule_confirmed: StrictBool

    @field_validator("dose_mg")
    @classmethod
    def valid_dose(cls, value: float) -> float:
        return Profile.valid_dose(value)


class LifeEvent(Model):
    id: UUID
    event_type: EventType
    quantity: int = Field(ge=1, le=100, strict=True)
    stopped_by_satiety: StrictBool
    logged_at: AwareDatetime

    @field_validator("logged_at")
    @classmethod
    def not_future(cls, value: datetime) -> datetime:
        if value > datetime.now(timezone.utc):
            raise ValueError("O evento não pode estar no futuro.")
        return value


class Symptom(Model):
    id: UUID
    logged_at: AwareDatetime
    heartburn_level: int = Field(ge=1, le=5, strict=True)
    bloating_level: int = Field(ge=1, le=5, strict=True)


class LifeEventRequest(Model):
    profile: Profile
    injections: Annotated[list[Injection], Field(max_length=10000)] = Field(default_factory=list)
    events: Annotated[list[LifeEvent], Field(max_length=10000)] = Field(default_factory=list)
    symptoms: Annotated[list[Symptom], Field(max_length=10000)] = Field(default_factory=list)
    event: LifeEvent

    @model_validator(mode="after")
    def unique_records(self):
        for records in (self.injections, self.events, self.symptoms):
            if len({record.id for record in records}) != len(records):
                raise ValueError("O histórico contém IDs duplicados.")
        prior = next((event for event in self.events if event.id == self.event.id), None)
        if prior is not None and prior != self.event:
            raise ValueError("O ID do evento já existe com conteúdo diferente.")
        return self


class LifeEventResponse(Model):
    event_id: UUID
    day: str
    water_adjustment_ml: int
    daily_water_adjustment_ml: int
    dynamic_water_goal_ml: int | None
    estimated_active_mg: float
    hours_since_last_injection: float | None
    phase: Phase
    digestive_warning: bool
    message: str
    guidance: list[str]
    model_notice: str = MODEL_NOTICE


def phase_for_hours(hours: float | None) -> Phase:
    if hours is None:
        return Phase.NO_DATA
    if hours < 24:
        return Phase.ABSORPTION
    if hours <= 72:
        return Phase.PEAK_ACTION
    if hours <= 120:
        return Phase.STABLE_PLATEAU
    return Phase.HALF_LIFE_TAIL


def calculate_pharmacokinetics(
    injections: list[Injection], at: datetime,
) -> tuple[float, float | None, Phase]:
    """Soma todas as doses passadas; não aplica o corte arbitrário de 720h."""
    if at.tzinfo is None or at.utcoffset() is None:
        raise ValueError("A data precisa conter fuso horário.")
    if len({item.id for item in injections}) != len(injections):
        raise ValueError("Aplicação duplicada.")
    contributions: list[float] = []
    elapsed: list[float] = []
    for injection in injections:
        hours = (at - injection.applied_at).total_seconds() / 3600
        if hours < 0:
            continue
        elapsed.append(hours)
        contributions.append(
            injection.dose_mg * -expm1(-ABSORPTION_RATE * hours)
            * (0.5 ** (hours / HALF_LIFE_HOURS))
        )
    latest = min(elapsed) if elapsed else None
    return fsum(contributions), latest, phase_for_hours(latest)


def water_adjustment(event: LifeEvent) -> int:
    return event.quantity * 250 if event.event_type == EventType.ALCOOL_CERVEJA else 0


def process_real_life_event(data: LifeEventRequest) -> LifeEventResponse:
    event, profile = data.event, data.profile
    active, hours, phase = calculate_pharmacokinetics(data.injections, event.logged_at)
    zone = ZoneInfo(profile.time_zone)
    day = event.logged_at.astimezone(zone).date()
    # Retry com o mesmo ID não soma água novamente. A API nunca persiste estado.
    unique_events = {item.id: item for item in data.events}
    unique_events[event.id] = event
    extra_today = sum(
        water_adjustment(item) for item in unique_events.values()
        if item.logged_at.astimezone(zone).date() == day
    )
    recent_discomfort = any(
        event.logged_at - timedelta(hours=48) <= item.logged_at <= event.logged_at
        and (item.heartburn_level >= 3 or item.bloating_level >= 3)
        for item in data.symptoms
    )
    sensitive_phase = phase in (Phase.PEAK_ACTION, Phase.STABLE_PLATEAU)
    if event.stopped_by_satiety:
        message = "Você percebeu seu sinal de saciedade e respeitou seu limite. Esse cuidado conta."
    else:
        message = "Obrigado por registrar como foi. Não há nada a compensar; podemos observar seus sinais com calma."
    guidance: list[str] = []
    warning = False
    match event.event_type:
        case EventType.ALCOOL_CERVEJA:
            guidance.append(
                "O registro acrescenta 250 ml por lata/copo à referência de água do dia. "
                "Distribua a ingestão ao longo do dia, conforme sua orientação individual."
            )
            guidance.append("Água não neutraliza o álcool nem previne hipoglicemia ou ressaca.")
            if sensitive_phase or recent_discomfort:
                warning = True
                guidance.append(
                    "Nesta fase estimada ou com desconforto recente, álcool e gás podem "
                    "piorar estufamento e refluxo. Vá devagar e evite deitar logo após consumir."
                )
        case EventType.BEBIDA_COM_GAS:
            guidance.append(
                "O gás pode aumentar a sensação de estômago cheio. Observe se isso é confortável "
                "para você; não precisa insistir na bebida para sentir saciedade."
            )
            if sensitive_phase or recent_discomfort:
                warning = True
                guidance.append(
                    "Experimente pequenos goles e pausas. Se houver azia ou estufamento, "
                    "considere uma bebida sem gás."
                )
        case EventType.FRITURA_GORDURA | EventType.REFEICAO_LIVRE:
            guidance.append("Coma no seu ritmo, observe a saciedade e faça pausas quando precisar.")
            if sensitive_phase or recent_discomfort:
                warning = True
                guidance.append("Porções menores podem ser mais confortáveis se a digestão estiver lenta.")
        case EventType.DOCE:
            guidance.append("Esse registro faz parte da sua rotina. Siga sua próxima refeição habitual, sem compensações.")
    if profile.has_fluid_restriction:
        guidance.append(
            "Você informou restrição de líquidos. O ajuste automático está suspenso; "
            "siga a quantidade orientada pela sua equipe de saúde."
        )
    if any(
        event.logged_at - timedelta(hours=48) <= item.logged_at <= event.logged_at
        and (item.heartburn_level >= 4 or item.bloating_level >= 4)
        for item in data.symptoms
    ):
        guidance.append("Se o desconforto for forte ou persistente, procure orientação da sua equipe de saúde.")
    # Não confiar em uma meta enviada pelo cliente: recalcular a regra base.
    base = int(profile.current_weight_kg * 35 + 0.5)
    return LifeEventResponse(
        event_id=event.id, day=day.isoformat(),
        water_adjustment_ml=water_adjustment(event),
        daily_water_adjustment_ml=extra_today,
        dynamic_water_goal_ml=None if profile.has_fluid_restriction else base + extra_today,
        estimated_active_mg=active, hours_since_last_injection=hours, phase=phase,
        digestive_warning=warning, message=message, guidance=guidance,
    )


router = APIRouter(prefix="/v1/real-life", tags=["Modo Vida Real"])


@router.post("/evaluate", response_model=LifeEventResponse)
def evaluate_event(data: LifeEventRequest) -> LifeEventResponse:
    return process_real_life_event(data)
