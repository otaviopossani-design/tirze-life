import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makePlan, publicationErrors, weekDates, formatDate } from '../src/domain/nutrition';
import { readRecord, recordKey, saveRecord } from '../src/store/nutrition-store';

describe('nutrition publication and weekly plan', () => {
  beforeEach(() => {
    const memory = new Map<string, string>();
    vi.stubGlobal('localStorage', {getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k,v)});
    vi.stubGlobal('window', new EventTarget());
  });
  function reviewed() { const plan = makePlan('TEST-001'); plan.reviewer = 'Equipe de teste'; return plan; }
  it('separates drafts from published data and preserves the last publication', () => {
    const plan = reviewed();
    const first = saveRecord(plan, false, null);
    expect(first.published).toBeNull();
    const published = saveRecord(plan, true, first.savedAt);
    plan.days[0]![0]!.options.routine.food = 'Novo alimento em rascunho';
    const next = saveRecord(plan, false, published.savedAt);
    expect(next.revision).toBe(1);
    expect(next.published!.days[0]![0]!.options.routine.food).not.toContain('rascunho');
    expect(next.draft!.days[0]![0]!.options.routine.food).toContain('rascunho');
  });
  it('requires review and complete portions for enabled adaptations only', () => {
    const plan = reviewed();
    plan.days[4]![1]!.options.nausea.portion = '';
    expect(publicationErrors(plan)).toEqual([]);
    plan.enabledProfiles = ['nausea'];
    expect(publicationErrors(plan)[0]).toContain('Sexta');
    expect(() => saveRecord(plan,true,null)).toThrow();
    plan.enabledProfiles = [];
    plan.reviewer = ' ';
    expect(publicationErrors(plan)[0]).toContain('nome');
  });
  it('rejects incomplete routine meals and invalid goals', () => {
    const plan = reviewed();
    plan.days[0]![0]!.options.routine.food = ' ';
    expect(publicationErrors(plan).length).toBeGreaterThan(0);
    plan.proteinTarget = -1;
    expect(publicationErrors(plan)[0]).toContain('inválido');
  });
  it('prevents a stale editor from overwriting a newer draft', () => {
    const plan = reviewed();
    const first = saveRecord(plan, false, null);
    saveRecord(plan, true, first.savedAt);
    expect(() => saveRecord(plan, false, first.savedAt)).toThrow('outra aba');
    expect(readRecord(plan.patientId)!.revision).toBe(1);
  });
  it('keeps patient records independent and rejects mismatched or malformed data', () => {
    const plan = reviewed(); const saved = saveRecord(plan, true, null);
    expect(readRecord('TEST-002')).toBeNull();
    localStorage.setItem(recordKey('TEST-002'), JSON.stringify(saved));
    expect(() => readRecord('TEST-002')).toThrow('outro paciente');
    localStorage.setItem(recordKey('TEST-001'), '{');
    expect(() => readRecord('TEST-001')).toThrow();
  });
  it('does not report a successful publication when storage fails', () => {
    vi.stubGlobal('localStorage', {getItem: () => null, setItem: () => {throw new Error('QuotaExceeded');}});
    expect(() => saveRecord(reviewed(), true, null)).toThrow('Não foi possível salvar');
  });
  it('isolates day edits and does not derive diet from medication', () => {
    const plan = makePlan('X', 'Paciente', 'Semaglutida');
    plan.days[0]![0]!.options.routine.food = 'Editado';
    expect(plan.days[1]![0]!.options.routine.food).not.toBe('Editado');
    expect(makePlan('Y', 'Outro', 'Tirzepatida').days).toEqual(makePlan('Z','Outro','Semaglutida').days);
  });
  it('provides complete fictional plans without overwriting saved edits', () => {
    for (let i = 1; i <= 8; i++) {
      const id = 'TL-' + String(i).padStart(3, '0');
      const seeded = readRecord(id)!;
      expect(seeded.published!.enabledProfiles).toHaveLength(3);
      expect(publicationErrors(seeded.published!)).toEqual([]);
      expect(seeded.published!.reviewer).toContain('demonstração');
    }
    const seeded = readRecord('TL-001')!;
    const plan = structuredClone(seeded.published!);
    plan.title = 'Meu plano personalizado';
    const saved = saveRecord(plan, false, seeded.savedAt);
    expect(readRecord('TL-001')!.draft!.title).toBe(plan.title);
    expect(readRecord('TL-001')!.published!.title).toBe('Cuidado à mesa');
    expect(saved.revision).toBe(1);
    expect(readRecord('unknown')).toBeNull();
  });
  it('builds a Monday-to-Sunday week across a month and year boundary', () => {
    const dates = weekDates(new Date(2027, 0, 1, 12));
    expect(dates[0]!.date).toBe('2026-12-28');
    expect(dates[6]!.date).toBe('2027-01-03');
    expect(formatDate(new Date(2026, 9, 22, 12))).toBe('2026-10-22');
  });
});
