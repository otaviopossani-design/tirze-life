import { z } from 'zod';
import { localDate, daysAgo } from './care';

const idSchema = z.string().min(1).max(100);
const text = (max: number) => z.string().min(1, 'Preencha o texto.').max(max).refine(v => v.trim().length > 0, 'Preencha o texto.');
export const coordinationDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
 const date = new Date(value + 'T12:00:00'); return !Number.isNaN(date.getTime()) && localDate(date) === value;
}, 'Informe uma data válida.');
const timestamp = z.iso.datetime({ offset: true });
export const instructionCategories = ['nutrition', 'movement', 'routine'] as const;
export const journalCategories = ['note', 'symptom', 'medication', 'water', 'checkin', 'moment'] as const;
export const reviewReasons = ['understanding', 'schedule', 'resources', 'discomfort', 'conflicting', 'other'] as const;
export const instructionVersionSchema = z.object({
 revision: z.number().int().positive(), title: text(150), body: text(3000),
 category: z.enum(instructionCategories), professional: text(120), updatedAt: timestamp,
});
export const instructionInputSchema = instructionVersionSchema.omit({ revision: true, updatedAt: true }).extend({ id: idSchema });
export const instructionSchema = instructionInputSchema.extend({
 revision: z.number().int().positive(), versions: z.array(instructionVersionSchema).min(1).max(500),
}).refine(v => {
 const latest = v.versions[v.versions.length - 1];
 return !!latest && v.versions.every((item, index) => item.revision === index + 1) &&
 latest.revision === v.revision && latest.title === v.title && latest.body === v.body &&
 latest.category === v.category && latest.professional === v.professional;
}, 'Histórico de versões inconsistente.');
export type InstructionVersion = z.infer<typeof instructionVersionSchema>;
export type Instruction = z.infer<typeof instructionSchema>;
export type InstructionInput = z.infer<typeof instructionInputSchema>;
export const journalEntrySchema = z.object({
 id: idSchema, category: z.enum(journalCategories), originalText: text(5000),
 occurredAt: timestamp, recordedAt: timestamp, amountMl: z.number().int().min(1).max(10000).optional(),
 medicationName: text(120).optional(), doseText: text(100).optional(), explicitNotDone: z.boolean().optional(),
 supersedesEntryId: idSchema.optional(),
}).refine(v => v.amountMl === undefined || (v.category === 'water' && !v.explicitNotDone), 'Quantidade de água incompatível com o registro.')
 .refine(v => (!v.medicationName && !v.doseText) || v.category === 'medication', 'Informe a medicação na categoria correspondente.');
