import { z } from 'zod';

export const profiles = [
  { id: 'routine', label: 'Rotina habitual', icon: 'leaf', summary: 'Variedade, refeições possíveis e cuidado contínuo.', tips: ['Inclua fontes de proteína nas refeições, conforme seu plano.', 'Varie frutas, legumes, feijão e cereais. Carboidratos não precisam ser excluídos.', 'As metas de proteína e líquidos são individuais; não dependem apenas da dose.'] },
  { id: 'nausea', label: 'Enjoo / pouca fome', icon: 'heart', summary: 'Menos volume, mais conforto ao comer.', tips: ['Coma devagar e experimente porções menores, sem forçar até o desconforto.', 'Prefira preparações simples; frituras, gordura em excesso e cheiros fortes podem piorar o enjoo.', 'Beba em pequenos goles. Se estiver comendo muito pouco, procure sua equipe.'] },
  { id: 'constipation', label: 'Intestino preso', icon: 'drop', summary: 'Fibras e líquidos, com adaptação gradual.', tips: ['Aumente as fibras aos poucos, conforme tolerância.', 'Mantenha a hidratação orientada e movimento na rotina.', 'Não aumente fibras indiscriminadamente se houver dor ou distensão importante.'] },
  { id: 'diarrhea', label: 'Diarreia', icon: 'sun', summary: 'Hidratação e ajustes temporários.', tips: ['Mantenha líquidos ao longo do dia e avise a equipe se o quadro persistir.', 'Gordura, álcool, café e adoçantes como sorbitol podem agravar os sintomas.', 'A redução de fibras pode ser temporária. Reintroduza-as gradualmente após melhora.'] },
] as const;
export type Profile = typeof profiles[number]['id'];
export const weekdays = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const sourceLinks = [
  { title: 'Consenso nutricional de quatro sociedades · 2025', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12125019/' },
  { title: 'EASO, EFAD e ECPO · 2026', url: 'https://easo.org/nutritional-functional-and-psychological-considerations-for-obesity-management-medications-in-adults-an-easo-efad-and-ecpo-consensus-statement/' },
  { title: 'Manejo dos sintomas gastrointestinais · 2023', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9821052/' },
  { title: 'ADA · Nutrição e preservação muscular · 2026', url: 'https://doi.org/10.2337/doci25-0008' },
];
const text = z.string().max(2000);
const optionSchema = z.object({ food: text, portion: text });
const mealSchema = z.object({
  id: z.string().min(1).max(60), title: z.string().min(1).max(80),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  options: z.object({ routine: optionSchema, nausea: optionSchema, constipation: optionSchema, diarrhea: optionSchema }),
});
export const planSchema = z.object({
  patientId: z.string().min(1).max(80), patientName: z.string().min(1).max(80),
  medication: z.string().max(80), title: z.string().trim().min(1).max(100),
  restrictions: text, notes: text, reviewer: z.string().max(100),
  enabledProfiles: z.array(z.enum(['nausea', 'constipation', 'diarrhea'])).max(3),
  proteinTarget: z.number().positive().max(500).nullable(),
  waterTarget: z.number().positive().max(10000).nullable(),
  days: z.array(z.array(mealSchema).length(4)).length(7),
});
export type NutritionPlan = z.infer<typeof planSchema>;
export type Meal = z.infer<typeof mealSchema>;
export const recordSchema = z.object({
  version: z.literal(1), revision: z.number().int().nonnegative(),
  draft: planSchema.nullable(), published: planSchema.nullable(),
  savedAt: z.string(), publishedAt: z.string().nullable(),
}).superRefine((r, ctx) => {
  if (r.draft && r.published && r.draft.patientId !== r.published.patientId)
    ctx.addIssue({code: 'custom', message: 'Paciente inconsistente'});
});
export type NutritionRecord = z.infer<typeof recordSchema>;
export function makePlan(patientId = 'TL-001', patientName = 'Marina Oliveira', medication = 'Tirzepatida'): NutritionPlan {
  const mains = ['Frango grelhado', 'Peixe assado', 'Omelete de legumes', 'Tofu grelhado', 'Carne magra cozida', 'Frango desfiado', 'Peixe cozido'];
  const meals: Meal[] = [
    { id: 'breakfast', title: 'Café da manhã', time: '08:00', options: {
      routine: { food: 'Ovos mexidos, pão integral e mamão', portion: '2 ovos + 1 fatia de pão + 1 fatia de mamão' },
      nausea: { food: 'Iogurte natural e banana amassada', portion: '1 pote (170 g) + ½ banana, conforme tolerância' },
      constipation: { food: 'Iogurte natural, mamão e aveia', portion: '1 pote (170 g) + 1 fatia de mamão + 1 colher de aveia' },
      diarrhea: { food: 'Ovo mexido e pão branco', portion: '1 ovo + 1 fatia de pão, com pouca gordura' },
    }},
    { id: 'lunch', title: 'Almoço', time: '12:30', options: {
      routine: { food: 'Frango grelhado, arroz, feijão e legumes', portion: '100 g de frango + 3 colheres de arroz + ½ concha de feijão + legumes' },
      nausea: { food: 'Frango desfiado com purê de batata e cenoura', portion: '80 g de frango + 2 colheres de purê + cenoura cozida' },
      constipation: { food: 'Frango, arroz integral, feijão e abobrinha', portion: '100 g de frango + 3 colheres de arroz + ½ concha de feijão + abobrinha' },
      diarrhea: { food: 'Frango cozido, arroz branco e cenoura', portion: '100 g de frango + 3 colheres de arroz + cenoura cozida' },
    }},
    { id: 'snack', title: 'Lanche da tarde', time: '16:00', options: {
      routine: { food: 'Iogurte natural e fruta', portion: '1 pote (170 g) + 1 fruta pequena' },
      nausea: { food: 'Iogurte natural em pequena porção', portion: '½ pote (85 g), se tolerado' },
      constipation: { food: 'Iogurte natural, fruta e aveia', portion: '1 pote (170 g) + 1 fruta + 1 colher de aveia' },
      diarrhea: { food: 'Banana madura e torrada simples', portion: '1 banana pequena + 1 torrada' },
    }},
    { id: 'dinner', title: 'Jantar', time: '19:30', options: {
      routine: { food: 'Peixe assado, batata e legumes', portion: '100 g de peixe + 1 batata pequena + legumes' },
      nausea: { food: 'Sopa de legumes com frango desfiado', portion: '1 tigela pequena com 80 g de frango' },
      constipation: { food: 'Omelete, legumes e pão integral', portion: '2 ovos + legumes + 1 fatia de pão' },
      diarrhea: { food: 'Peixe cozido com batata e abobrinha', portion: '100 g de peixe + 1 batata pequena + abobrinha' },
    }},
  ];
  return { patientId, patientName, medication, title: 'Cuidado à mesa', restrictions: '', notes: 'Coma devagar e respeite sua saciedade. Converse com a equipe se não conseguir manter a alimentação ou a hidratação.', reviewer: '', enabledProfiles: [], proteinTarget: null, waterTarget: null,
    days: weekdays.map((_, day) => meals.map(m => {
      const copy: Meal = JSON.parse(JSON.stringify(m));
      if (m.id === 'lunch') copy.options.routine.food = mains[day] + ', arroz, feijão e legumes';
      if (m.id === 'lunch') copy.options.routine.portion = ['100 g de frango', '100 g de peixe', 'Omelete com 2 ovos', '150 g de tofu', '100 g de carne', '100 g de frango', '100 g de peixe'][day] + ' + 3 colheres de arroz + ½ concha de feijão + legumes';
      return copy;
    })),
  };
}
export function publicationErrors(plan: NutritionPlan): string[] {
  const errors: string[] = [];
  if (!planSchema.safeParse(plan).success) return ['Revise os campos: há um valor inválido no plano.'];
  if (!plan.reviewer.trim()) errors.push('Informe o nome de quem revisou o plano.');
  for (const [day, meals] of plan.days.entries()) {
    for (const meal of meals) {
      for (const profile of ['routine', ...plan.enabledProfiles] as Profile[]) {
        const o = meal.options[profile];
        if (!o.food.trim() || !o.portion.trim() || /definir quantidade/i.test(o.portion))
          errors.push(weekdays[day] + ': revise alimento e porção de ' + meal.title + ' (' + profiles.find(p => p.id === profile)?.label + ').');
      }
    }
  }
  return errors;
}
export function formatDate(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}
export function weekDates(now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  start.setDate(start.getDate() - (start.getDay() + 6) % 7);
  return weekdays.map((label, i) => {
    const date = new Date(start); date.setDate(start.getDate() + i);
    return { label, date: formatDate(date), number: date.getDate(), index: i };
  });
}
