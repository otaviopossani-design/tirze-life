from datetime import datetime
import pandas as pd
from pydantic import BaseModel


class LifeEventRequest(BaseModel):
  user_id: str
  event_type: str  # 'alcohol_beer', 'carbonated_drink', 'heavy_meal'
  quantity: float  # Ex: 4.0 (latas)
  active_drug_mg: float  # Concentração sérica atual calculada pelo app
  days_since_injection: float  # Dias decorridos desde a última injeção


class LifeEventResponse(BaseModel):
  status: str
  message: str
  water_adjustment_ml: int
  digestive_warning: bool
  guidance: str


def process_real_life_event(data: LifeEventRequest) -> LifeEventResponse:
  """Processa eventos sociais/alimentares aplicando a filosofia 'Zero Culpa'

  e cruzando dados com o pico farmacocinético da tirzepatida.
  """
  # Janela de pico sérico (D+1 a D+3) onde o estômago está mais lento
  is_peak_window = 1.0 <= data.days_since_injection <= 3.0

  water_extra = 0
  digestive_warning = False
  guidance = ""

  if data.event_type == "alcohol_beer":
    # Regra hídrica: +250ml de água pura para cada lata de cerveja para evitar desidratação e ressaca
    water_extra = int(data.quantity * 250)

    if is_peak_window:
      digestive_warning = True
      guidance = (
          "Você está no período de maior concentração da medicação no sangue."
          " Como o estômago está com digestão mais lenta, o álcool e o gás"
          " podem causar leve estufamento. Vá devagar, intercale com água pura"
          " e evite deitar logo em seguida."
      )
    else:
      guidance = (
          "Parabéns por ouvir seu corpo e parar no seu limite! Beba a água"
          " extra recomendada para ajudar o seu organismo a processar o"
          " líquido com tranquilidade."
      )

  elif data.event_type == "carbonated_drink":
    # Água com gás / Refri zero usados como saciedade mecânica
    water_extra = int(
        data.quantity * 100
    )  # Hidratação parcial, mas exige cuidado com gás

    if is_peak_window:
      digestive_warning = True
      guidance = (
          "O gás da bebida atua como um preenchimento mecânico para"
          " potencializar a saciedade. Como você está no pico da dose, tome em"
          " pequenos goles para evitar refluxo ou sensação de estômago excessivamente"
          " cheio."
      )
    else:
      guidance = (
          "Boa escolha para manter a saciedade sem calorias líquidas vazias."
          " Apenas observe se o gás causou algum desconforto gástrico."
      )

  else:
    guidance = (
        "Registro efetuado com sucesso. O tratamento faz parte da vida real!"
    )

  return LifeEventResponse(
        status="success",
        message="Evento processado com acolhimento e ajuste inteligente.",
        water_adjustment_ml=water_extra,
        digestive_warning=digestive_warning,
        guidance=guidance,
  )


# Exemplo de teste analítico usando Pandas para gerar insights semanais para o relatório médico
def generate_weekly_symptom_dataframe(logs: list) -> pd.DataFrame:
  """Transforma logs brutos de sintomas e eventos em um DataFrame estruturado

  para a exportação do relatório PDF do médico.
  """
  df = pd.DataFrame(logs)
  if df.empty:
    return pd.DataFrame()

  # Agrupamento estatístico para identificar correlações de efeitos colaterais
  df["logged_at"] = pd.to_datetime(df["logged_at"])
  summary = (
      df.groupby(df["logged_at"].dt.date)
      .agg({"nausea_level": "max", "bloating_level": "max", "water_ml": "sum"})
      .reset_index()
  )

  return summary