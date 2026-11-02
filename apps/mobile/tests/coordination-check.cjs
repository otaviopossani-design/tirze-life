const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const origin = process.env.TIRZELIFE_TEST_ORIGIN || 'http://localhost:8081';
const key = id => 'tirzelife-coordination-demo-v1:' + encodeURIComponent(id);
const root = page => page.getByTestId('coordination-root');
const request = (page, text) => root(page).getByTestId('review-request').filter({ hasText: text });
const button = (scope, name) => scope.getByRole('button', { name, exact: true });
const label = (scope, name) => scope.getByLabel(new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
async function tab(page, name) {
  await root(page).getByRole('navigation', { name: 'Áreas do acompanhamento', exact: true })
    .getByRole('button', { name: new RegExp('^' + name) }).click();
}
async function read(page, id = 'TL-001') {
  return page.evaluate(k => JSON.parse(localStorage.getItem(k)), key(id));
}
async function saved(page, predicate, args = {}) {
  await page.waitForFunction(({ storageKey, source, args }) => {
    const data = JSON.parse(localStorage.getItem(storageKey));
    return data && new Function('data', 'args', 'return (' + source + ')(data, args)')(data, args);
  }, { storageKey: key(args.patientId || 'TL-001'), source: predicate.toString(), args });
}
async function dates(page) {
  return page.evaluate(() => {
    const date = days => {
      const d = new Date(); d.setDate(d.getDate() - days);
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    };
    return { today: date(0), yesterday: date(1), two: date(2), three: date(3), four: date(4) };
  });
}
async function addEntry(page, { category, when, text, medication, notDone }) {
  await tab(page, 'Histórico');
  await label(root(page), 'Assunto').selectOption(category);
  await label(root(page), 'Quando aconteceu').fill(when);
  await label(root(page), 'Seu relato original').fill(text);
  if (medication) await label(root(page), 'Nome informado (opcional)').fill(medication);
  if (notDone) await root(page).getByRole('checkbox').check();
  await button(root(page), 'Salvar no histórico').click();
  await root(page).getByTestId('journal-entry').filter({ hasText: text }).waitFor();
  assert.equal(await label(root(page), 'Seu relato original').inputValue(), '');
}
async function clinicPatient(page, name = 'Marina Oliveira') {
  await page.goto(origin + '/clinica', { waitUntil: 'networkidle' });
  await button(page, 'Abrir ficha de ' + name).click();
  await page.getByRole('tab', { name: 'Plano combinado', exact: true }).click();
  await root(page).waitFor();
}
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({
    viewport: { width: 1500, height: 1100 }, timezoneId: 'America/Sao_Paulo',
    reducedMotion: 'reduce', acceptDownloads: true,
  });
  context.setDefaultTimeout(15000);
  const patient = await context.newPage(), clinic = await context.newPage(), other = await context.newPage();
  const errors = [];
  for (const page of [patient, clinic, other]) page.on('pageerror', e => errors.push(e.message));
  const difficulty = 'QA plantão sem geladeira: preciso rever o horário da refeição.';
  const firstResponse = 'QA equipe: vamos combinar uma alternativa para seu plantão.';
  const secondResponse = 'QA equipe: a revisão foi explicada e será reavaliada no próximo encontro.';
  const revisedInstruction = 'QA versão revisada: converse com a equipe sobre a organização durante o plantão.';
  try {
    await patient.goto(origin + '/?view=care&paciente=TL-001', { waitUntil: 'networkidle' });
    await root(patient).waitFor();
    assert.match(await root(patient).innerText(), /Demonstração local/);
    await clinicPatient(clinic);

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Create the request through the actual patient form.
    await button(root(patient), 'Isso não funciona para mim').click();
    await label(root(patient), 'Motivo').selectOption('schedule');
    await label(root(patient), 'Conte com suas palavras').fill(difficulty);
    await button(root(patient), 'Pedir revisão').click();
    await request(patient, difficulty).waitFor();
    await saved(patient, (data, args) => data.requests.some(r => r.originalText === args.text), { text: difficulty });
    const created = (await read(patient)).requests.find(r => r.originalText === difficulty);
    assert.equal(created.status, 'open');
    assert.equal(created.instructionSnapshot.revision, 1);
    const originalSnapshot = structuredClone(created.instructionSnapshot);

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Revise the source instruction and prove the request retains its original snapshot.
    await button(root(clinic), 'Revisar orientação').click();
    await label(root(clinic), 'Orientação').fill(revisedInstruction);
    await button(root(clinic), 'Publicar orientação').click();
    await saved(clinic, data => data.instructions[0].revision === 2);
    assert.deepEqual((await read(clinic)).requests.find(r => r.id === created.id).instructionSnapshot, originalSnapshot);
    await tab(clinic, 'Revisões');
    await request(clinic, difficulty).waitFor();
    await label(root(clinic), 'Mostrar').selectOption('all');
    await label(root(patient), 'Mostrar').selectOption('all');
    const clinicalRequest = request(clinic, difficulty);
    await clinicalRequest.getByText('Orientação original do pedido · versão 1', { exact: true }).click();
    await clinicalRequest.getByText(originalSnapshot.body, { exact: true }).waitFor();

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // The clinic assigns ownership and responds, without a patient reload.
    await label(clinicalRequest, 'Responsável pela revisão').fill('Nutrição QA');
    const date = await dates(patient);
    await label(clinicalRequest, 'Prazo combinado (opcional)').fill(date.today);
    await button(clinicalRequest, 'Salvar responsável').click();
    await saved(clinic, (data, args) => data.requests.find(r => r.id === args.id).status === 'in_review', { id: created.id });
    await label(clinicalRequest, 'Autor da resposta').fill('Nutrição QA');
    await label(clinicalRequest, 'Resposta para o paciente').fill(firstResponse);
    await button(clinicalRequest, 'Enviar resposta').click();
    await request(patient, difficulty).getByText(firstResponse, { exact: true }).waitFor();
    await button(request(patient, difficulty), 'Ainda está difícil').waitFor();
    assert.equal((await read(patient)).requests.find(r => r.id === created.id).status, 'awaiting_patient');

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Patient reopens the request, then confirms resolution after a new team response.
    await label(request(patient, difficulty), 'Seu retorno (opcional)').fill('QA ainda falta esclarecer como organizar o plantão.');
    await button(request(patient, difficulty), 'Ainda está difícil').click();
    await clinicalRequest.getByText('QA ainda falta esclarecer como organizar o plantão.', { exact: true }).waitFor();
    await saved(clinic, (data, args) => data.requests.find(r => r.id === args.id).status === 'open', { id: created.id });
    await label(clinicalRequest, 'Autor da resposta').fill('Nutrição QA');
    await label(clinicalRequest, 'Resposta para o paciente').fill(secondResponse);
    await button(clinicalRequest, 'Enviar resposta').click();
    await request(patient, difficulty).getByText(secondResponse, { exact: true }).waitFor();
    await label(request(patient, difficulty), 'Seu retorno (opcional)').fill('QA agora entendi e a dificuldade foi resolvida.');
    await button(request(patient, difficulty), 'Resolveu minha dificuldade').click();
    await clinicalRequest.getByText('Resolvida pelo paciente', { exact: true }).waitFor();
    const resolved = (await read(patient)).requests.find(r => r.id === created.id);
    assert.equal(resolved.status, 'resolved');
    assert.equal(resolved.responses.length, 4);
    assert.equal(resolved.responses[1].outcome, 'still_difficult');
    assert.equal(resolved.responses[3].outcome, 'resolved');
    assert.deepEqual(resolved.instructionSnapshot, originalSnapshot);

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Both sides persist after reload; read receipt is never inferred from delivery.
    await patient.reload({ waitUntil: 'networkidle' });
    await tab(patient, 'Revisões');
    await label(root(patient), 'Mostrar').selectOption('all');
    await request(patient, difficulty).getByText(secondResponse, { exact: true }).waitFor();
    await clinicPatient(clinic);
    await tab(clinic, 'Revisões');
    await label(root(clinic), 'Mostrar').selectOption('all');
    await request(clinic, difficulty).getByText('Resolvida pelo paciente', { exact: true }).waitFor();

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // A later entry may describe an older event. Optional medication dose stays unknown.
    const symptom = 'QA relato recente: desconforto informado, sem conclusão de causa.';
    const medication = 'QA aplicação anterior relatada; não lembro a dose.';
    const note = 'QA anotação intermediária sobre minha rotina.';
    const notDone = 'QA não realizei a caminhada, informado explicitamente.';
    await addEntry(patient, { category: 'symptom', when: date.yesterday + 'T12:00', text: symptom });
    await addEntry(patient, { category: 'medication', when: date.three + 'T12:00', text: medication, medication: 'Medicação relatada QA' });
    await addEntry(patient, { category: 'note', when: date.two + 'T12:00', text: note });
    await addEntry(patient, { category: 'note', when: date.yesterday + 'T13:00', text: notDone, notDone: true });
    await tab(clinic, 'Histórico');
    await root(clinic).getByTestId('journal-entry').filter({ hasText: medication }).waitFor();
    const journal = (await read(patient)).journal;
    assert.equal(journal.find(j => j.originalText === medication).doseText, undefined);
    assert.ok(new Date(journal.find(j => j.originalText === medication).recordedAt) > new Date(journal.find(j => j.originalText === medication).occurredAt));
    assert.equal(journal.find(j => j.originalText === notDone).explicitNotDone, true);
    const visibleTexts = await root(patient).getByTestId('journal-entry').allTextContents();
    const indexOf = text => visibleTexts.findIndex(t => t.includes(text));
    assert.ok(indexOf(notDone) < indexOf(symptom));
    assert.ok(indexOf(symptom) < indexOf(note));
    assert.ok(indexOf(note) < indexOf(medication));
    await root(patient).getByTestId('journal-entry').filter({ hasText: notDone })
      .getByText('Paciente informou que não realizou a ação.', { exact: false }).waitFor();

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Missing scheduled information is distinct from a patient reporting non-performance.
    const journalBeforeExpectation = structuredClone((await read(patient)).journal);
    await button(root(clinic), 'Combinar frequência').click();
    await label(root(clinic), 'Assunto esperado').selectOption('water');
    await label(root(clinic), 'Frequência de registro').selectOption('daily');
    await label(root(clinic), 'Início do combinado').fill(date.three);
    await button(root(clinic), 'Salvar frequência').click();
    await root(patient).getByText('3 períodos sem registro nos últimos 14 dias', { exact: true }).waitFor();
    await root(patient).getByText('Sem registro significa falta de informação, não que a ação deixou de acontecer.', { exact: true }).waitFor();
    const absentSnapshot = await read(patient);
    assert.deepEqual(absentSnapshot.journal, journalBeforeExpectation, 'An expectation must not fabricate patient entries.');
    const waterDays = await patient.evaluate(entries => entries.filter(j => j.category === 'water').map(j => {
      const d = new Date(j.occurredAt);
      return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    }), absentSnapshot.journal);
    assert.equal([date.three, date.two, date.yesterday].some(day => waterDays.includes(day)), false, 'Only the three completed periods are missing; today may contain a demo seed.');
    await button(root(clinic), 'Pausar').click();
    await root(patient).getByText('3 períodos sem registro nos últimos 14 dias', { exact: true }).waitFor({ state: 'hidden' });
    await button(root(clinic), 'Retomar').click();

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Export applies current filters and retains exact source narratives.
    await label(root(patient), 'Filtrar assunto').selectOption('medication');
    const downloadPromise = patient.waitForEvent('download');
    await button(root(patient), 'Exportar JSON').click();
    const download = await downloadPromise;
    const exported = JSON.parse(await fs.readFile(await download.path(), 'utf8'));
    assert.equal(exported.patientId, 'TL-001');
    assert.equal(exported.events.length, 1);
    assert.ok(exported.events[0].text.includes(medication));
    assert.equal(exported.events[0].category, 'medication');
    await label(root(patient), 'Filtrar assunto').selectOption('all');


    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Corrections append a version and leave the original available for context.
    const correctedNote = 'QA correção da anotação: aconteceu dois dias antes do que eu lembrava.';
    await button(root(patient).getByTestId('journal-entry').filter({ hasText: note }), 'Corrigir registro').click();
    await label(root(patient), 'Quando aconteceu').fill(date.four + 'T12:00');
    await label(root(patient), 'Seu relato original').fill(correctedNote);
    await button(root(patient), 'Salvar correção').click();
    await root(clinic).getByTestId('journal-entry').filter({ hasText: correctedNote }).waitFor();
    const correctedJournal = (await read(patient)).journal;
    const firstNote = correctedJournal.find(j => j.originalText === note);
    const corrected = correctedJournal.find(j => j.originalText === correctedNote);
    assert.equal(corrected.supersedesEntryId, firstNote.id);
    assert.equal(firstNote.originalText, note);
    assert.equal(correctedJournal.filter(j => j.id === firstNote.id).length, 1);
    await root(patient).getByTestId('journal-entry').filter({ hasText: note })
      .getByRole('heading', { name: /corrigido posteriormente/ }).waitFor();

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Another clinic patient never inherits Marina's requests or events.
    await other.goto(origin + '/?view=care&paciente=TL-002', { waitUntil: 'networkidle' });
    await root(other).waitFor();
    await tab(other, 'Revisões');
    await label(root(other), 'Mostrar').selectOption('all');
    assert.equal(await request(other, difficulty).count(), 0);
    await tab(other, 'Histórico');
    assert.equal(await root(other).getByTestId('journal-entry').filter({ hasText: medication }).count(), 0);

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // New individual registration stays out of the clinic and cannot send review requests.
    await other.goto(origin + '/?cadastro=1', { waitUntil: 'networkidle' });
    await label(other, 'Nome completo').fill('QA Individual sem vínculo');
    await label(other, 'Data de nascimento').fill('1988-03-14');
    await label(other, 'Altura em centímetros').fill('170');
    await label(other, 'Peso atual em quilos').fill('85');
    await button(other, 'Concluir cadastro').click();
    await other.getByRole('heading', { name: 'Cadastro e medidas', exact: true }).waitFor();
    const individualId = new URL(other.url()).searchParams.get('paciente');
    assert.ok(individualId.startsWith('B2C-'));
    await other.goto(origin + '/?view=care&paciente=' + encodeURIComponent(individualId), { waitUntil: 'networkidle' });
    await root(other).getByText('Uso individual', { exact: true }).waitFor();
    assert.equal(await button(root(other), 'Isso não funciona para mim').count(), 0);
    await addEntry(other, { category: 'note', when: date.yesterday + 'T12:00', text: 'QA registro privado do cadastro individual.' });
    assert.equal((await read(other, individualId)).requests.length, 0);
    assert.equal((await read(other)).journal.some(j => j.originalText === 'QA registro privado do cadastro individual.'), false);
    await clinicPatient(clinic);
    assert.equal(await button(clinic, 'Abrir ficha de QA Individual sem vínculo').count(), 0);

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // A quota failure keeps the draft and must not display a false success.
    await other.goto(origin + '/?view=care&paciente=TL-001', { waitUntil: 'networkidle' });
    await tab(other, 'Histórico');
    const unsaved = 'QA falha de armazenamento: este texto precisa continuar no formulário.';
    await label(root(other), 'Seu relato original').fill(unsaved);
    const beforeFailure = await other.evaluate(k => localStorage.getItem(k), key('TL-001'));
    await other.evaluate(() => {
      window.__coordinationOriginalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(k, v) {
        if (k.startsWith('tirzelife-coordination-demo-v1:')) throw new DOMException('QA quota', 'QuotaExceededError');
        return window.__coordinationOriginalSetItem.call(this, k, v);
      };
    });
    await button(root(other), 'Salvar no histórico').click();
    await root(other).getByRole('alert').filter({ hasText: 'Não foi possível salvar' }).waitFor();
    assert.equal(await label(root(other), 'Seu relato original').inputValue(), unsaved);
    assert.equal(await other.evaluate(k => localStorage.getItem(k), key('TL-001')), beforeFailure);
    assert.equal(await root(other).getByRole('status').filter({ hasText: 'Registro salvo' }).count(), 0);
    await other.evaluate(() => {
      Storage.prototype.setItem = window.__coordinationOriginalSetItem;
      delete window.__coordinationOriginalSetItem;
    });
    await button(root(other), 'Salvar no histórico').click();
    await root(other).getByTestId('journal-entry').filter({ hasText: unsaved }).waitFor();
    assert.equal((await read(other)).journal.filter(j => j.originalText === unsaved).length, 1);

    console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Patient and clinic remain usable in all themes at narrow mobile widths.
    await tab(clinic, 'Histórico');
    await tab(patient, 'Histórico');
    for (const width of [390, 320]) {
      await patient.setViewportSize({ width, height: 844 });
      await clinic.setViewportSize({ width, height: 844 });
      for (const theme of ['Escuro', 'Claro', 'Suave']) {
        await button(patient, theme).click();
        assert.equal(await patient.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'patient overflow ' + width + '/' + theme);
        console.log('QA phase line', new Error().stack.split('\n')[1]);
    // Clinic theme changes are made after closing its modal, then reopen the same patient.
        await button(clinic, 'Fechar ficha').click();
        await button(clinic, theme).click();
        await button(clinic, 'Abrir ficha de Marina Oliveira').click();
        await clinic.getByRole('tab', { name: 'Plano combinado', exact: true }).click();
        await tab(clinic, 'Histórico');
        assert.equal(await clinic.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'clinic overflow ' + width + '/' + theme);
        assert.equal(await clinic.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth), true, 'clinic modal overflow ' + width + '/' + theme);
      }
    }
    await patient.screenshot({ path: 'coordination-patient-mobile.png', fullPage: true });
    await clinic.screenshot({ path: 'coordination-clinic-mobile.png', fullPage: true });
    await patient.setViewportSize({ width: 1500, height: 1100 });
    await tab(patient, 'Revisões');
    await label(root(patient), 'Mostrar').selectOption('all');
    await patient.screenshot({ path: 'coordination-reviews-desktop.png', fullPage: true });
    assert.deepEqual(errors, []);
    console.log('PASS coordination: request → owner → response → reopen → resolved; version snapshot; reload; cross-tab sync; retroactive journal; missing ≠ not done; filtered export; TL-002/B2C isolation; storage failure and retry; mobile 320/390; three themes.');
  } catch (error) {
    console.error('QA failure before cleanup:', error);
    throw error;
  } finally {
    await Promise.race([browser.close(), new Promise(resolve => setTimeout(resolve, 5000))]);
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
