import fs from 'fs';

let code = fs.readFileSync('apps/mobile/src/components/Dashboard.web.tsx', 'utf8');

// Target the existing overloaded tab === 'home' block
const targetHomeStart = "{tab==='home'&&<><CoordinationSummaryCard";
const targetHomeEnd = "{diaryCard}<section className=\"tl-life\"><div className=\"tl-life-top\"><span className=\"tl-kicker\">MODO VIDA REAL</span><Icon name=\"sun\" size={24}/></div><h2>A vida acontece.<br/>E está tudo bem.</h2><p>Um jantar, um encontro, uma pausa.<br/>Seus momentos também fazem parte.</p><button className=\"tl-text-button\" onClick={()=>setDialog('life')}>Registrar meu momento<Icon name=\"arrow\" size={17}/></button></section></div></div></>}";

// Replace with ultra-clean, minimalist, action-first design
const minimalistHome = `{tab==='home'&&<div className="tl-minimal-home" style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
  {/* 1. HERO SERENO DE ACOLHIMENTO */}
  <section style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '16px', padding: '20px 18px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
      <div>
        <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--accent, #0d9488)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Hoje · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text)', margin: '4px 0 2px 0', letterSpacing: '-0.4px' }}>
          Olá, {displayName}
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: 0 }}>
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
          padding: '6px 12px',
          color: 'var(--text)',
          fontSize: '0.75rem',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Icon name="sun" size={14} /> Modo Vida Real
      </button>
    </div>
  </section>

  {/* 2. AS 3 AÇÕES DIRETAS (ÁGUA, REFEIÇÃO, SENSAÇÃO) */}
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
    {/* AÇÃO 1: HIDRATAÇÃO EM 1 TOQUE */}
    <section style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(13, 148, 136, 0.1)', color: 'var(--accent, #0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="drop" size={20} />
        </div>
        <div>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase' }}>Água Hoje</span>
          <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)' }}>
            {(water / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--muted)' }}> / {waterTarget ? (waterTarget / 1000).toFixed(1) + ' L' : 'meta'}</span>
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
          padding: '8px 14px',
          fontSize: '0.8rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
        }}
      >
        <Icon name="plus" size={14} /> 250 mL
      </button>
    </section>

    {/* AÇÃO 2: CHECK-IN RÁPIDO DE COMO VOCÊ ESTÁ */}
    <section style={{ background: 'var(--card, #ffffff)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '16px', padding: '16px' }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
        Como você está se sentindo?
      </span>
      <div style={{ display: 'flex', gap: '6px' }}>
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
              padding: '6px 4px',
              borderRadius: '8px',
              border: '1px solid var(--line, #e2e8f0)',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '0.72rem',
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
  <div style={{ display: 'flex', gap: '10px' }}>
    <button
      type="button"
      onClick={() => go('cycle')}
      style={{
        flex: 1,
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--line, #e2e8f0)',
        borderRadius: '12px',
        padding: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block' }}>Calculadora &amp; Doses</strong>
        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Conferir marcação da seringa ↗</span>
      </div>
      <Icon name="arrow" size={16} />
    </button>

    <button
      type="button"
      onClick={() => go('nutrition')}
      style={{
        flex: 1,
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--line, #e2e8f0)',
        borderRadius: '12px',
        padding: '12px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div>
        <strong style={{ fontSize: '0.85rem', color: 'var(--text)', display: 'block' }}>Plano Alimentar</strong>
        <span style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>Ver cardápio completo ↗</span>
      </div>
      <Icon name="arrow" size={16} />
    </button>
  </div>
</div>}`;

const startIndex = code.indexOf(targetHomeStart);
const endIndex = code.indexOf(targetHomeEnd);

if (startIndex !== -1 && endIndex !== -1) {
  const fullTarget = code.substring(startIndex, endIndex + targetHomeEnd.length);
  code = code.replace(fullTarget, minimalistHome);
  fs.writeFileSync('apps/mobile/src/components/Dashboard.web.tsx', code, 'utf8');
  console.log('Successfully installed minimalist home layout!');
} else {
  console.log('Could not find exact home block markers');
}
