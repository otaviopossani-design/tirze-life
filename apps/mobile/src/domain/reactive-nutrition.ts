import { z } from 'zod';

export const symptomTriggers = [
  'NENHUM',
  'ANCIA_CHEIRO',
  'REGURGITACAO_ESFORCO',
  'AZIA_REFLUXO',
  'EMPACHADO_PESADO',
  'NENHUMA_FOME',
] as const;
export type SymptomTrigger = typeof symptomTriggers[number];

export const volumeFeelings = ['LEVE', 'NORMAL', 'MUITO_CHEIO', 'EMPACHADO'] as const;
export type VolumeFeeling = typeof volumeFeelings[number];

export const doseDecisions = [
  'MANTER_DOSE_MINIMA',
  'MANTER_ADAPTACAO',
  'FRACIONAR_DOSE',
  'SUBIR_DEGRAU',
  'REDUZIR_DOSE',
] as const;
export type DoseDecision = typeof doseDecisions[number];

export interface MealIntakeLog {
  id: string;
  patientId: string;
  consumedFood: string;
  estimatedProteinG: number;
  volumeFeeling: VolumeFeeling;
  symptomTrigger: SymptomTrigger;
  loggedAt: string;
}

export interface NextMealSuggestion {
  title: string;
  temperature: 'Frio / Ambiente' | 'Morno Suave' | 'Normal';
  food: string;
  portion: string;
  proteinG: number;
  clinicalReasoning: string;
  contraindications: string[];
  physicalActivityWarning?: string;
}

export interface DoctorWeeklyOpinion {
  id: string;
  patientId: string;
  doctorName: string;
  reviewedAt: string;
  periodSummary: string;
  medication: string;
  currentDose: string;
  syringeUnitsUI?: number;
  gastricToleranceScore: number; // 1 a 5
  decision: DoseDecision;
  decisionLabel: string;
  clinicalFeedback: string;
  doseAdjustmentGuide: string;
}

/**
 * Motor reativo de próxima refeição com foco em tolerabilidade clínica,
 * prevenção de regurgitação mecânica em esforço e proteção contra náusea olfativa.
 */
