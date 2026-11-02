const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
(async () => {
  const browser = await chromium.launch({channel:'msedge', headless:true});
  const context = await browser.newContext({viewport:{width:1500,height:1100}, timezoneId:'America/Sao_Paulo', reducedMotion:'reduce'});
  const clinic = await context.newPage();
  const patient = await context.newPage();
  const errors = [];
  context.setDefaultTimeout(12000);
  for (const page of [clinic,patient]) page.on('pageerror', e => errors.push(e.message));
  try {
    await patient.goto('http://localhost:8081/?view=nutrition',{waitUntil:'networkidle',timeout:120000});
    await patient.getByRole('heading',{name:'Cuidado à mesa',exact:true}).waitFor();
    for (const [profile,food] of [
      ['Enjoo / pouca fome','Iogurte natural e banana amassada'],
      ['Intestino preso','Iogurte natural, mamão e aveia'],
      ['Diarreia','Ovo mexido e pão branco'],
      ['Rotina habitual','Ovos mexidos, pão integral e mamão'],
    ]) {
      await patient.getByRole('button',{name:profile,exact:true}).click();
      await patient.getByText(food,{exact:true}).waitFor();
    }
    await patient.getByRole('button',{name:'Enjoo / pouca fome',exact:true}).click();
    await patient.getByRole('navigation',{name:'Navegação principal',exact:true}).getByRole('button',{name:'Visão geral',exact:true}).click();
    await patient.getByText('Frango desfiado com purê de batata e cenoura',{exact:true}).waitFor();
    await patient.getByRole('button',{name:'Abrir cardápio semanal',exact:true}).click();
    await patient.getByText('Iogurte natural e banana amassada',{exact:true}).waitFor();
    await patient.getByRole('group',{name:'Dias do cardápio'}).getByRole('button').first().click();
    await patient.getByRole('button',{name:'Concluir Café da manhã',exact:true}).click();
    await patient.getByRole('button',{name:'Desmarcar Café da manhã',exact:true}).waitFor();
    await patient.reload({waitUntil:'networkidle'});
    await patient.getByRole('group',{name:'Dias do cardápio'}).getByRole('button').first().click();
    await patient.getByRole('button',{name:'Desmarcar Café da manhã',exact:true}).waitFor();

    await clinic.goto('http://localhost:8081/clinica?view=plans',{waitUntil:'networkidle',timeout:90000});
    await clinic.getByRole('heading',{name:'Um plano. Diferentes momentos.'}).waitFor();
    await clinic.screenshot({path:path.join(process.cwd(),'nutrition-clinic-overview.png'),fullPage:true});
    await clinic.locator('.cl-plan-card').filter({hasText:'Marina Oliveira'}).getByRole('button',{name:'Abrir plano',exact:true}).click();
    const editor = clinic.getByRole('dialog',{name:'Marina Oliveira'});
    assert.equal(await editor.getByRole('button',{name:'Publicar no app local',exact:true}).isDisabled(),true);
    await editor.getByLabel('Nome do plano',{exact:true}).fill('Plano semanal de Marina');
    await editor.getByRole('textbox',{name:'Alimentos de Café da manhã',exact:true}).fill('Ovos e pão integral revisados');
    await editor.getByRole('textbox',{name:'Porção de Café da manhã',exact:true}).fill('2 ovos e 1 fatia de pão integral');
    await editor.getByRole('button',{name:'Repetir este dia na semana',exact:true}).click();
    await editor.getByRole('button',{name:'Aplicar aos sete dias',exact:true}).click();
    await editor.getByRole('button',{name:'Salvar rascunho',exact:true}).click();
    await editor.getByText('Rascunho salvo.',{exact:false}).waitFor();
    assert.equal(await patient.getByRole('heading',{name:'Plano semanal de Marina',exact:true}).count(),0);
    await editor.getByRole('combobox',{name:'Perfil alimentar em edição',exact:true}).selectOption('nausea');
    await editor.getByRole('checkbox',{name:'Liberar opções para enjoo / pouca fome após revisão'}).check();
    for (const [id,label] of [['constipation','intestino preso'],['diarrhea','diarreia']]) {
      await editor.getByRole('combobox',{name:'Perfil alimentar em edição',exact:true}).selectOption(id);
      await editor.getByRole('checkbox',{name:'Liberar opções para '+label+' após revisão'}).uncheck();
    }
    await editor.getByRole('combobox',{name:'Perfil alimentar em edição',exact:true}).selectOption('nausea');
    await editor.getByLabel('Responsável pela revisão',{exact:true}).filter({visible:true}).fill('Nutricionista de demonstração');
    await editor.getByRole('checkbox',{name:'Revisei os sete dias',exact:false}).check();
    await editor.getByRole('button',{name:'Publicar no app local',exact:true}).click();
    await editor.getByText('Versão 2 publicada no app local do paciente.',{exact:true}).waitFor();
    await patient.getByRole('heading',{name:'Plano semanal de Marina',exact:true}).waitFor();
    await patient.getByRole('button',{name:'Concluir Café da manhã',exact:true}).waitFor();
    await patient.getByRole('button',{name:'Intestino preso',exact:true}).click();
    await patient.getByText('Adaptação ainda não liberada pela equipe.',{exact:false}).waitFor();
    await patient.getByText('Ovos e pão integral revisados',{exact:true}).waitFor();
    assert.equal(await patient.getByRole('button',{name:'Voltar à opção habitual',exact:true}).count(),0);
    await patient.getByRole('button',{name:'Enjoo / pouca fome',exact:true}).click();
    await patient.getByText('Iogurte natural e banana amassada',{exact:true}).waitFor();
    await patient.getByRole('button',{name:'Voltar à opção habitual',exact:true}).first().click();
    await patient.getByText('Ovos e pão integral revisados',{exact:true}).waitFor();
    await patient.getByRole('button',{name:'Usar opção revisada',exact:true}).first().click();
    await patient.getByText('Iogurte natural e banana amassada',{exact:true}).waitFor();
    await patient.getByRole('button',{name:'Concluir Café da manhã',exact:true}).click();
    await patient.getByRole('button',{name:'Rotina habitual',exact:true}).click();
    await patient.getByText('Iogurte natural e banana amassada',{exact:true}).waitFor();
    await patient.getByText('Registro com opção adaptada.',{exact:false}).waitFor();

    await editor.getByLabel('Nome do plano',{exact:true}).fill('Rascunho não publicado');
    await editor.getByRole('button',{name:'Fechar ficha',exact:true}).click();
    await editor.getByText('Há alterações não salvas na ficha.',{exact:true}).waitFor();
    await editor.getByRole('button',{name:'Continuar editando',exact:true}).click();
    await editor.getByRole('tab',{name:'Visão geral',exact:true}).click();
    await editor.getByRole('tab',{name:'Plano alimentar',exact:true}).click();
    assert.equal(await editor.getByLabel('Nome do plano',{exact:true}).inputValue(),'Rascunho não publicado');
    await editor.getByRole('button',{name:'Salvar rascunho',exact:true}).click();
    await patient.reload({waitUntil:'networkidle'});
    await patient.getByRole('heading',{name:'Plano semanal de Marina',exact:true}).waitFor();
    await patient.getByRole('group',{name:'Dias do cardápio'}).getByRole('button').first().click();
    await patient.getByRole('button',{name:'Desmarcar Café da manhã',exact:true}).waitFor();
    await editor.getByRole('button',{name:'Fechar ficha',exact:true}).click();
    await clinic.locator('.cl-plan-card').filter({hasText:'Ricardo Almeida'}).getByRole('button',{name:'Abrir plano',exact:true}).click();
    assert.equal(await clinic.getByRole('dialog',{name:'Ricardo Almeida'}).getByLabel('Nome do plano',{exact:true}).inputValue(),'Cuidado à mesa');
    await clinic.getByRole('button',{name:'Fechar ficha',exact:true}).click();
    const other = await context.newPage();
    await other.goto('http://localhost:8081/?view=nutrition&paciente=TL-002',{waitUntil:'networkidle'});
    await other.getByRole('heading',{name:'Cuidado à mesa',exact:true}).waitFor();
    assert.equal(await other.getByText('Ovos e pão integral revisados',{exact:true}).count(),0);
    await other.goto('http://localhost:8081/?view=nutrition&paciente=DEMO-new',{waitUntil:'networkidle'});
    await other.getByRole('heading',{name:'Seu plano está sendo preparado.'}).waitFor();
    await other.close();

    for (const [name,theme] of [['Claro','clean'],['Escuro','dark'],['Suave','warm']]) {
      await patient.getByRole('button',{name}).click();
      await patient.screenshot({path:path.join(process.cwd(),'nutrition-patient-'+theme+'.png'),fullPage:true});
      assert.equal(await patient.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
    await patient.getByRole('button',{name:'Claro'}).click();
    for (const width of [390,320]) {
      await patient.setViewportSize({width,height:844});
      assert.equal(await patient.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
      await patient.screenshot({path:path.join(process.cwd(),'nutrition-patient-'+width+'.png'),fullPage:true});
    }
    await clinic.locator('.cl-plan-card').filter({hasText:'Marina Oliveira'}).getByRole('button',{name:'Abrir plano',exact:true}).click();
    await editor.screenshot({path:path.join(process.cwd(),'nutrition-clinic-editor.png')});
    for (const width of [390,320]) {
      await clinic.setViewportSize({width,height:844});
      assert.equal(await editor.evaluate(e=>e.scrollWidth<=e.clientWidth),true);
      await editor.screenshot({path:path.join(process.cwd(),'nutrition-clinic-editor-'+width+'.png')});
    }
    assert.deepEqual(errors,[]);
    console.log('PASS: weekly plan, persistence, cross-tab publication, draft privacy, approval gate, approved adaptations, recorded alternatives, patient isolation, unsaved edits, 3 themes, 320/390px and no JS errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
