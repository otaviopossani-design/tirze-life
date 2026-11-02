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
  profile: UserProfile;
  injections: InjectionRecord[];
  realLifeEvents: RealLifeEventRecord[];
  todayWaterMl: number;
  todayProteinG: number;

  updateProfile: (updated: Partial<UserProfile>) => void;
  addInjection: (doseMg: number, site: InjectionSite) => void;
  deleteInjection: (id: string) => void;
  logRealLifeEvent: (eventType: RealLifeEventRecord['eventType'], quantity: number, stoppedBySatiety: boolean) => void;
  addWater: (ml: number) => void;
  addProtein: (grams: number) => void;
  getCycleStatus: () => CycleStatus;
  getSiteRecommendations: () => { recommended: InjectionSite[]; blocked: InjectionSite[]; ruleReminder: string };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: {
        fullName: 'Luiz Otávio',
        currentWeightKg: 90.0,
        targetWeightKg: 80.0,
        heightCm: 175,
        currentDoseMg: 2.5,
        hasLowThighFat: true,
        dailyProteinGoalG: 130,
        baseWaterGoalMl: 2500,
        isProSubscriber: false,
      },
      injections: [],
      realLifeEvents: [],
      todayWaterMl: 0,
      todayProteinG: 0,

      updateProfile: (updated) => set((state) => ({
        profile: { ...state.profile, ...updated }
      })),

      addInjection: (doseMg, site) => {
        const newInjection: InjectionRecord = {
          id: Math.random().toString(36).substring(2, 9),
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

      logRealLifeEvent: (eventType, quantity, stoppedBySatiety) => {
        let extraWater = 0;
        if (eventType === 'ALCOOL_CERVEJA') {
          extraWater = quantity * 250;
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
          baseWaterGoalMl: state.profile.baseWaterGoalMl + extraWater,
        }));
      },

      addWater: (ml) => set((state) => ({ todayWaterMl: state.todayWaterMl + ml })),
      addProtein: (grams) => set((state) => ({ todayProteinG: state.todayProteinG + grams })),

      getCycleStatus: () => {
        const { injections } = get();
        return calculatePharmacokinetics(injections);
      },

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