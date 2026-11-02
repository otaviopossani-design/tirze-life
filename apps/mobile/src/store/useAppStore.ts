import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { z } from 'zod';
import {
  profileSchema, injectionSchema, eventSchema, symptomSchema, nutritionSchema,
  recordedEventSchema, dayKey, waterAdjustment,
  type UserProfile, type RealLifeEvent, type RealLifeEventRecord,
  type SymptomRecord, type NutritionRecord, type LifeEventResult,
} from '../domain/models';
import {
  calculatePharmacokinetics, getRecommendedInjectionSites, type InjectionRecord,
} from '../utils/pharmacokinetics';
import { privateStorage, createId } from '../storage/privateStorage';
import { evaluateRealLifeEvent, type EvaluationRequest } from '../services/realLifeApi';

const persistedSchema = z.object({
  profile: profileSchema.nullable(),
  injections: z.array(injectionSchema),
  realLifeEvents: z.array(recordedEventSchema),
  symptoms: z.array(symptomSchema),
  nutrition: z.array(nutritionSchema),
});
type StoredData = z.infer<typeof persistedSchema>;
type ProfileInput = Omit<UserProfile, 'baseWaterGoalMl' | 'dailyProteinGoalG' | 'isProSubscriber'>;
interface AppState extends StoredData {
  hydrated: boolean;
  finishHydration: () => void;
  hydrationError: string | null;
  updateProfile: (patch: Partial<ProfileInput>, doctorPrescribedConfirmed?: boolean) => void;
  addInjection: (input: Omit<InjectionRecord, 'id'>) => void;
  deleteInjection: (id: string) => void;
  logRealLifeEvent: (input: Omit<RealLifeEvent, 'id'>) => Promise<LifeEventResult>;
  deleteRealLifeEvent: (id: string) => void;
  addSymptom: (input: Omit<SymptomRecord, 'id'>) => void;
  addWater: (ml: number, at?: Date) => void;
  addProtein: (grams: number, at?: Date) => void;
  getDailySummary: (at?: Date) => {
    day: string; waterMl: number; proteinG: number;
    extraWaterMl: number; dynamicWaterGoalMl: number | null; proteinGoalG: number;
  };
  getCycleStatus: (at?: Date) => ReturnType<typeof calculatePharmacokinetics>;
  getSiteRecommendations: () => ReturnType<typeof getRecommendedInjectionSites>;
  exportData: () => string;
  clearAllData: () => Promise<void>;
}
const empty = (): StoredData => ({ profile: null, injections: [], realLifeEvents: [], symptoms: [], nutrition: [] });
function assertPast(iso: string) {
  if (Date.parse(iso) > Date.now()) throw new Error('Registre apenas acontecimentos que já ocorreram.');
}
export function createAppStore(
  storage: StateStorage = privateStorage,
  idFactory: () => string = createId,
  evaluate: (request: EvaluationRequest) => Promise<LifeEventResult> = evaluateRealLifeEvent,
) {
  // Geração invalida respostas em voo após limpar dados ou mudar o perfil.
  let generation = 0;
  return create<AppState>()(persist((set, get) => {
    const ready = () => {
      if (!get().hydrated || get().hydrationError) throw new Error('Aguarde a leitura segura dos dados locais.');
    };
    const profile = () => {
      ready();
      const value = get().profile;
      if (!value) throw new Error('Configure seu perfil primeiro.');
      return value;
    };
    const addNutrition = (kind: 'water' | 'protein', amount: number, at = new Date()) => {
      profile();
      const item = nutritionSchema.parse({ id: idFactory(), kind, amount, loggedAt: at.toISOString() });
      assertPast(item.loggedAt);
      set(state => ({ nutrition: [...state.nutrition, item] }));
    };
    return {
      ...empty(), hydrated: false, hydrationError: null,
      finishHydration: () => set({ hydrated: true }),
      updateProfile(patch, doctorPrescribedConfirmed = false) {
        ready();
        const previous = get().profile;
        const merged = { ...previous, ...patch };
        if ((!previous || merged.currentDoseMg !== previous.currentDoseMg) && !doctorPrescribedConfirmed)
          throw new Error('Confirme que a dosagem foi prescrita pelo seu médico.');
        const validated = profileSchema.parse({
          ...merged,
          // Metas do projeto: peso atual para água; peso-alvo como referência configurada para proteína.
          baseWaterGoalMl: Math.round((merged.currentWeightKg ?? 0) * 35),
          dailyProteinGoalG: Math.ceil((merged.targetWeightKg ?? 0) * 1.6),
          isProSubscriber: previous?.isProSubscriber ?? false,
        });
        generation++;
        set({ profile: validated });
      },
      addInjection(input) {
        profile();
        const injection = injectionSchema.parse({ ...input, id: idFactory() });
        assertPast(injection.appliedAt);
        if (!injection.doctorPrescribedConfirmed)
          throw new Error('Confirme a prescrição desta aplicação.');
        if (injection.site.startsWith('ABD_') && !injection.fourFingersRuleConfirmed)
          throw new Error('Confirme a orientação do local abdominal.');
        // Histórico registra o que ocorreu, inclusive local repetido; sugestões usam a trava.
        set(state => ({
          injections: [...state.injections, injection].sort((a, b) => Date.parse(b.appliedAt) - Date.parse(a.appliedAt)),
        }));
        generation++;
      },
      deleteInjection(id) {
        ready(); generation++;
        set(state => ({ injections: state.injections.filter(item => item.id !== id) }));
      },
      async logRealLifeEvent(input) {
        const currentProfile = profile();
        const event = eventSchema.parse({ ...input, id: idFactory() });
        assertPast(event.loggedAt);
        const version = generation;
        const snapshot = get();
        // Nenhum registro parcial é salvo se a API estiver indisponível.
        const result = await evaluate({
          profile: currentProfile, injections: snapshot.injections, symptoms: snapshot.symptoms,
          events: snapshot.realLifeEvents.map(({ result: _result, ...record }) => record), event,
        });
        if (version !== generation) throw new Error('Os dados mudaram durante a análise. Tente novamente.');
        if (result.eventId !== event.id) throw new Error('Resposta incompatível com o registro.');
        generation++;
        set(state => ({ realLifeEvents: [...state.realLifeEvents, { ...event, result }] }));
        return result;
      },
      deleteRealLifeEvent(id) {
        ready(); generation++;
        set(state => ({ realLifeEvents: state.realLifeEvents.filter(item => item.id !== id) }));
      },
      addSymptom(input) {
        profile();
        const symptom = symptomSchema.parse({ ...input, id: idFactory() });
        assertPast(symptom.loggedAt);
        generation++;
        set(state => ({ symptoms: [...state.symptoms, symptom] }));
      },
      addWater: (ml, at) => addNutrition('water', ml, at),
      addProtein: (grams, at) => addNutrition('protein', grams, at),
      getDailySummary(at = new Date()) {
        const current = get();
        const zone = current.profile?.timeZone ?? 'America/Sao_Paulo';
        const day = dayKey(at.toISOString(), zone);
        const today = (iso: string) => dayKey(iso, zone) === day && Date.parse(iso) <= at.getTime();
        const records = current.nutrition.filter(item => today(item.loggedAt));
        const extra = current.realLifeEvents.filter(item => today(item.loggedAt))
          .reduce((sum, event) => sum + waterAdjustment(event), 0);
        return {
          day, waterMl: records.filter(item => item.kind === 'water').reduce((sum, item) => sum + item.amount, 0),
          proteinG: records.filter(item => item.kind === 'protein').reduce((sum, item) => sum + item.amount, 0),
          extraWaterMl: extra,
          dynamicWaterGoalMl: !current.profile || current.profile.hasFluidRestriction
            ? null : current.profile.baseWaterGoalMl + extra,
          proteinGoalG: current.profile?.dailyProteinGoalG ?? 0,
        };
      },
      getCycleStatus: (at = new Date()) => calculatePharmacokinetics(get().injections, at),
      getSiteRecommendations() {
        const { injections, profile: current } = get();
        const latest = [...injections].filter(item => Date.parse(item.appliedAt) <= Date.now())
          .sort((a, b) => Date.parse(b.appliedAt) - Date.parse(a.appliedAt))[0];
        return getRecommendedInjectionSites(latest?.site ?? null, current?.hasLowThighFat ?? true);
      },
      exportData: () => JSON.stringify(persistedSchema.parse(get()), null, 2),
      async clearAllData() {
        ready(); generation++;
        set(empty());
        await storage.removeItem('tirze-life-v1');
      },
    };
  }, {
    name: 'tirze-life-v1', version: 1,
    storage: createJSONStorage(() => storage),
    partialize: state => ({
      profile: state.profile, injections: state.injections, realLifeEvents: state.realLifeEvents,
      symptoms: state.symptoms, nutrition: state.nutrition,
    }),
    merge: (saved, current) => ({ ...current, ...(saved === undefined ? {} : persistedSchema.parse(saved)) }),
    onRehydrateStorage: () => (state, error) => {
      if (state && !error) { state.finishHydration(); }
      // Em caso de corrupção, hydrated permanece false: não sobrescrever o histórico.
    },
  }));
}
export const useAppStore = createAppStore();
