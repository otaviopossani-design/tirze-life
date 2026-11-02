import { describe, it, expect, vi } from 'vitest';
import cases from '../../../fixtures/pharmacokinetics.json';
import { calculatePharmacokinetics, getRecommendedInjectionSites, type InjectionRecord } from '../src/utils/pharmacokinetics';
import { createAppStore } from '../src/store/useAppStore';
import { dayKey, type LifeEventResult } from '../src/domain/models';

const at = new Date('2026-01-15T12:00:00Z');
const profile = {
  fullName: 'Pessoa de teste', medication: 'TIRZEPATIDE' as const,
  currentWeightKg: 80, targetWeightKg: 70, heightCm: 170, currentDoseMg: 2.5,
  preferredInjectionDay: 0, preferredInjectionTime: '09:00', hasLowThighFat: true,
  hasFluidRestriction: false, timeZone: 'America/Sao_Paulo',
};
function memory() {
  const map = new Map<string, string>();
  return { getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => { map.set(key, value); },
    removeItem: (key: string) => { map.delete(key); } };
}
const evaluate = vi.fn(async (data): Promise<LifeEventResult> => ({
  eventId: data.event.id, day: '2026-01-15', waterAdjustmentMl: data.event.quantity * 250,
  dailyWaterAdjustmentMl: data.event.quantity * 250, dynamicWaterGoalMl: 3800,
  estimatedActiveMg: 0, hoursSinceLastInjection: null, phase: 'NO_DATA',
  digestiveWarning: false, message: 'Registro acolhido.', guidance: [], modelNotice: 'Modelo.',
}));
const create = () => createAppStore(memory(), () => crypto.randomUUID(), evaluate);

describe('farmacocinética: contrato compartilhado com Python', () => {
  for (const fixture of cases) it(fixture.name, () => {
    const records: InjectionRecord[] = fixture.ages.map((hours, index) => ({
      id: String(index), doseMg: 2.5, site: 'ABD_SUP_DIR',
      appliedAt: new Date(at.getTime() - hours * 3_600_000).toISOString(),
      doctorPrescribedConfirmed: true, fourFingersRuleConfirmed: true,
    }));
    const result = calculatePharmacokinetics(records, at);
    expect(result.phase).toBe(fixture.phase);
    expect(result.estimatedActiveMg).toBeCloseTo(fixture.expectedMg, 12);
  });
  it('exclui coxas e último local, mantendo braços e lado oposto', () => {
    const sites = getRecommendedInjectionSites('ABD_SUP_DIR', true);
    expect(sites.blocked).toEqual(expect.arrayContaining(['ABD_SUP_DIR', 'COXA_DIR', 'COXA_ESQ']));
    expect(sites.recommended).toContain('BRACO_ESQ');
    expect(sites.recommended.every(site => site.endsWith('_ESQ'))).toBe(true);
  });
});
describe('store', () => {
  it('inicializa vazia e exige prescrição para perfil e alteração de dose', () => {
    const store = create();
    expect(store.getState().hydrated).toBe(true);
    expect(() => store.getState().updateProfile(profile)).toThrow('prescrita');
    store.getState().updateProfile(profile, true);
    expect(store.getState().profile?.baseWaterGoalMl).toBe(2800);
    expect(store.getState().profile?.dailyProteinGoalG).toBe(112);
    expect(() => store.getState().updateProfile({ currentDoseMg: 5 })).toThrow('prescrita');
    expect(() => store.getState().updateProfile({ currentWeightKg: NaN })).toThrow();
  });
  it('soma eventos, não modifica base e reverte ajuste ao remover', async () => {
    const store = create(); store.getState().updateProfile(profile, true);
    await store.getState().logRealLifeEvent({
      eventType: 'ALCOOL_CERVEJA', quantity: 4, stoppedBySatiety: true, loggedAt: at.toISOString(),
    });
    await store.getState().logRealLifeEvent({
      eventType: 'BEBIDA_COM_GAS', quantity: 2, stoppedBySatiety: false, loggedAt: at.toISOString(),
    });
    expect(store.getState().getDailySummary(at).dynamicWaterGoalMl).toBe(3800);
    expect(store.getState().profile?.baseWaterGoalMl).toBe(2800);
    store.getState().deleteRealLifeEvent(store.getState().realLifeEvents[0]!.id);
    expect(store.getState().getDailySummary(at).dynamicWaterGoalMl).toBe(2800);
  });
  it('separa dias no fuso do perfil e não acumula metas ontem/hoje', async () => {
    const store = create(); store.getState().updateProfile(profile, true);
    store.getState().addWater(250, new Date('2026-01-15T02:59:00Z'));
    expect(store.getState().getDailySummary(new Date('2026-01-15T03:00:00Z')).waterMl).toBe(0);
    expect(dayKey('2026-01-15T02:59:00Z', profile.timeZone)).toBe('2026-01-14');
    await store.getState().logRealLifeEvent({
      eventType: 'ALCOOL_CERVEJA', quantity: 4, stoppedBySatiety: true, loggedAt: at.toISOString(),
    });
    expect(store.getState().getDailySummary(new Date('2026-01-16T12:00:00Z')).dynamicWaterGoalMl).toBe(2800);
  });
  it('suspende a meta automática com restrição de líquidos', () => {
    const store = create(); store.getState().updateProfile({ ...profile, hasFluidRestriction: true }, true);
    expect(store.getState().getDailySummary(at).dynamicWaterGoalMl).toBeNull();
  });
  it('falha de API não cria registro parcial', async () => {
    const store = createAppStore(memory(), () => crypto.randomUUID(), async () => { throw new Error('offline'); });
    store.getState().updateProfile(profile, true);
    await expect(store.getState().logRealLifeEvent({
      eventType: 'ALCOOL_CERVEJA', quantity: 4, stoppedBySatiety: true, loggedAt: at.toISOString(),
    })).rejects.toThrow('offline');
    expect(store.getState().realLifeEvents).toHaveLength(0);
  });
  it('restaura dados e apaga todo o histórico', async () => {
    const storage = memory(); const first = createAppStore(storage);
    first.getState().updateProfile(profile, true);
    first.getState().addWater(250, at);
    const restored = createAppStore(storage);
    expect(restored.getState().getDailySummary(at).waterMl).toBe(250);
    await restored.getState().clearAllData();
    expect(restored.getState().profile).toBeNull();
    expect(createAppStore(storage).getState().nutrition).toEqual([]);
  });
  it('não ressuscita um registro em voo após apagar os dados', async () => {
    let resolve!: (value: LifeEventResult) => void;
    const pending = new Promise<LifeEventResult>(done => { resolve = done; });
    const store = createAppStore(memory(), () => crypto.randomUUID(), () => pending);
    store.getState().updateProfile(profile, true);
    const task = store.getState().logRealLifeEvent({
      eventType: 'ALCOOL_CERVEJA', quantity: 1, stoppedBySatiety: true, loggedAt: at.toISOString(),
    });
    await store.getState().clearAllData();
    resolve(await evaluate({ event: { id: crypto.randomUUID(), quantity: 1 } }));
    await expect(task).rejects.toThrow('mudaram');
    expect(store.getState().realLifeEvents).toHaveLength(0);
  });
});
