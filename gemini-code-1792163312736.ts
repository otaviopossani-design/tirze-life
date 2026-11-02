/**
 * Motor Farmacocinético da Tirzepatida
 * Base de cálculo: Meia-vida (t1/2) média de 120 horas (5 dias).
 */

export interface InjectionRecord {
  id: string;
  date: Date;
  doseMg: number; // Ex: 2.5, 5.0, 7.5, etc.
}

export interface CurrentStatus {
  activeConcentrationMg: number; // Quantidade estimada ativa no sangue (mg)
  peakPercentage: number;        // Porcentagem do pico esperado
  daysSinceInjection: number;    // Dias decorridos desde a última aplicação
  isPeakWindow: boolean;         // True se estiver entre 24h e 72h (maior lentidão gástrica)
}

/**
 * Calcula a concentração sérica ativa com base no histórico de injeções e na meia-vida de 120h.
 */
export function calculateActiveTirzepatide(injections: InjectionRecord[]): CurrentStatus {
  if (!injections || injections.length === 0) {
    return {
      activeConcentrationMg: 0,
      peakPercentage: 0,
      daysSinceInjection: 999,
      isPeakWindow: false,
    };
  }

  // Ordena as injeções da mais antiga para a mais recente
  const sortedInjections = [...injections].sort((a, b) => a.date.getTime() - b.date.getTime());
  const lastInjection = sortedInjections[sortedInjections.length - 1];
  
  const now = new Date();
  const hoursSinceLast = (now.getTime() - lastInjection.date.getTime()) / (1000 * 60 * 60);
  const daysSinceLast = hoursSinceLast / 24;

  const HALF_LIFE_HOURS = 120; // 5 dias
  let totalActiveMg = 0;

  // Soma a contribuição residual de todas as injeções passadas usando decaimento exponencial
  sortedInjections.forEach((inj) => {
    const hoursElapsed = (now.getTime() - inj.date.getTime()) / (1000 * 60 * 60);
    if (hoursElapsed >= 0) {
      // Fórmula de decaimento radioativo/farmacocinético: A = A0 * (0.5 ^ (t / t1/2))
      const remaining = inj.doseMg * Math.pow(0.5, hoursElapsed / HALF_LIFE_HOURS);
      totalActiveMg += remaining;
    }
  });

  // Janela de pico ocorre entre 24h (1 dia) e 72h (3 dias) após a última dose
  const isPeakWindow = hoursSinceLast >= 24 && hoursSinceLast <= 72;
  
  // Estimativa percentual do pico baseada na dose atual
  const peakPercentage = Math.min(100, Math.max(0, (totalActiveMg / lastInjection.doseMg) * 100));

  return {
    activeConcentrationMg: Number(totalActiveMg.toFixed(2)),
    peakPercentage: Number(peakPercentage.toFixed(1)),
    daysSinceInjection: Number(daysSinceLast.toFixed(1)),
    isPeakWindow,
  };
}