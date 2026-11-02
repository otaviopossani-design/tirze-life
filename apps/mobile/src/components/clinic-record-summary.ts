import { z } from 'zod';
import { readCare } from '../store/care-store';
import { readCoordination } from '../store/coordination-store';
import { readRecord, recordKey } from '../store/nutrition-store';
import { activeJournalEntries } from '../domain/coordination';
import { daysAgo, localDate } from '../domain/care';

const mealLogsSchema = z.record(z.string(), z.object({
 food: z.string(), portion: z.string(), profile: z.string(),
 recordedAt: z.iso.datetime({ offset: true }),
}));
export type ClinicRecordSummary = {
 water: number | null;
 /** Compatibility field: percentage of today's meals recorded, never protein consumed. */
 protein: number | null;
 checkins: number | null;
 last: string;
 note: string;
 status: 'Em dia' | 'Retorno solicitado' | 'Plano a revisar' | 'Sem check-in';
};
function sources(patientId: string) {
 if (typeof window === 'undefined') throw new Error('O acompanhamento está disponível no navegador.');
 const care = readCare(patientId);
 if (!care || care.profile.channel !== 'clinic') throw new Error('Paciente sem vínculo com esta clínica.');
 const coordination = readCoordination(patientId);
 if (!coordination) throw new Error('Acompanhamento não encontrado.');
 const nutrition = readRecord(patientId);
 // Reuse the nutrition storage namespace; malformed data must surface, never become a zero.
 const mealsKey = recordKey('') + 'logs:' + encodeURIComponent(patientId);
 const meals = mealLogsSchema.parse(JSON.parse(localStorage.getItem(mealsKey) ?? '{}'));
 return { care, coordination, nutrition, meals };
}
function formattedDate(value: string) {
 if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(8, 10) + '/' + value.slice(5, 7) + '/' + value.slice(0, 4);
 return new Date(value).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
function timestamp(value: string) { return Date.parse(value.length === 10 ? value + 'T00:00:00' : value); }
export function getClinicRecordSummary(patientId: string): ClinicRecordSummary {
 const { care, coordination, nutrition, meals } = sources(patientId);
 const today = localDate(), sevenDaysAgo = daysAgo(6);
 const journal = activeJournalEntries(coordination);
 const todaysJournal = journal.filter(entry => localDate(new Date(entry.occurredAt)) === today);
 const waterEntries = todaysJournal.filter(entry => entry.category === 'water' && (entry.amountMl !== undefined || entry.explicitNotDone));
 const waterMl = waterEntries.reduce((sum, entry) => sum + (entry.explicitNotDone ? 0 : entry.amountMl ?? 0), 0);
 const target = nutrition?.published?.waterTarget;
 const plan = nutrition?.published;
 const dayIndex = (new Date().getDay() + 6) % 7;
 const todayMeals = plan?.days[dayIndex] ?? [];
 const completed = todayMeals.filter(meal => !!meals[today + ':' + nutrition?.revision + ':' + meal.id]).length;
 const checkinDays = new Set(journal.filter(entry => {
  const day = localDate(new Date(entry.occurredAt));
  return entry.category === 'checkin' && day >= sevenDaysAgo && day <= today;
 }).map(entry => localDate(new Date(entry.occurredAt))));
 const lastDates = [
  ...coordination.journal.map(entry => entry.recordedAt),
  ...Object.values(meals).map(entry => entry.recordedAt),
  ...care.logs.map(entry => entry.date), ...care.weights.map(entry => entry.date),
 ].filter(value => Number.isFinite(timestamp(value)) && timestamp(value) <= Date.now()).sort((a, b) => timestamp(b) - timestamp(a));
 const latestNote = journal.filter(entry => ['note', 'symptom', 'moment'].includes(entry.category))
  .sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt) || Date.parse(b.recordedAt) - Date.parse(a.recordedAt))[0];
 const activeRequests = coordination.requests.filter(request => request.status !== 'resolved');
 const status: ClinicRecordSummary['status'] = activeRequests.some(request => request.status === 'open' || request.status === 'awaiting_patient')
  ? 'Retorno solicitado' : activeRequests.some(request => request.status === 'in_review') ? 'Plano a revisar'
   : todaysJournal.some(entry => entry.category === 'checkin') ? 'Em dia' : 'Sem check-in';
 return {
  water: waterEntries.length && target ? Math.round(waterMl / target * 100) : null,
  protein: completed && todayMeals.length ? Math.round(completed / todayMeals.length * 100) : null,
  checkins: checkinDays.size || null,
  last: lastDates[0] ? formattedDate(lastDates[0]) : 'Sem registros',
  note: latestNote?.originalText ?? 'Sem relato livre registrado.',
  status,
 };
}
export function clinicRecordReport(patientId: string): string {
 const { care, coordination, nutrition, meals } = sources(patientId);
 const profile = care.profile;
 const originalJournal = [...coordination.journal].sort((a, b) => Date.parse(a.occurredAt) - Date.parse(b.occurredAt) || Date.parse(a.recordedAt) - Date.parse(b.recordedAt));
 const lines = [
  'TIRZELIFE — HISTÓRICO DE ACOMPANHAMENTO',
  'Demonstração local. Este arquivo contém dados sensíveis e não certifica revisão profissional.',
  'Exemplos semeados são fictícios; os demais conteúdos reproduzem os registros deste navegador.',
  'Gerado em: ' + new Date().toLocaleString('pt-BR'),
  '', 'CADASTRO', 'Identificador: ' + profile.id, 'Nome: ' + profile.name,
  'Nascimento: ' + formattedDate(profile.birthDate), 'Altura: ' + profile.heightCm + ' cm',
  'Peso informado no cadastro: ' + profile.weightKg + ' kg', 'Objetivo: ' + profile.goal,
  'Nível de atividade informado: ' + profile.level, 'Medicação informada: ' + profile.medication,
  'E-mail: ' + (profile.email || 'Não informado'), 'Telefone: ' + (profile.phone || 'Não informado'),
  'Limitações informadas: ' + (profile.limitations || 'Não informadas'),
  'Condições informadas: ' + (profile.conditions || 'Não informadas'),
  '', 'MEDIDAS REGISTRADAS',
  ...care.weights.map(item => formattedDate(item.date) + ' — ' + item.kg + ' kg'),
  '', 'ATIVIDADES REGISTRADAS',
  ...care.logs.map(item => formattedDate(item.date) + ' — ' + item.activity + ', ' + item.minutes + ' min, esforço: ' + item.effort + '\nRelato: ' + item.note),
  '', 'DIÁRIO — ORIGINAIS E CORREÇÕES',
 ];
 if (!originalJournal.length) lines.push('Sem registros.');
 for (const entry of originalJournal) {
  lines.push(
   '', 'ID: ' + entry.id + ' | Categoria: ' + entry.category,
   'Acontecimento: ' + entry.occurredAt + ' | Registro: ' + entry.recordedAt,
   'Relato original: ' + entry.originalText,
  );
  if (entry.supersedesEntryId) lines.push('Correção do registro: ' + entry.supersedesEntryId + ' (original preservado)');
  if (entry.explicitNotDone !== undefined) lines.push('Informou explicitamente não realização: ' + (entry.explicitNotDone ? 'Sim' : 'Não'));
  if (entry.amountMl !== undefined) lines.push('Água informada: ' + entry.amountMl + ' ml');
  if (entry.medicationName) lines.push('Medicação informada: ' + entry.medicationName);
  if (entry.doseText) lines.push('Dose relatada: ' + entry.doseText + ' — sem validação de prescrição');
 }
 lines.push('', 'ORIENTAÇÕES E TODAS AS VERSÕES REGISTRADAS');
 if (!coordination.instructions.length) lines.push('Sem orientações registradas.');
 for (const instruction of coordination.instructions) {
  lines.push('', 'ID: ' + instruction.id + ' | Versão vigente: ' + instruction.revision);
  for (const version of instruction.versions) lines.push(
   'Versão ' + version.revision + ' — ' + version.updatedAt,
   'Título: ' + version.title + ' | Categoria: ' + version.category + ' | Responsável informado: ' + version.professional,
   'Texto: ' + version.body,
  );
 }
 lines.push('', 'SOLICITAÇÕES DE REVISÃO');
 if (!coordination.requests.length) lines.push('Sem solicitações.');
 for (const request of coordination.requests) {
  lines.push('', 'ID: ' + request.id + ' | Situação: ' + request.status + ' | Motivo: ' + request.reason,
   'Criada: ' + request.createdAt + ' | Atualizada: ' + request.updatedAt,
   'Responsável: ' + (request.assignedTo || 'Não atribuído') + ' | Retorno combinado: ' + (request.dueDate || 'Não definido'),
   'Relato original: ' + request.originalText,
   'Orientação de origem: ' + request.instructionId + ', versão ' + request.instructionSnapshot.revision,
   'Título original: ' + request.instructionSnapshot.title,
   'Texto original da orientação: ' + request.instructionSnapshot.body);
  for (const response of request.responses) lines.push(
   'Resposta ' + response.id + ' — ' + response.createdAt + ' — ' + response.authorRole + ': ' + response.author,
   response.text + (response.outcome ? '\nConfirmação: ' + response.outcome : ''),
  );
 }
 lines.push('', 'REGISTROS ESPERADOS', 'Ausência de registro não significa que a atividade não foi realizada.');
 for (const expected of coordination.expectations) lines.push(expected.category + ' | ' + expected.frequency + ' | Início: ' + expected.startDate + ' | ' + (expected.enabled ? 'Ativo' : 'Pausado'));
 lines.push('', 'PLANO ALIMENTAR DISPONÍVEL', 'Versão publicada: ' + (nutrition?.revision ?? 'Nenhuma'),
  'Publicação: ' + (nutrition?.publishedAt || 'Sem data de publicação'),
  'Plano publicado (campos originais):', nutrition?.published ? JSON.stringify(nutrition.published, null, 2) : 'Nenhum.',
  '', 'Rascunho atual (não representa orientação publicada):', nutrition?.draft ? JSON.stringify(nutrition.draft, null, 2) : 'Nenhum.',
  '', 'REFEIÇÕES REGISTRADAS — SNAPSHOTS', 'Registros de refeição não medem proteína ou calorias consumidas.');
 for (const [key, meal] of Object.entries(meals).sort((a, b) => Date.parse(a[1].recordedAt) - Date.parse(b[1].recordedAt))) {
  lines.push('Registro: ' + key + ' | Data/hora: ' + meal.recordedAt + ' | Perfil: ' + meal.profile,
   'Alimento registrado: ' + meal.food, 'Porção registrada: ' + meal.portion);
 }
 return lines.join('\n');
}
