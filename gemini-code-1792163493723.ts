import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  InjectionRecord, 
  InjectionSite, 
  calculatePharmacokinetics, 
  getRecommendedInjectionSites,
  CycleStatus 
} from '../utils/pharmacokinetics';

export interface UserProfile {
  fullName: string;
  currentWeightKg: number;
  targetWeightKg: number;
  heightCm: number;
  currentDoseMg: number;
  hasLowThighFat: boolean; // Se true, desativa coxas por falta de gordura subcutânea
  dailyProteinGoalG: number;
  baseWaterGoalMl: number;
  isProSubscriber: boolean;
}

export interface RealLifeEventRecord {
  id: string;
  eventType: 'ALCOOL_CERVEJA' | 'BEBIDA_COM_GAS' | 'FRITURA_GORDURA' | 'DOCE' | 'REFEICAO_LIVRE';
  quantity: number;
  stoppedBySatiety: boolean;
  waterAdjustmentMl: number;
  loggedAt: string;
}

interface AppState {
  // Estado
  profile: UserProfile;
  injections: InjectionRecord[];
  realLifeEvents: RealLifeEventRecord[];
  todayWaterMl: number;
  todayProteinG: number;

  // Ações de Perfil
  updateProfile: (updated: Partial<UserProfile>) => void;

  // Ações de Injeção
  addInjection: (doseMg: number, site: InjectionSite) => void;
  deleteInjection: (id: string) => void;

  // Ações do "Modo Vida Real" & Nutrição
  logRealLifeEvent: (eventType: RealLifeEventRecord['eventType'], quantity: number, stoppedBySatiety: boolean) => void;
  addWater: (ml: number) => void;
  addProtein: (grams: number) => void;

  // Getters Computados (Helpers)
  getCycleStatus: () => CycleStatus;
  getSiteRecommendations: () => { recommended: InjectionSite[]; blocked: InjectionSite[]; ruleReminder: string };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Estado Inicial Padrão
      profile: {
        fullName: 'Luiz Otávio',
        currentWeightKg: 90.0,
        targetWeightKg: 80.0,
        heightCm: 175,
        currentDoseMg: 2.5,
        hasLowThighFat: true, // Padrão seguro: bloqueia coxas se não houver gordura subcutânea
        dailyProteinGoalG: 130,
        baseWaterGoalMl: 2500,
        isProSubscriber: false,
      },
      injections: [],
      realLifeEvents: [],
      todayWaterMl: 0,
      todayProteinG: 0,

      // Atualizar Perfil
      updateProfile: (updated) => set((state) => ({
        profile: { ...state.profile, ...updated }
      })),

      // Adicionar Nova Injeção (Gera ID e timestamp ISO)
      addInjection: (doseMg, site) => {
        const newInjection: InjectionRecord = {
          id: Math.random().toString(36.substring(2, 9)),
          doseMg,
          site,
          appliedAt: new Date().toISOString(),
        };

        set((state) => ({
          injections: [newInjection, ...state.injections],
          profile: { ...state.profile, currentDoseMg: doseMg }
        }));
      },

      deleteInjection: (id) => set((state) => ({
        injections: state.injections.filter((inj) => inj.id !== id)
      })),

      // Registrar Evento do "Modo Vida Real" com Acolhimento e Ajuste Automático de Água
      logRealLifeEvent: (eventType, quantity, stoppedBySatiety) => {
        let extraWater = 0;

        // Regra de Hidratação Dinâmica para Cerveja / Bebidas
        if (eventType === 'ALCOOL_CERVEJA') {
          extraWater = quantity * 250; // +250ml de água pura por lata/copo de cerveja
        } else if (eventType === 'BEBIDA_COM_GAS') {
          extraWater = quantity * 100;
        }

        const newEvent: RealLifeEventRecord = {
          id: Math.random().toString(36).substring(2, 9),
          eventType,
          quantity,
          stoppedBySatiety,
          waterAdjustmentMl: extraWater,
          loggedAt: new Date().toISOString(),
        };

        set((state) => ({
          realLifeEvents: [newEvent, ...state.realLifeEvents],
          baseWaterGoalMl: state.profile.baseWaterGoalMl + extraWater, // Recalcula meta do dia sem culpa
        }));
      },

      addWater: (ml) => set((state) => ({ todayWaterMl: state.todayWaterMl + ml })),
      addProtein: (grams) => set((state) => ({ todayProteinG: state.todayProteinG + grams })),

      // Conecta diretamente ao motor farmacocinético criado na fundação
      getCycleStatus: () => {
        const { injections } = get();
        return calculatePharmacokinetics(injections);
      },

      // Conecta ao algoritmo de rodízio e biotipo da coxa
      getSiteRecommendations: () => {
        const { injections, profile } = get();
        const lastSite = injections.length > 0 ? injections[0].site : null;
        return getRecommendedInjectionSites(lastSite, profile.hasLowThighFat);
      },
    }),
    {
      name: 'tirze-life-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);