export type JournalEntry = z.infer<typeof journalEntrySchema>;
export const reviewResponseSchema = z.object({
 id: idSchema, authorRole: z.enum(['team', 'patient']), author: text(120), text: text(3000),
 createdAt: timestamp, outcome: z.enum(['resolved', 'still_difficult']).optional(),
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;
export const reviewRequestInputSchema = z.object({
 id: idSchema, instructionId: idSchema, reason: z.enum(reviewReasons), originalText: text(3000),
});
export const reviewRequestSchema = reviewRequestInputSchema.extend({
 instructionSnapshot: instructionVersionSchema, createdAt: timestamp, updatedAt: timestamp,
 status: z.enum(['open', 'in_review', 'awaiting_patient', 'resolved']),
 assignedTo: z.string().max(120), dueDate: z.union([z.literal(''), coordinationDateSchema]),
 responses: z.array(reviewResponseSchema).max(1000),
});
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;
export const expectationSchema = z.object({
 id: idSchema, category: z.enum(['checkin', 'water', 'medication']),
 frequency: z.enum(['daily', 'weekly']), startDate: coordinationDateSchema, enabled: z.boolean(),
});
export type Expectation = z.infer<typeof expectationSchema>;
const uniqueIds = (items: { id: string }[]) => new Set(items.map(item => item.id)).size === items.length;
export const coordinationRecordSchema = z.object({
 version: z.literal(1), patientId: idSchema, savedAt: z.string().min(1),
 instructions: z.array(instructionSchema).max(1000),
 requests: z.array(reviewRequestSchema).max(5000),
 journal: z.array(journalEntrySchema).max(20000), expectations: z.array(expectationSchema).max(100),
}).superRefine((record, ctx) => {
 for (const key of ['instructions', 'requests', 'journal', 'expectations'] as const) {
  if (!uniqueIds(record[key])) ctx.addIssue({ code: 'custom', path: [key], message: 'Identificadores duplicados.' });
 }
 for (const request of record.requests) {
  const instruction = record.instructions.find(item => item.id === request.instructionId);
  const version = instruction?.versions.find(item => item.revision === request.instructionSnapshot.revision);
  if (!version || JSON.stringify(version) !== JSON.stringify(request.instructionSnapshot))
   ctx.addIssue({ code: 'custom', path: ['requests'], message: 'Orientação original não encontrada.' });
  if (!uniqueIds(request.responses)) ctx.addIssue({ code: 'custom', path: ['requests'], message: 'Respostas duplicadas.' });
 }
 const superseded = new Set<string>();
 record.journal.forEach((entry, index) => {
  if (entry.supersedesEntryId) {
   if (!record.journal.slice(0, index).some(previous => previous.id === entry.supersedesEntryId) || superseded.has(entry.supersedesEntryId))
    ctx.addIssue({ code: 'custom', path: ['journal'], message: 'Referência de correção inválida.' });
   superseded.add(entry.supersedesEntryId);
  }
 });
});
export type CoordinationRecord = z.infer<typeof coordinationRecordSchema>;
export function activeJournalEntries(record: Pick<CoordinationRecord, 'journal'>) {
 const replaced = new Set(record.journal.map(entry => entry.supersedesEntryId).filter(Boolean));
 return record.journal.filter(entry => !replaced.has(entry.id));
}
export type MissingExpectedEntry = {
 expectationId: string; category: Expectation['category']; periodStart: string; periodEnd: string; label: 'Sem registro';
};
function shiftDate(date: string, count: number) {
 const value = new Date(date + 'T12:00:00'); value.setDate(value.getDate() + count); return localDate(value);
}
/** Completed local calendar periods only. Missing entries never imply an activity was not done. */
export function missingExpectedEntries(record: CoordinationRecord, today = localDate(), maxDays = 14): MissingExpectedEntry[] {
 coordinationDateSchema.parse(today);
 const limit = Math.max(1, Math.min(14, Math.floor(maxDays) || 14));
 const earliest = shiftDate(today, -limit);
 const entries = activeJournalEntries(record);
 const result: MissingExpectedEntry[] = [];
 for (const expectation of record.expectations.filter(item => item.enabled)) {
  if (expectation.startDate >= today) continue;
  const length = expectation.frequency === 'weekly' ? 7 : 1;
  const diff = Math.floor((Date.parse(earliest + 'T12:00:00Z') - Date.parse(expectation.startDate + 'T12:00:00Z')) / 86400000);
  let start = shiftDate(expectation.startDate, Math.max(0, Math.floor(diff / length)) * length);
  for (; start < today; start = shiftDate(start, length)) {
   const end = shiftDate(start, length - 1);
   if (end >= today || end < earliest) continue;
   const found = entries.some(entry => {
    const day = localDate(new Date(entry.occurredAt));
    return entry.category === expectation.category && day >= start && day <= end;
   });
   if (!found) result.push({ expectationId: expectation.id, category: expectation.category, periodStart: start, periodEnd: end, label: 'Sem registro' });
  }
 }
 return result.sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
}
export function emptyCoordination(patientId: string): CoordinationRecord {
 return { version: 1, patientId, savedAt: 'empty-coordination-v1:' + patientId, instructions: [], requests: [], journal: [], expectations: [] };
}
export function demoCoordination(patientId: string): CoordinationRecord {
 const record = emptyCoordination(patientId);
 if (!/^TL-00[1-8]$/.test(patientId)) return record;
 record.savedAt = 'demo-coordination-v1:' + patientId;
 const updatedAt = new Date(daysAgo(3) + 'T12:00:00').toISOString();
 const version: InstructionVersion = {
  revision: 1, title: 'Conte como a orientação cabe na sua rotina',
  body: 'Exemplo de demonstração: registre dúvidas sobre a organização das refeições e conte à equipe quais horários ou recursos dificultam sua rotina. A revisão depende do profissional.',
  category: 'nutrition', professional: 'Equipe de nutrição (demonstração)', updatedAt,
 };
 record.instructions = [{ id: 'demo-routine', title: version.title, body: version.body, category: version.category, professional: version.professional, revision: 1, versions: [version] }];
 if (patientId === 'TL-001') {
  const waterAt = new Date(localDate() + 'T00:00:00').toISOString();
  record.journal = [{ id: 'demo-water-today', category: 'water', originalText: 'Exemplo fictício: 1.500 ml de água registrados para demonstrar o painel.', occurredAt: waterAt, recordedAt: waterAt, amountMl: 1500 }];
  record.requests = [{
   id: 'demo-review', instructionId: 'demo-routine', instructionSnapshot: { ...version }, reason: 'schedule',
   originalText: 'Exemplo fictício: trabalho em plantão e preciso conversar sobre os horários da minha rotina.',
   createdAt: updatedAt, updatedAt, status: 'open', assignedTo: '', dueDate: '', responses: [],
  }];
 }
 return record;
}
