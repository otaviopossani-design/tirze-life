import { useEffect, useState } from 'react';
import { z } from 'zod';
import { recordSchema, planSchema, publicationErrors, type NutritionPlan, type NutritionRecord } from '../domain/nutrition';

import { demoNutritionRecord } from '../domain/nutrition-demo';

const prefix = 'tirzelife-nutrition-demo-v1:';
const eventName = 'tirzelife-nutrition-updated';
export function recordKey(id: string) { return prefix + encodeURIComponent(id); }
export function readRecord(id: string): NutritionRecord | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(recordKey(id));
  if (!raw) return demoNutritionRecord(id);
  const record = recordSchema.parse(JSON.parse(raw));
  if ((record.draft && record.draft.patientId !== id) || (record.published && record.published.patientId !== id))
    throw new Error('O plano salvo pertence a outro paciente.');
  return record;
}
export function listPlanPatients(): NutritionPlan[] {
  if (typeof window === 'undefined') return [];
  const plans: NutritionPlan[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(prefix) || key.startsWith(prefix + 'logs:')) continue;
      try {
        const id = decodeURIComponent(key.slice(prefix.length));
        const record = readRecord(id);
        const plan = record?.draft ?? record?.published;
        if (plan) plans.push(plan);
      } catch { /* A malformed record must not prevent other patient cards from rendering. */ }
    }
  } catch { return []; }
  return plans;
}
export function saveRecord(plan: NutritionPlan, publish: boolean, expectedSavedAt: string | null): NutritionRecord {
  if (!planSchema.safeParse(plan).success) throw new Error('Revise o nome do plano, os horários e as metas antes de salvar.');
  const current = readRecord(plan.patientId);
  if ((current?.savedAt ?? null) !== expectedSavedAt)
    throw new Error('Este plano mudou em outra aba. Reabra a ficha para carregar a versão atual antes de salvar.');
  if (publish) {
    const errors = publicationErrors(plan);
    if (errors.length) throw new Error(errors[0]);
  }
  const next = recordSchema.parse({
    version: 1, revision: (current?.revision ?? 0) + (publish ? 1 : 0),
    draft: structuredClone(plan), published: publish ? structuredClone(plan) : current?.published ?? null,
    savedAt: new Date().toISOString() + ':' + crypto.randomUUID(),
    publishedAt: publish ? new Date().toISOString() : current?.publishedAt ?? null,
  });
  try { localStorage.setItem(recordKey(plan.patientId), JSON.stringify(next)); }
  catch { throw new Error('Não foi possível salvar neste navegador. Verifique o espaço e a permissão de armazenamento e tente novamente.'); }
  window.dispatchEvent(new CustomEvent(eventName));
  return next;
}
export function useNutritionRecord(id: string) {
  const [record, setRecord] = useState<NutritionRecord | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const refresh = () => {
      try { setRecord(readRecord(id)); setError(''); }
      catch { setRecord(null); setError('Não foi possível ler o plano local. A equipe precisa verificar os dados antes de continuar.'); }
    };
    const onStorage = (e: StorageEvent) => { if (!e.key || e.key === recordKey(id)) refresh(); };
    refresh(); window.addEventListener('storage', onStorage); window.addEventListener(eventName, refresh);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(eventName, refresh); };
  }, [id]);
  const visible = record && (record.draft ?? record.published)?.patientId === id ? record : null;
  return { record: visible, error };
}
const logSchema = z.record(z.string(), z.object({
  food: z.string(), portion: z.string(), recordedAt: z.string(), profile: z.string(),
}));
export type MealLogs = z.infer<typeof logSchema>;
export function useMealLogs(id: string) {
  const key = prefix + 'logs:' + encodeURIComponent(id);
  const [logs, setLogs] = useState<MealLogs>({});
  const [loadedKey, setLoadedKey] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    const refresh = () => {
      try { setLogs(logSchema.parse(JSON.parse(localStorage.getItem(key) ?? '{}'))); setLoadedKey(key); setError(''); }
      catch { setLogs({}); setError('Não foi possível ler os registros de refeições.'); }
    };
    const onStorage = (e: StorageEvent) => { if (!e.key || e.key === key) refresh(); };
    refresh(); window.addEventListener('storage', onStorage); window.addEventListener(eventName, refresh);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener(eventName, refresh); };
  }, [key]);
  function toggle(logId: string, value: MealLogs[string]) {
    try {
      const next = logSchema.parse(JSON.parse(localStorage.getItem(key) ?? '{}'));
      if (next[logId]) delete next[logId]; else next[logId] = value;
      localStorage.setItem(key, JSON.stringify(next)); setLogs(next); setError('');
      window.dispatchEvent(new CustomEvent(eventName));
    } catch { setError('Não foi possível salvar a refeição neste navegador. Tente novamente.'); }
  }
  return { logs: loadedKey === key ? logs : {}, toggle, error };
}
