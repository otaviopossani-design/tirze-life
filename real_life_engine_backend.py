from datetime import datetime
import pandas as pd
from pydantic import BaseModel

class LifeEventRequest(BaseModel):
    user_id: str
    event_type: str  # 'ALCOOL_CERVEJA', 'BEBIDA_COM_GAS', 'FRITURA_GORDURA'
    quantity: float
    active_drug_mg: float
    days_since_injection: float

class LifeEventResponse(BaseModel):
    status: str
    message: str
    water_adjustment_ml: int
    digestive_warning: bool
    guidance: str

def process_real_life_event(data: LifeEventRequest) -> LifeEventResponse:
    is_peak_window = (1.0 <= data.days_since_injection <= 3.0)
    water_extra = 0
    digestive_warning = False
    guidance = ""

    if data.event_type == 'ALCOOL_CERVEJA':
        water_extra = int(data.quantity * 250)
        if is_peak_window:
            digestive_warning = True
            guidance = "Você está no período de maior concentração sérica. O álcool e o gás podem causar estufamento leve. Vá devagar, intercale com água pura e evite deitar logo após consumir."
        else:
            guidance = "Parabéns por respeitar seu limite de saciedade! Beba a água extra recomendada para apoiar sua reidratação."
            
    elif data.event_type == 'BEBIDA_COM_GAS':
        water_extra = int(data.quantity * 100)
        if is_peak_window:
            digestive_warning = True
            guidance = "O gás atua como saciedade mecânica no pico da dose. Tome em goles pequenos para evitar refluxo ou plenitude gástrica excessiva."
        else:
            guidance = "Ótima escolha para saciedade sem calorias vazias. Monitore apenas se houver desconforto de gases."
            
    else:
        guidance = "Registro efetuado com sucesso. O tratamento apoia a vida real!"

    return LifeEventResponse(
        status="success",
        message="Processado com acolhimento e inteligência comportamental.",
        water_adjustment_ml=water_extra,
        digestive_warning=digestive_warning,
        guidance=guidance
    )

def generate_weekly_symptom_dataframe(logs: list) -> pd.DataFrame:
    df = pd.DataFrame(logs)
    if df.empty:
        return pd.DataFrame()
    df['logged_at'] = pd.to_datetime(df['logged_at'])
    summary = df.groupby(df['logged_at'].dt.date).agg({
        'nausea_level': 'max',
        'bloating_level': 'max',
        'water_adjustment_ml': 'sum'
    }).reset_index()
    return summary