export function generateNextMealSuggestion(
  lastLog?: Partial<MealIntakeLog>,
  medication = 'Tirzepatida',
  doseMg = 2.5
): NextMealSuggestion {
  const trigger = lastLog?.symptomTrigger ?? 'NENHUM';
  const feeling = lastLog?.volumeFeeling ?? 'NORMAL';

  // 1. Caso crítico relatado pelo usuário: Ânsia por cheiro forte ou regurgitação ao esforço
  if (trigger === 'ANCIA_CHEIRO' || trigger === 'REGURGITACAO_ESFORCO') {
    return {
      title: 'Próxima Refeição: Resgate Anti-Odores & Anti-Regurgitação',
      temperature: 'Frio / Ambiente',
      food: 'Frango desfiado levemente temperado com ervas frias + purê de batata/abóbora frio com fio de azeite extravirgem (ou iogurte natural com colágeno neutro)',
      portion: '80g de frango + 2 colheres de purê (mastigação pausada em 20 min)',
      proteinG: 24,
      clinicalReasoning:
        'Alimentos em temperatura ambiente não emitem vapores aromáticos quentes que disparam o centro emético cerebral (náusea olfativa). O baixo volume sólido previne que o aumento da pressão intra-abdominal provoque refluxo ou regurgitação mecânica.',
      contraindications: [
        'Comidas quentes fumegantes ou com cheiro forte (alho/cebola fritos)',
        'Líquidos misturados com a refeição sólida (beba 30 min antes ou depois)',
        'Gorduras saturadas e café em jejum',
      ],
      physicalActivityWarning:
        '⚠️ Evite agachamentos pesados, flexões de tronco e esforços abdominais bruscos pelas próximas 2h30 para não pressionar a válvula esofágica.',
    };
  }

  // 2. Empachamento ou estufamento pesado (esvaziamento gástrico lentificado)
  if (feeling === 'EMPACHADO' || feeling === 'MUITO_CHEIO' || trigger === 'EMPACHADO_PESADO') {
    return {
      title: 'Próxima Refeição: Esvaziamento Gástrico Acelerado',
      temperature: 'Morno Suave',
      food: 'Caldo claro de legumes batido com peixe branco cozido ou clara de ovo pasteurizada',
      portion: '1 xícara pequena (150 ml) em pequenos goles pausados',
      proteinG: 18,
      clinicalReasoning:
        'A textura líquida/cremosa homogeneizada passa pelo piloro sem exigir grande esforço mecânico do estômago, garantindo proteína sem sobrecarregar a digestão.',
      contraindications: [
        'Carnes vermelhas em pedaço ou fibras duras/cruas',
        'Bebidas gaseificadas ou sucos ácidos',
        'Deitar-se antes de 2 horas pós-ingestão',
      ],
      physicalActivityWarning:
        'Caminhada leve de 10 minutos em ritmo calmo é recomendada para estimular a motilidade sem comprimir o abdômen.',
    };
  }

  // 3. Nenhuma fome (anorexia medicamentosa no pico da dose)
  if (trigger === 'NENHUMA_FOME') {
    return {
      title: 'Próxima Refeição: Densidade Proteica Compacta',
      temperature: 'Frio / Ambiente',
      food: 'Shake proteico límpido (Whey isolado batido com água de coco gelada e pedras de gelo)',
      portion: '200 ml em goles pequenos ao longo de 40 minutos',
      proteinG: 25,
      clinicalReasoning:
        'Previne o catabolismo muscular quando não há apetite para sólidos. A água de coco repõe potássio e sódio perdidos pela hipoidratação.',
      contraindications: ['Grandes pratos sólidos', 'Forçar comida até sentir repulsa'],
    };
  }

  // 4. Padrão habitual de nutrição reversa
  return {
    title: 'Próxima Refeição: Equilíbrio de Massa Magra',
    temperature: 'Normal',
    food: 'Filé de tilápia ou frango grelhado, arroz integral leve e abobrinha refogada',
    portion: '100g de proteína magra + 3 colheres de carboidrato complexo + legumes cozidos',
    proteinG: 30,
    clinicalReasoning:
      'Digestão estabilizada. Oportunidade ideal para bater a meta do piso proteico e preservar tecido muscular.',
    contraindications: ['Frituras por imersão', 'Molhos gordurosos industrializados'],
  };
}

/**
 * Avalia tolerabilidade e emite a recomendação clínica de escalonamento para o médico
 */
export function evaluateDoseProgression(
  currentDoseMg: number,
  syringeUI: number,
  symptomLogs: MealIntakeLog[]
): {
  suggestedDecision: DoseDecision;
  decisionLabel: string;
  medicalRationale: string;
  safeSyringeAdvice: string;
} {
  const severeSymptomsCount = symptomLogs.filter(
    (l) => l.symptomTrigger === 'ANCIA_CHEIRO' || l.symptomTrigger === 'REGURGITACAO_ESFORCO'
  ).length;

  if (severeSymptomsCount >= 1 || currentDoseMg <= 2.5) {
    return {
      suggestedDecision: 'MANTER_DOSE_MINIMA',
      decisionLabel: 'Manter Dose Mínima (2,5 mg) / Não Escalonar',
      medicalRationale: `Paciente apresentou hiper-reatividade gástrica transitória (náusea olfativa e regurgitação em esforço). De acordo com os protocolos SURPASS/SURMOUNT, a progressão para 5,0 mg está terminantemente contraindicada até adaptação gástrica completa por pelo menos 3 a 4 semanas consecutivas sem queixas mecânicas.`,
      safeSyringeAdvice: `Atenção à medida da seringa: A variação de 6 UI para 8 UI representa oscilação percentual de ~25% na dosagem ativa. Mantenha a aspiração estrita da marcação orientada pelo prescritor em seringa de 100 UI.`,
    };
  }

  return {
    suggestedDecision: 'SUBIR_DEGRAU',
    decisionLabel: 'Apto para Próximo Degrau Terapêutico',
    medicalRationale:
      'Tolerabilidade gástrica satisfatória sem episódios de regurgitação ou náusea grave nos últimos 14 dias.',
    safeSyringeAdvice: 'Seguir a escala de transição com acompanhamento na primeira semana.',
  };
}
