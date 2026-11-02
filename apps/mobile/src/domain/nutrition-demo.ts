import { makePlan, type NutritionRecord } from './nutrition';

// Fictional presentation fixtures only. No clinical assessment is implied.
const demoPatients: Record<string, [string, string]> = {
  'TL-001': ['Marina Oliveira', 'Tirzepatida'],
  'TL-002': ['Ricardo Almeida', 'Semaglutida'],
  'TL-003': ['Ana Beatriz Costa', 'Tirzepatida'],
  'TL-004': ['Carlos Mendes', 'Liraglutida'],
  'TL-005': ['Fernanda Lima', 'Semaglutida'],
  'TL-006': ['João Pedro Santos', 'Tirzepatida'],
  'TL-007': ['Camila Rocha', 'Semaglutida'],
  'TL-008': ['Paulo Henrique', 'Tirzepatida'],
};
export function demoNutritionRecord(id: string): NutritionRecord | null {
  const patient = demoPatients[id];
  if (!patient) return null;
  const plan = makePlan(id, patient[0], patient[1]);
  plan.enabledProfiles = ['nausea', 'constipation', 'diarrhea'];
  plan.reviewer = 'Equipe de nutrição · demonstração';
  plan.proteinTarget = 100;
  plan.waterTarget = 2000;
  plan.notes = 'Distribua as refeições ao longo do dia. Inclua uma fonte de proteína e respeite sua saciedade. As opções para sintomas estão disponíveis no seletor acima. Avise a equipe se não conseguir manter a alimentação ou a hidratação.';
  return {
    version: 1, revision: 1, draft: null, published: plan,
    savedAt: 'demo-presentation-v1:' + id, publishedAt: '2026-10-22T09:00:00-03:00',
  };
}
