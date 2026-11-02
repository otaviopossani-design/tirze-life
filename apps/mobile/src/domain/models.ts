import { z } from 'zod';
import { INJECTION_SITES } from '../utils/pharmacokinetics';

export const DOSES = [2.5, 5, 7.5, 10, 12.5, 15] as const;
export const EVENT_TYPES = ['ALCOOL_CERVEJA', 'BEBIDA_COM_GAS', 'FRITURA_GORDURA', 'DOCE', 'REFEICAO_LIVRE'] as const;
export const timestampSchema = z.iso.datetime({ offset: true });
const doseSchema = z.number().refine(value => DOSES.some(dose => dose === value), 'Dose não suportada.');
export const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  medication: z.literal('TIRZEPATIDE'),
  currentWeightKg: z.number().finite().min(20).max(400),
  targetWeightKg: z.number().finite().min(20).max(400),
  heightCm: z.number().int().min(80).max(250),
  currentDoseMg: doseSchema,
  preferredInjectionDay: z.number().int().min(0).max(6),
  preferredInjectionTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  hasLowThighFat: z.boolean(),
  hasFluidRestriction: z.boolean(),
  timeZone: z.string().refine(value => {
    try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
  }, 'Fuso horário inválido.'),
  dailyProteinGoalG: z.number().int().positive(),
  baseWaterGoalMl: z.number().int().positive(),
  isProSubscriber: z.boolean(),
});
export type UserProfile = z.infer<typeof profileSchema>;
export const injectionSchema = z.object({
  id: z.string().uuid(), doseMg: doseSchema, site: z.enum(INJECTION_SITES),
  appliedAt: timestampSchema, doctorPrescribedConfirmed: z.boolean(),
  fourFingersRuleConfirmed: z.boolean(),
});
export const eventSchema = z.object({
  id: z.string().uuid(), eventType: z.enum(EVENT_TYPES),
  quantity: z.number().int().min(1).max(100),
  stoppedBySatiety: z.boolean(), loggedAt: timestampSchema,
});
export type RealLifeEvent = z.infer<typeof eventSchema>;
export const symptomSchema = z.object({
  id: z.string().uuid(), loggedAt: timestampSchema,
  heartburnLevel: z.number().int().min(1).max(5),
  bloatingLevel: z.number().int().min(1).max(5),
});
export type SymptomRecord = z.infer<typeof symptomSchema>;
export const resultSchema = z.object({
  eventId: z.string().uuid(), day: z.string(),
  waterAdjustmentMl: z.number().int().nonnegative(),
  dailyWaterAdjustmentMl: z.number().int().nonnegative(),
  dynamicWaterGoalMl: z.number().int().positive().nullable(),
  estimatedActiveMg: z.number().finite().nonnegative(),
  hoursSinceLastInjection: z.number().nonnegative().nullable(),
  phase: z.enum(['NO_DATA', 'ABSORPTION', 'PEAK_ACTION', 'STABLE_PLATEAU', 'HALF_LIFE_TAIL']),
  digestiveWarning: z.boolean(), message: z.string(), guidance: z.array(z.string()),
  modelNotice: z.string(),
});
export type LifeEventResult = z.infer<typeof resultSchema>;
export const recordedEventSchema = eventSchema.extend({ result: resultSchema });
export type RealLifeEventRecord = z.infer<typeof recordedEventSchema>;
export const nutritionSchema = z.object({
  id: z.string().uuid(), loggedAt: timestampSchema,
  kind: z.enum(['water', 'protein']), amount: z.number().finite().positive().max(10000),
});
export type NutritionRecord = z.infer<typeof nutritionSchema>;

export function dayKey(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find(value => value.type === type)!.value;
  return [part('year'), part('month'), part('day')].join('-');
}
export function waterAdjustment(event: RealLifeEvent): number {
  return event.eventType === 'ALCOOL_CERVEJA' ? event.quantity * 250 : 0;
}
