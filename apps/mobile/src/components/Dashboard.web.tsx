import { useEffect, useRef, useState } from 'react';
import './dashboard.css';
import './brand.css';
import './coordination-shell.css';
import CoordinationPanel, { CoordinationSummaryCard } from './CoordinationPanel';
import { useQuickJournal, localDateTime } from './quick-journal';

import { Icon, themes } from './dashboard-ui';
import CareProfilePanel, { CareProgress } from './CareProfile';
import ActivityPanel, { ActivitySummary } from './ActivityPanel';
import { useCare } from '../store/care-store';
import PatientNutrition, { usePatientNutrition } from './PatientNutrition';
import DoseScienceGuide from './DoseScienceGuide';
import NextMealReactiveCard from './NextMealReactiveCard';
import SyringeCalculator from './SyringeCalculator';
import DoctorReportExport from './DoctorReportExport';
import WeeklyBioCycleMap from './WeeklyBioCycleMap';
const nav = [{id:'home',name:'Visão geral',icon:'home'},{id:'cycle',name:'Meu tratamento',icon:'activity'},{id:'nutrition',name:'Plano alimentar',icon:'meal'},{id:'diary',name:'Meu diário',icon:'book'},{id:'care',name:'Plano combinado',icon:'heart'},{id:'activity',name:'Movimento',icon:'leaf'},{id:'progress',name:'Minha evolução',icon:'chart'},{id:'profile',name:'Meu cadastro',icon:'settings'}] as const;
function Ring({value,max,color,children}:{value:number;max:number;color:string;children:React.ReactNode}) {
 const progress=max>0?Math.min(1,value/max):0; return <div className="tl-ring"><svg viewBox="0 0 128 128" aria-hidden="true"><circle cx="64" cy="64" r="54" className="ring-track"/><circle cx="64" cy="64" r="54" stroke={color} strokeDasharray={`${progress*339.3} 339.3`} className="ring-fill"/></svg><div>{children}</div></div>
}
export default function Dashboard() {
 const [profileDirty,setProfileDirty]=useState(false),[pendingTab,setPendingTab]=useState('');
 const [coordDirty,setCoordDirty]=useState(false);const [careTab,setCareTab]=useState<'plan'|'timeline'|'requests'>('plan');
 const [theme,setTheme]=useState('clean'); const [tab,setTab]=useState('home');
 const [patientId,setPatientId]=useState('TL-001'); const nutrition=usePatientNutrition(patientId); const care=useCare(patientId); const waterTarget=nutrition.record?.published?.waterTarget ?? 0;
 const quick=useQuickJournal(patientId);const {water,mood,entries,moments,applications}=quick;
 const [applicationMedication,setApplicationMedication]=useState(''),[applicationDose,setApplicationDose]=useState(''),[applicationAt,setApplicationAt]=useState(localDateTime());
 const [dialog,setDialog]=useState<'life'|'application'|'profile'|null>(null);
 const [notice,setNotice]=useState(''); const [diary,setDiary]=useState(''); const [moment,setMoment]=useState('Refeição com amigos');
 const [site,setSite]=useState(''); const [displayName,setDisplayName]=useState('Marina');
 const [satiety,setSatiety]=useState(true);
 useEffect(()=>{const name=care.record?.profile.name??nutrition.plan?.patientName;setDisplayName(name?.split(' ')[0]??'Visitante');},[care.record?.profile.name,nutrition.plan?.patientName,patientId]);
 useEffect(()=>{const medication=care.record?.profile.medication;setApplicationMedication(medication&&!['Não informado','Não utilizo'].includes(medication)?medication:'');setApplicationDose('');},[patientId,care.record?.profile.medication]);
 const dialogRef=useRef<HTMLDialogElement>(null); const lastFocus=useRef<HTMLElement|null>(null);
 useEffect(()=>{document.title='Tirze-Life · Seu cuidado, no seu ritmo'; const params=new URLSearchParams(window.location.search); if(nav.some(n=>n.id===params.get('view')))setTab(params.get('view')!); if(params.get('cadastro')==='1'){setPatientId('');setTab('profile');} if(params.get('paciente'))setPatientId(params.get('paciente')!); try {const saved=localStorage.getItem('tirzelife-visual-theme'); if(themes.some(t=>t.id===saved))setTheme(saved!);}catch{}},[]);
 useEffect(()=>{ if(!notice)return; const timer=setTimeout(()=>setNotice(''),3500);return ()=>clearTimeout(timer);},[notice]);
 useEffect(()=>{if(dialog){lastFocus.current=document.activeElement as HTMLElement;dialogRef.current?.showModal();}else {dialogRef.current?.close();lastFocus.current?.focus();}},[dialog]);
 useEffect(()=>{const button=document.querySelector<HTMLElement>('.tl-mobile-nav button[aria-current="page"]');if(button&&button.getClientRects().length)button.scrollIntoView({block:'nearest',inline:'nearest'});},[tab]);
 useEffect(()=>{if(!diary.trim())return;const guard=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[diary]);
 function chooseTheme(id:string){setTheme(id);try{localStorage.setItem('tirzelife-visual-theme',id);}catch{}}
 function navigate(id:string){setTab(id);const url=new URL(window.location.href);url.searchParams.set('view',id);window.history.replaceState(null,'',url);window.scrollTo({top:0,behavior:'instant'});}
 function go(id:string){if((profileDirty||coordDirty||Boolean(diary.trim()))&&id!==tab){setPendingTab(id);return;}navigate(id);}
 const cycleCard=<section className="tl-card tl-cycle" id="cycle">
 <div className="tl-card-heading"><span className="tl-kicker"><Icon name="activity" size={17}/> MEU TRATAMENTO</span><span className="tl-badge">Relatos de uso</span></div>
 <div className="tl-cycle-title"><div><h2>Seu tratamento, com histórico.</h2><p>Aplicações informadas por você, em ordem de acontecimento.</p></div></div>
 {applications.length?<div className="tl-treatment-latest"><span className="tl-muted">Último registro</span><strong>{applications[0]!.medicationName||'Medicamento não informado'}</strong><p>{new Date(applications[0]!.occurredAt).toLocaleString('pt-BR')} · {applications[0]!.doseText||'Dose não informada'}</p><p>{applications[0]!.originalText}</p></div>:<div className="tl-treatment-latest"><strong>Ainda sem aplicações registradas.</strong><p>Registre o que aconteceu para consultar depois com sua equipe.</p></div>}
 <div className="tl-cycle-bottom"><div><strong>{applications.length} {applications.length===1?'registro':'registros'}</strong><span className="tl-muted">Não representam uma prescrição.</span></div><button className="tl-icon-button" aria-label="Registrar aplicação" onClick={()=>setDialog('application')}><Icon name="plus"/></button></div>
 <button className="tl-outline full" onClick={()=>{setCareTab('timeline');go('care');}}>Ver histórico completo <Icon name="arrow" size={16}/></button>
 <p className="tl-fine">Datas e doses são relatos do paciente. Siga a orientação do profissional responsável para próximas aplicações.</p></section>;
 const nutritionCard=<PatientNutrition nutrition={nutrition} compact onExpand={()=>go('nutrition')}/>;
 const diaryCard=<section className="tl-card tl-diary"><span className="tl-kicker"><Icon name="book" size={16}/> SEU DIÁRIO</span><h2>Como você está hoje?</h2><p>Seu corpo fala. Aqui, a gente escuta.</p><div className="tl-moods">{[{v:'Difícil',face:'〰'},{v:'Mais ou menos',face:'−'},{v:'Bem',face:'⌣'},{v:'Muito bem',face:'◡'}].map(m=><button key={m.v} className={mood===m.v?'selected':''} aria-pressed={mood===m.v} onClick={()=>{if(quick.save('checkin',m.v))setNotice('Check-in salvo no histórico deste navegador.');}}><span className="tl-face" aria-hidden="true"><i/><b>{m.face}</b></span><small>{m.v}</small></button>)}</div><button className="tl-outline full" onClick={()=>go('diary')}><Icon name="plus" size={16}/> Escrever no diário</button></section>;
 return <div className="tl-app" data-theme={theme}>
 <a className="tl-skip" href="#conteudo-principal">Pular para o conteúdo</a>
 <header className="tl-theme-bar"><div className="tl-theme-caption"><span className="tl-preview-dot"/> PRÉVIA DO PRODUTO <span className="tl-theme-help">Tema de leitura</span></div><div className="tl-theme-options" role="group" aria-label="Tema visual">{themes.map(t=><button key={t.id} onClick={()=>chooseTheme(t.id)} aria-pressed={theme===t.id} className={theme===t.id?'active':''}><Icon name={t.icon} size={15}/><span>{t.name}</span></button>)}</div><span className="tl-demo-label">Dados fictícios</span></header>
 <aside className="tl-sidebar"><a className="tl-brand" href="#" onClick={e=>{e.preventDefault();go('home');}}><span className="tl-logo"><Icon name="activity" size={26}/></span>tirze<span>life</span></a><div className="tl-workspace"><span className="tl-workspace-icon"><Icon name="heart" size={18}/></span><div>Meu espaço de cuidado<small>Jornada pessoal</small></div></div><span className="tl-nav-label">ACOMPANHAMENTO</span><nav aria-label="Navegação principal">{nav.map(n=><button key={n.id} className={tab===n.id?'active':''} aria-current={tab===n.id?'page':undefined} onClick={()=>go(n.id)}><Icon name={n.icon}/><span>{n.name}</span>{n.id==='home'&&<i/>}</button>)}</nav><div className="tl-sidebar-bottom"><a className="tl-clinic-link" href="/clinica">Painel da clínica ↗</a><div className="tl-care-note"><Icon name="leaf" size={23}/><strong>Cada passo conta.</strong><p>O seu caminho não precisa ser perfeito para ser seu.</p><span>MENOS CULPA. MAIS CUIDADO.</span></div><button className="tl-profile" onClick={()=>go('profile')}><span className="tl-avatar">{displayName.slice(0,1)}</span><span>{displayName}<small>Perfil de demonstração</small></span><Icon name="settings" size={17}/></button></div></aside>
 <main id="conteudo-principal" tabIndex={-1} className="tl-main"><div className="tl-breadcrumb">Meu espaço <span>/</span> {nav.find(n=>n.id===tab)?.name}<span className="tl-private"><Icon name="heart" size={14}/> Feito para cuidar de você</span></div><header className="tl-page-heading"><div><div className="tl-date">{new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}).toUpperCase()} <span>• DEMONSTRAÇÃO</span></div><h1>{tab==='home'?<>Olá, {displayName}<span className="tl-greeting">✳</span></>:tab==='cycle'?'Seu tratamento, com contexto.':tab==='nutrition'?'Seu cardápio, dia a dia.':tab==='care'?'Um plano que cabe na sua vida.':tab==='diary'?'Um espaço para você.':tab==='profile'?'Seu cuidado começa com você.':tab==='activity'?'Movimento para sua rotina.':'Cada passo faz parte.'}</h1><p>{tab==='home'?'Hoje é mais uma oportunidade de cuidar de você. Vamos no seu ritmo.':'Acompanhe sua jornada com mais escuta e gentileza.'}</p></div><button className="tl-outline tl-date-button" onClick={()=>setDialog('application')}><Icon name="plus" size={17}/> Registrar aplicação</button></header>
 {quick.error&&<p className="care-caution" role="alert">{quick.error}</p>}
 {tab==='home'&&<div className="tl-minimal-home" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
  {/* 1. HERO SERENO DE ACOLHIMENTO */}
  <section style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '12px', padding: '12px 14px', boxShadow: '0 2px 12px -2px rgba(0,0,0,0.03)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
      <div>
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent, #0d9488)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Hoje · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text)', margin: '2px 0 1px 0', letterSpacing: '-0.3px' }}>
          Olá, {displayName}
        </h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
          Seu corpo está em equilíbrio. Vamos no seu ritmo hoje.
        </p>
      </div>
      <button
        type="button"
        onClick={() => setDialog('life')}
        style={{
          background: 'var(--soft, rgba(13, 148, 136, 0.08))',
          border: '1px solid var(--line, #e2e8f0)',
          borderRadius: 999,
          padding: '4px 10px',
          color: 'var(--text)',
          fontSize: '0.72rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
        }}
      >
        <Icon name="sun" size={13} /> Modo Vida Real
      </button>
    </div>
  </section>

  {/* 2. AS 3 AÇÕES DIRETAS (ÁGUA, REFEIÇÃO, SENSAÇÃO) */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
    {/* AÇÃO 1: HIDRATAÇÃO EM 1 TOQUE */}
    <section style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '12px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="drop" size={18} />
        </div>
        <div>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Água Hoje</span>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
            {(water / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L
            <span style={{ fontSize: '0.74rem', fontWeight: 500, color: 'var(--muted)' }}> / {waterTarget ? (waterTarget / 1000).toFixed(1) + ' L' : 'meta'}</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => { if (quick.save('water', '250 ml de água informados.', { amountMl: 250 })) setNotice('250 mL registrados!'); }}
        style={{
          background: 'var(--accent, #0d9488)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 999,
          padding: '6px 12px',
          fontSize: '0.76rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          boxShadow: '0 2px 6px rgba(13, 148, 136, 0.25)',
        }}
      >
        <Icon name="plus" size={13} /> 250 mL
      </button>
    </section>

    {/* AÇÃO 2: CHECK-IN RÁPIDO DE COMO VOCÊ ESTÁ */}
    <section style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '12px', padding: '10px 12px' }}>
      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
        Como você está se sentindo?
      </span>
      <div style={{ display: 'flex', gap: '5px' }}>
        {[
          { label: 'Muito bem', icon: 'heart', desc: 'Disposição ótima' },
          { label: 'Sem fome', icon: 'leaf', desc: 'Saciedade alta' },
          { label: 'Enjoo leve', icon: 'activity', desc: 'Sensibilidade gástrica' },
        ].map((m) => (
          <button
            key={m.label}
            type="button"
            onClick={() => { if (quick.save('note', m.label + ' · ' + m.desc)) setNotice('Sensação registrada: ' + m.label); }}
            style={{
              flex: 1,
              padding: '5px 3px',
              borderRadius: '7px',
              border: '1px solid var(--line, #e2e8f0)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </section>
  </div>

  {/* 3. PRÓXIMA REFEIÇÃO REATIVA (DIRETA E SEM POLUIÇÃO) */}
  <NextMealReactiveCard
    patientId={patientId}
    patientName={displayName}
    currentMedication={applicationMedication || 'Tirzepatida'}
    currentDoseMg={2.5}
  />

  {/* 4. ATALHO LIMPO PARA VER CICLO & DOSAGEM */}
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      type="button"
      onClick={() => go('cycle')}
      style={{
        flex: 1,
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--line, #e2e8f0)',
        borderRadius: '10px',
        padding: '9px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block' }}>Calculadora &amp; Doses</strong>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Conferir marcação da seringa ↗</span>
      </div>
      <Icon name="arrow" size={14} />
    </button>

    <button
      type="button"
      onClick={() => go('nutrition')}
      style={{
        flex: 1,
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--line, #e2e8f0)',
        borderRadius: '10px',
        padding: '9px 12px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <strong style={{ fontSize: '0.8rem', color: 'var(--text)', display: 'block' }}>Plano Alimentar</strong>
        <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Ver cardápio completo ↗</span>
      </div>
      <Icon name="arrow" size={14} />
    </button>
  </div>
</div>}
 <div className="care-profile-entry"><p>{care.record?(care.record.profile.channel==='clinic'?'Jornada com a clínica · ':'Jornada individual · ')+care.record.profile.name:'Complete seu cadastro para guardar medidas e atividades.'}</p><a href="/?cadastro=1">Experimentar cadastro individual ↗</a></div>
 {pendingTab&&<div className="care-caution" role="alert"><strong>Há alterações não salvas.</strong><div className="care-actions"><button className="tl-outline" onClick={()=>setPendingTab('')}>Continuar editando</button><button className="tl-outline" onClick={()=>{setProfileDirty(false);setCoordDirty(false);setDiary('');navigate(pendingTab);setPendingTab('');}}>Descartar e sair</button></div></div>}
 {tab==='profile'&&<CareProfilePanel key={patientId||'new'} patientId={patientId} onDirty={setProfileDirty} channel={patientId.startsWith('TL-')?'clinic':'individual'} onSaved={r=>{setPatientId(r.profile.id);window.history.replaceState(null,'','/?paciente='+encodeURIComponent(r.profile.id)+'&view=profile');}}/>}
 {tab==='care'&&<CoordinationPanel key={patientId} patientId={patientId} mode="patient" initialTab={careTab} onDirtyChange={setCoordDirty}/>}
 {tab==='activity'&&<ActivityPanel key={patientId} patientId={patientId} onRegister={()=>go('profile')}/>}
 {tab==='nutrition'&&<><PatientNutrition nutrition={nutrition}/><NextMealReactiveCard patientId={patientId} patientName={displayName} currentMedication={applicationMedication || 'Tirzepatida'} currentDoseMg={2.5}/></>}
 {tab==='cycle'&&<div className="tl-detail-layout">{cycleCard}<WeeklyBioCycleMap/><SyringeCalculator/><DoseScienceGuide/><DoctorReportExport patientId={patientId} patientName={displayName} medication={applicationMedication || 'Tirzepatida'} doseMg={parseFloat(applicationDose) || 2.5}/><section className="tl-card"><span className="tl-kicker">REGISTROS DE EXEMPLO</span><h2>Sua rotina de cuidado</h2>{applications.map((a,i)=><div className="tl-record" key={i}><Icon name="check"/><div><strong>Registro de demonstração</strong><p>{a.originalText}</p><small>{new Date(a.occurredAt).toLocaleString('pt-BR')} · {a.medicationName||'Não informado'} · {a.doseText||'Dose não informada'}</small></div></div>)}<button className="tl-primary full" onClick={()=>setDialog('application')}>Adicionar registro de exemplo</button></section></div>}
 {tab==='diary'&&<div className="tl-detail-layout"><section className="tl-card"><span className="tl-kicker">EM SUAS PALAVRAS</span><h2>Como foi o seu dia?</h2><p>Conte sobre sua disposição, sua alimentação ou algo que queira lembrar.</p><label className="tl-field" style={{ margin: '8px 0' }}>Meu relato<textarea value={diary} onChange={e=>setDiary(e.target.value)} placeholder="Hoje eu me senti…" rows={3} style={{ minHeight: '90px' }}/></label><button className="tl-primary" disabled={!diary.trim()} onClick={()=>{if(quick.save('note',diary)){setDiary('');setNotice('Relato salvo no histórico deste navegador.');}}}>Salvar meu relato</button><p className="tl-fine" style={{ marginTop: '8px' }}>Registros locais persistentes. No perfil vinculado, eles aparecem também na demonstração da clínica neste navegador.</p>{entries.map((e,i)=><div className="tl-entry" key={i}><span>RELATO {entries.length-i}</span><p>{e.originalText}</p><small>{new Date(e.occurredAt).toLocaleString('pt-BR')}</small></div>)}</section><div>{diaryCard}{moments.length>0&&<section className="tl-card tl-moments"><h2>Seus momentos</h2>{moments.map((m,i)=><p key={m.id}>{m.originalText}</p>)}</section>}</div></div>}
 {tab==='progress'&&<><CareProgress patientId={patientId}/><ActivitySummary patientId={patientId}/><DoctorReportExport patientId={patientId} patientName={displayName} medication={applicationMedication || 'Tirzepatida'} doseMg={parseFloat(applicationDose) || 2.5}/></>}
 <footer className="tl-footer"><span><a className="tl-clinic-link" href="/clinica">Painel da clínica ↗</a><span className="tl-footer-brand">tirzelife</span> Seu cuidado, no seu ritmo.</span><span>Prévia local · Registros e acompanhamento neste navegador</span></footer></main>
 <nav className="tl-mobile-nav" aria-label="Navegação móvel">{nav.map(n=><button key={n.id} className={tab===n.id?'active':''} aria-label={n.name} aria-current={tab===n.id?'page':undefined} onClick={()=>go(n.id)}><Icon name={n.icon} size={21}/><span>{n.id==='home'?'Início':n.id==='cycle'?'Ciclo':n.id==='nutrition'?'Plano':n.id==='care'?'Combinado':n.id==='diary'?'Diário':n.id==='activity'?'Mover':n.id==='profile'?'Cadastro':'Evolução'}</span></button>)}</nav>
 {!!notice&&<div className="tl-toast" role="status"><Icon name="check" size={17}/>{notice}</div>}
 <dialog className="tl-dialog" ref={dialogRef} onCancel={()=>setDialog(null)} onClick={e=>{if(e.target===e.currentTarget)setDialog(null);}}><div className="tl-dialog-heading"><span className="tl-kicker">{dialog==='life'?'MODO VIDA REAL':dialog==='profile'?'SEU ESPAÇO':'MEU TRATAMENTO'}</span><button className="tl-icon-button" aria-label="Fechar" onClick={()=>setDialog(null)}><Icon name="close"/></button></div>
 {dialog==='life'&&<><h2>Um momento para lembrar.</h2><p>Sem julgamentos. Como foi o seu momento?</p><label className="tl-field">Tipo de momento<select value={moment} onChange={e=>setMoment(e.target.value)}>{['Refeição com amigos','Uma comemoração','Bebida com gás','Cerveja','Um doce'].map(m=><option key={m}>{m}</option>)}</select></label><label className="tl-checkbox"><input type="checkbox" checked={satiety} onChange={e=>setSatiety(e.target.checked)}/>Percebi minha saciedade e respeitei meu ritmo.</label><button className="tl-primary full" onClick={()=>{if(quick.save('moment',moment+(satiety?' · Respeitei minha saciedade.':''))){setDialog(null);setNotice('Momento salvo. Você pode revê-lo no diário.');}}}>Guardar meu momento</button></>}
 {dialog==='application'&&<><h2>Registrar uma aplicação</h2><p>Informe o que aconteceu. Este registro não cria nem altera uma prescrição.</p>
 <label className="tl-field">Medicamento informado
  <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem',margin:'0.35rem 0'}}>
    {['Tirzepatida','Retatrutida','CagriSema','Glow / GHK-Cu','Semaglutida'].map(med=><button key={med} type="button" className="tl-outline" style={{fontSize:'0.75rem',padding:'0.2rem 0.5rem',borderRadius:'6px',backgroundColor:applicationMedication===med?'var(--accent, #10b981)':'transparent',color:applicationMedication===med?'#fff':'inherit'}} onClick={()=>setApplicationMedication(med)}>{med}</button>)}
  </div>
  <input value={applicationMedication} onChange={e=>setApplicationMedication(e.target.value)} maxLength={100} placeholder="Ou digite o nome do medicamento"/>
 </label>
 <label className="tl-field">Dose informada (opcional)
  <div style={{display:'flex',flexWrap:'wrap',gap:'0.35rem',margin:'0.35rem 0'}}>
    {['2,5 mg','5,0 mg','7,5 mg','10,0 mg','12,5 mg','15,0 mg'].map(d=><button key={d} type="button" className="tl-outline" style={{fontSize:'0.75rem',padding:'0.2rem 0.5rem',borderRadius:'6px',backgroundColor:applicationDose===d?'var(--accent, #10b981)':'transparent',color:applicationDose===d?'#fff':'inherit'}} onClick={()=>setApplicationDose(d)}>{d}</button>)}
  </div>
  <input value={applicationDose} onChange={e=>setApplicationDose(e.target.value)} maxLength={80} placeholder="Ou digite a dose da sua orientação"/>
 </label>
 <label className="tl-field">Quando aconteceu a aplicação<input type="datetime-local" value={applicationAt} max={localDateTime()} onChange={e=>setApplicationAt(e.target.value)}/></label>
 <label className="tl-field">Local do registro<select value={site} onChange={e=>setSite(e.target.value)}><option value="">Selecione o local</option>{['Abdômen superior direito','Abdômen superior esquerdo','Abdômen inferior direito','Abdômen inferior esquerdo','Coxa direita','Coxa esquerda','Braço direito','Braço esquerdo'].map(s=><option key={s}>{s}</option>)}</select></label>
 <p className="tl-fine">Não calculamos dose, concentração sanguínea ou intervalo de aplicação.</p>
 {quick.error&&<p role="alert">{quick.error}</p>}
 <button className="tl-primary full" disabled={!site||!applicationMedication.trim()||!applicationAt} onClick={()=>{const when=new Date(applicationAt);if(Number.isNaN(when.getTime())){setNotice('Revise a data da aplicação.');return;}const nextWeek=applications.length+1;if(quick.save('medication',site,{medicationName:applicationMedication.trim(),doseText:applicationDose.trim()||undefined,occurredAt:when.toISOString()})){setDialog(null);setNotice(`Aplicação da Semana ${nextWeek} salva! Relatório médico atualizado automaticamente.`);}}}>Salvar aplicação semanal</button></>}
 {dialog==='profile'&&<><h2>Como podemos chamar você?</h2><label className="tl-field">Nome na demonstração<input value={displayName} maxLength={24} onChange={e=>setDisplayName(e.target.value)}/></label><button className="tl-primary full" disabled={!displayName.trim()} onClick={()=>setDialog(null)}>Concluir</button></>}
 </dialog></div>;
}
