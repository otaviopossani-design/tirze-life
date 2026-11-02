/** Modelo educacional específico de tirzepatida, conforme o prompt mestre.
 * mg representa uma quantidade modelada, NÃO uma concentração sérica medida.
 * Não usar para ajustar dose, intervalo ou estimar segurança de consumo.
 */
export const HALF_LIFE_HOURS = 120;
export const ABSORPTION_RATE = 0.08;
export const INJECTION_SITES = [
  'ABD_SUP_DIR', 'ABD_INF_DIR', 'ABD_SUP_ESQ', 'ABD_INF_ESQ',
  'COXA_DIR', 'COXA_ESQ', 'BRACO_DIR', 'BRACO_ESQ',
] as const;
export type InjectionSite = typeof INJECTION_SITES[number];
export interface InjectionRecord {
  id: string;
  doseMg: number;
  site: InjectionSite;
  appliedAt: string;
  doctorPrescribedConfirmed: boolean;
  fourFingersRuleConfirmed: boolean;
}
export type CyclePhase = 'NO_DATA' | 'ABSORPTION' | 'PEAK_ACTION' | 'STABLE_PLATEAU' | 'HALF_LIFE_TAIL';
export interface CycleStatus {
  estimatedActiveMg: number;
  hoursSinceLastInjection: number | null;
  phase: CyclePhase;
  phaseTitle: string;
  digestiveAdvice: string;
  isPeakWindow: boolean;
}

export function phaseForHours(hours: number | null): CyclePhase {
  if (hours === null) return 'NO_DATA';
  if (hours < 24) return 'ABSORPTION';
  if (hours <= 72) return 'PEAK_ACTION';
  if (hours <= 120) return 'STABLE_PLATEAU';
  return 'HALF_LIFE_TAIL';
}
const phaseCopy: Record<CyclePhase, [string, string]> = {
  NO_DATA: ['Aguardando primeira aplicação', 'Registre uma aplicação para visualizar a estimativa.'],
  ABSORPTION: ['Absorção inicial', 'Acompanhe como você se sente e respeite seu ritmo.'],
  PEAK_ACTION: ['Janela de pico estimada', 'Se houver desconforto, experimente pequenos goles e porções menores.'],
  STABLE_PLATEAU: ['Estabilidade no modelo', 'Mantenha sua rotina de alimentação e hidratação conforme orientação profissional.'],
  HALF_LIFE_TAIL: ['Final do ciclo', 'O apetite pode variar. Observe seus sinais com gentileza.'],
};

export function calculatePharmacokinetics(
  injections: readonly InjectionRecord[], now: Date = new Date(),
): CycleStatus {
  const timestamp = now.getTime();
  if (!Number.isFinite(timestamp)) throw new Error('Data de avaliação inválida.');
  let total = 0;
  let latestHours: number | null = null;
  const ids = new Set<string>();
  for (const injection of injections) {
    if (ids.has(injection.id)) throw new Error('Aplicação duplicada.');
    ids.add(injection.id);
    const applied = Date.parse(injection.appliedAt);
    if (!Number.isFinite(applied) || !Number.isFinite(injection.doseMg) || injection.doseMg <= 0)
      throw new Error('Aplicação inválida.');
    const hours = (timestamp - applied) / 3_600_000;
    // Uma aplicação futura não contribui para a soma nem define a fase atual.
    if (hours < 0) continue;
    latestHours = latestHours === null ? hours : Math.min(latestHours, hours);
    // Sem corte artificial de 720h: todas as doses anteriores contribuem.
    total += injection.doseMg * (-Math.expm1(-ABSORPTION_RATE * hours))
      * Math.pow(0.5, hours / HALF_LIFE_HOURS);
  }
  const phase = phaseForHours(latestHours);
  return {
    estimatedActiveMg: total, hoursSinceLastInjection: latestHours, phase,
    phaseTitle: phaseCopy[phase][0], digestiveAdvice: phaseCopy[phase][1],
    isPeakWindow: phase === 'PEAK_ACTION',
  };
}

export function getRecommendedInjectionSites(lastSite: InjectionSite | null, hasLowThighFat: boolean) {
  const blocked = INJECTION_SITES.filter(site =>
    site === lastSite || (hasLowThighFat && site.startsWith('COXA_')));
  const available = INJECTION_SITES.filter(site => !blocked.includes(site));
  const opposite = lastSite?.endsWith('_DIR') ? '_ESQ' : '_DIR';
  return {
    recommended: lastSite ? available.filter(site => site.endsWith(opposite)) : available,
    available, blocked,
    ruleReminder: 'Regra do projeto: 4 dedos (aprox. 8–10 cm) do umbigo. Confirme a técnica com sua equipe de saúde e as instruções da caneta.',
  };
}
