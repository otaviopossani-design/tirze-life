import { resultSchema, type RealLifeEvent, type SymptomRecord, type UserProfile } from '../domain/models';
import type { InjectionRecord } from '../utils/pharmacokinetics';

export interface EvaluationRequest {
  profile: UserProfile; injections: InjectionRecord[];
  events: RealLifeEvent[]; symptoms: SymptomRecord[]; event: RealLifeEvent;
}
export async function evaluateRealLifeEvent(payload: EvaluationRequest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8010';
    const response = await fetch(base + '/v1/real-life/evaluate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    if (!response.ok) throw new Error('Não foi possível analisar o registro. Verifique os dados e tente novamente.');
    return resultSchema.parse(await response.json());
  } finally { clearTimeout(timeout); }
}
