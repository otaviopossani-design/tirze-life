import React, { useState } from 'react';
import { Icon } from './dashboard-ui';

interface DilutionPreset {
  name: string;
  medication: string;
  totalMg: number;
  totalMl: number;
  typicalDoses: number[];
}

const COMMON_PRESETS: DilutionPreset[] = [
  {
    name: 'Tirzepatida 10 mg / 2 mL (Padrão)',
    medication: 'Tirzepatida',
    totalMg: 10,
    totalMl: 2.0,
    typicalDoses: [1.25, 2.5, 3.75, 5.0],
  },
  {
    name: 'Tirzepatida 20 mg / 2 mL (Concentrado)',
    medication: 'Tirzepatida',
    totalMg: 20,
    totalMl: 2.0,
    typicalDoses: [2.5, 5.0, 7.5, 10.0],
  },
  {
    name: 'Tirzepatida 30 mg / 3 mL',
    medication: 'Tirzepatida',
    totalMg: 30,
    totalMl: 3.0,
    typicalDoses: [2.5, 5.0, 7.5, 10.0, 15.0],
  },
  {
    name: 'Retatrutida 10 mg / 2 mL (Pesquisa)',
    medication: 'Retatrutida',
    totalMg: 10,
    totalMl: 2.0,
    typicalDoses: [1.0, 2.0, 4.0],
  },
  {
    name: 'GHK-Cu / Glow 50 mg / 2 mL',
    medication: 'GHK-Cu',
    totalMg: 50,
    totalMl: 2.0,
    typicalDoses: [1.0, 2.0, 2.5],
  },
];

type SyringeType = '100ui' | '50ui' | '30ui';

export default function SyringeCalculator() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const preset = COMMON_PRESETS[selectedPresetIndex] ?? COMMON_PRESETS[0]!;

  const [totalMg, setTotalMg] = useState(preset.totalMg);
  const [totalMl, setTotalMl] = useState(preset.totalMl);
  const [targetDoseMg, setTargetDoseMg] = useState(preset.typicalDoses[1] ?? 2.5);
  const [syringeType, setSyringeType] = useState<SyringeType>('100ui');

  const handlePresetSelect = (idx: number) => {
    const p = COMMON_PRESETS[idx];
    if (!p) return;
    setSelectedPresetIndex(idx);
    setTotalMg(p.totalMg);
    setTotalMl(p.totalMl);
    setTargetDoseMg(p.typicalDoses[1] ?? p.typicalDoses[0] ?? 2.5);
  };

  // Concentration in mg/mL
  const concentrationMgPerMl = totalMl > 0 ? totalMg / totalMl : 0;
  // Volume to inject in mL
  const volumeToInjectMl = concentrationMgPerMl > 0 ? targetDoseMg / concentrationMgPerMl : 0;
  // Units in 100 UI syringe (1 mL = 100 UI)
  const units100Ui = Math.round(volumeToInjectMl * 100 * 10) / 10;
  // Scale max UI by syringe type
  const maxUi = syringeType === '100ui' ? 100 : syringeType === '50ui' ? 50 : 30;

  // Syringe SVG scale dimensions
  const barrelStartX = 110;
  const barrelEndX = 540;
  const scaleLength = barrelEndX - barrelStartX; // 430px
  const clampedUnits = Math.min(maxUi, Math.max(0, units100Ui));
  const liquidTargetX = barrelStartX + (clampedUnits / maxUi) * scaleLength;

  // Steps for graduation ticks
  const tickStep = syringeType === '100ui' ? 10 : syringeType === '50ui' ? 5 : 5;
  const numTicks = Math.round(maxUi / tickStep);

  return (
    <section className="tl-card" style={{ borderTop: '4px solid var(--accent, #0d9488)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <span className="tl-kicker" style={{ color: 'var(--accent, #0d9488)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
          <Icon name="activity" size={16} /> EXCLUSIVIDADE TIRZE-LIFE · SEGURANÇA MÁXIMA
        </span>
        <span style={{ fontSize: '0.78rem', background: 'var(--soft, #e6eddf)', color: 'var(--accent, #0d9488)', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>
          Diluição &amp; Seringas
        </span>
      </div>

      <h2 style={{ fontSize: '1.35rem', marginBottom: 6, color: 'var(--text)' }}>
        Calculadora Visual de Seringa &amp; Manipulados
      </h2>
      <p style={{ fontSize: '0.92rem', color: 'var(--muted)', marginBottom: 18, lineHeight: 1.5 }}>
        Evite o erro nº 1 de quem usa frasco-ampola ou manipulado: veja na réplica gráfica da seringa exatamente até onde puxar o êmbolo.
      </p>

      {/* Preset selector buttons */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--text)', display: 'block', marginBottom: 8 }}>
          Frascos Mais Comuns no Brasil
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {COMMON_PRESETS.map((p, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetSelect(idx)}
                style={{
                  fontSize: '0.82rem',
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: isSelected ? '2px solid var(--accent, #0d9488)' : '1px solid var(--line, #cbd5e1)',
                  background: isSelected ? 'var(--accent, #0d9488)' : 'var(--card, #ffffff)',
                  color: isSelected ? '#ffffff' : 'var(--text, #1e293b)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.15)' : 'none',
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Numerical inputs with HIGH CONTRAST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div style={{ background: 'var(--bg, #f8fafc)', border: '1.5px solid var(--line, #cbd5e1)', padding: 12, borderRadius: 10 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text, #1e293b)', textTransform: 'uppercase', display: 'block', fontWeight: 700, marginBottom: 4 }}>
            Total no Frasco
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              step="1"
              value={totalMg}
              onChange={(e) => setTotalMg(parseFloat(e.target.value) || 0)}
              style={{
                width: '75px',
                fontSize: '1.15rem',
                fontWeight: 800,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1.5px solid var(--line, #94a3b8)',
                background: 'var(--card, #ffffff)',
                color: 'var(--text, #0f172a)',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #1e293b)' }}>mg</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg, #f8fafc)', border: '1.5px solid var(--line, #cbd5e1)', padding: 12, borderRadius: 10 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--text, #1e293b)', textTransform: 'uppercase', display: 'block', fontWeight: 700, marginBottom: 4 }}>
            Volume do Frasco
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              step="0.5"
              value={totalMl}
              onChange={(e) => setTotalMl(parseFloat(e.target.value) || 0)}
              style={{
                width: '75px',
                fontSize: '1.15rem',
                fontWeight: 800,
                padding: '6px 8px',
                borderRadius: 6,
                border: '1.5px solid var(--line, #94a3b8)',
                background: 'var(--card, #ffffff)',
                color: 'var(--text, #0f172a)',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #1e293b)' }}>mL</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg, #f8fafc)', border: '2px solid var(--accent, #0d9488)', padding: 12, borderRadius: 10 }}>
          <label style={{ fontSize: '0.78rem', color: 'var(--accent, #0d9488)', textTransform: 'uppercase', display: 'block', fontWeight: 800, marginBottom: 4 }}>
            Dose Prescrita
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <input
              type="number"
              step="0.25"
              value={targetDoseMg}
              onChange={(e) => setTargetDoseMg(parseFloat(e.target.value) || 0)}
              style={{
                width: '75px',
                fontSize: '1.15rem',
                fontWeight: 800,
                padding: '6px 8px',
                borderRadius: 6,
                border: '2px solid var(--accent, #0d9488)',
                background: 'var(--card, #ffffff)',
                color: 'var(--accent, #0d9488)',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent, #0d9488)' }}>mg</span>
          </div>
        </div>
      </div>

      {/* Syringe Type Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 700 }}>
          Tipo de Seringa de Insulina:
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['100ui', '50ui', '30ui'] as SyringeType[]).map((st) => {
            const isCur = syringeType === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSyringeType(st)}
                style={{
                  fontSize: '0.8rem',
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: isCur ? '2px solid var(--accent, #0d9488)' : '1px solid var(--line, #cbd5e1)',
                  background: isCur ? 'var(--accent, #0d9488)' : 'var(--card, #ffffff)',
                  color: isCur ? '#ffffff' : 'var(--text, #1e293b)',
                  cursor: 'pointer',
                  fontWeight: isCur ? 700 : 600,
                }}
              >
                {st === '100ui' ? '100 UI (1,0 mL)' : st === '50ui' ? '50 UI (0,5 mL)' : '30 UI (0,3 mL)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* TARGET SUMMARY BANNER */}
      <div style={{ background: 'var(--soft, #e6eddf)', padding: '12px 16px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)', display: 'block' }}>
            Marcação na Seringa de {maxUi} UI
          </span>
          <strong style={{ fontSize: '1.4rem', color: 'var(--text)', fontWeight: 800 }}>
            Puxar até: <span style={{ color: 'var(--accent, #0d9488)' }}>{units100Ui} UI</span>
          </strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Volume equivalente</span>
          <strong style={{ fontSize: '1.1rem', color: 'var(--text)', fontWeight: 700 }}>
            {volumeToInjectMl.toFixed(2)} mL
          </strong>
        </div>
      </div>

      {/* REALISTIC MEDICAL SYRINGE SVG (BD ULTRA-FINE MODEL) */}
      <div style={{ background: '#ffffff', borderRadius: 12, border: '2px solid #cbd5e1', padding: '20px 10px 10px', marginBottom: 16, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <svg
          viewBox="0 0 660 170"
          style={{ width: '100%', minWidth: '580px', height: 'auto', display: 'block' }}
          role="img"
          aria-label={`Ilustração da seringa de ${maxUi} UI com líquido até a marca de ${units100Ui} UI`}
        >
          <defs>
            {/* Metallic needle gradient */}
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* U-100 Orange hub gradient */}
            <linearGradient id="orangeHubGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>

            {/* Crystal clear barrel glass gradient */}
            <linearGradient id="barrelGlass" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(241, 245, 249, 0.85)" />
              <stop offset="30%" stopColor="rgba(255, 255, 255, 0.98)" />
              <stop offset="70%" stopColor="rgba(255, 255, 255, 0.85)" />
              <stop offset="100%" stopColor="rgba(226, 232, 240, 0.9)" />
            </linearGradient>

            {/* Medicine fluid gradient */}
            <linearGradient id="fluidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="40%" stopColor="#0d9488" />
              <stop offset="80%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>

            {/* Black rubber stopper gradient with 3D cylindrical lighting */}
            <linearGradient id="rubberStopperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="25%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Plunger plastic rod gradient */}
            <linearGradient id="rodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Drop shadow for pointer badge */}
            <filter id="badgeShadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* 1. NEEDLE (AGULHA BISELADA) */}
          <line x1="8" y1="85" x2="60" y2="85" stroke="url(#needleGrad)" strokeWidth="3" strokeLinecap="round" />
          {/* Needle Bevel Tip */}
          <polygon points="8,85 14,83 14,87" fill="#64748b" />

          {/* 2. U-100 ORANGE NEEDLE HUB (CANHÃO LARANJA PADRÃO INSULINA) */}
          <path
            d="M 60,74 L 88,72 L 92,66 L 96,66 L 96,104 L 92,104 L 88,98 L 60,96 Z"
            fill="url(#orangeHubGrad)"
            stroke="#9a3412"
            strokeWidth="1.5"
          />
          {/* Hub grip ribs */}
          <line x1="72" y1="74" x2="72" y2="96" stroke="#ea580c" strokeWidth="1.5" />
          <line x1="80" y1="73" x2="80" y2="97" stroke="#ea580c" strokeWidth="1.5" />

          {/* 3. BARREL CONE (BICO DE LUER/CONE DO TUBO) */}
          <path d="M 96,73 L 110,65 L 110,105 L 96,97 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />

          {/* 4. PLUNGER ROD (HASTE PLÁSTICA DO ÊMBOLO) EXTENDING TO THE RIGHT */}
          <rect
            x={Math.min(540, liquidTargetX + 26)}
            y="76"
            width={Math.max(15, 630 - (liquidTargetX + 26))}
            height="18"
            fill="url(#rodGrad)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          {/* Ribs on plunger rod */}
          <line
            x1={Math.min(540, liquidTargetX + 26)}
            y1="85"
            x2="630"
            y2="85"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {/* 5. THUMB REST / PLUNGER BUTTON (BOTÃO DO POLEGAR) */}
          <rect x="630" y="55" width="14" height="60" rx="4" fill="url(#rodGrad)" stroke="#64748b" strokeWidth="1.5" />
          {/* Finger grip texture on thumb button */}
          <line x1="634" y1="62" x2="634" y2="108" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="638" y1="62" x2="638" y2="108" stroke="#94a3b8" strokeWidth="1.5" />

          {/* 6. SYRINGE BARREL GLASS (CORPO CILÍNDRICO PRINCIPAL) */}
          <rect
            x="110"
            y="52"
            width="435"
            height="66"
            rx="4"
            fill="url(#barrelGlass)"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* 7. LIQUID MEDICINE FILL (LÍQUIDO DO MEDICAMENTO) */}
          {clampedUnits > 0 && (
            <rect
              x="110"
              y="53.5"
              width={Math.max(0, liquidTargetX - 110)}
              height="63"
              fill="url(#fluidGrad)"
              opacity="0.92"
            />
          )}

          {/* Liquid meniscus shine reflection */}
          {clampedUnits > 0 && (
            <rect
              x="110"
              y="55"
              width={Math.max(0, liquidTargetX - 110)}
              height="8"
              fill="#ffffff"
              opacity="0.35"
            />
          )}

          {/* 8. BLACK RUBBER PLUNGER STOPPER (ÊMBOLO DE BORRACHA PRETO COM ANÉIS DUPLOS) */}
          <g transform={`translate(${liquidTargetX}, 0)`}>
            {/* Front Sealing Ring (Front Face = EXACT DOSE LINE) */}
            <rect x="0" y="53" width="9" height="64" fill="url(#rubberStopperGrad)" stroke="#090d16" strokeWidth="1" />
            {/* Stopper Waist (recesso central da borracha) */}
            <rect x="9" y="57" width="8" height="56" fill="#0f172a" stroke="#020617" strokeWidth="0.8" />
            {/* Rear Sealing Ring */}
            <rect x="17" y="53" width="9" height="64" fill="url(#rubberStopperGrad)" stroke="#090d16" strokeWidth="1" />
            {/* Bevel on front tip */}
            <polygon points="0,53 -4,85 0,117" fill="#0f172a" />
          </g>

          {/* 9. FINGER FLANGE WINGS (ASAS DE APOIO PARA OS DEDOS) */}
          <rect x="545" y="32" width="16" height="106" rx="6" fill="#f1f5f9" stroke="#475569" strokeWidth="2" />
          <line x1="553" y1="38" x2="553" y2="132" stroke="#cbd5e1" strokeWidth="2" />

          {/* 10. GRADUATION TICKS & NUMBERS (TRAÇOS DE GRADUAÇÃO E NÚMEROS) */}
          {Array.from({ length: numTicks + 1 }).map((_, i) => {
            const val = i * tickStep;
            const x = barrelStartX + (val / maxUi) * scaleLength;
            const isTarget = Math.abs(val - units100Ui) < 0.1;

            return (
              <g key={i}>
                {/* Major tick mark */}
                <line
                  x1={x}
                  y1="52"
                  x2={x}
                  y2={val % 10 === 0 ? "70" : "63"}
                  stroke={isTarget ? "#0d9488" : "#0f172a"}
                  strokeWidth={isTarget ? "2.5" : val % 10 === 0 ? "1.8" : "1.2"}
                />

                {/* Bottom tick mark */}
                <line
                  x1={x}
                  y1={val % 10 === 0 ? "98" : "105"}
                  x2={x}
                  y2="118"
                  stroke={isTarget ? "#0d9488" : "#0f172a"}
                  strokeWidth={isTarget ? "2.5" : val % 10 === 0 ? "1.8" : "1.2"}
                />

                {/* Sub-ticks (intermediate 1 or 2 UI marks) */}
                {val < maxUi && (
                  <>
                    <line x1={x + scaleLength / numTicks / 2} y1="52" x2={x + scaleLength / numTicks / 2} y2="60" stroke="#334155" strokeWidth="1" />
                    <line x1={x + scaleLength / numTicks / 2} y1="110" x2={x + scaleLength / numTicks / 2} y2="118" stroke="#334155" strokeWidth="1" />
                  </>
                )}

                {/* Number labels (always clear bold black/dark slate) */}
                {val % (syringeType === '100ui' ? 10 : 5) === 0 && (
                  <text
                    x={x}
                    y="89"
                    textAnchor="middle"
                    fill={isTarget ? "#0f766e" : "#0f172a"}
                    fontSize={isTarget ? "13" : "11"}
                    fontWeight={isTarget ? "900" : "700"}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}

          {/* 11. DYNAMIC TARGET CALLOUT (SETA E ETIQUETA INDICADORA NO PONTO EXATO) */}
          <g transform={`translate(${liquidTargetX}, 0)`} filter="url(#badgeShadow)">
            {/* Target Line Down into the rubber front ring */}
            <line x1="0" y1="28" x2="0" y2="52" stroke="#0d9488" strokeWidth="3" strokeDasharray="3 2" />

            {/* Pointer Triangle */}
            <polygon points="0,50 -6,40 6,40" fill="#0d9488" />

            {/* Target Pill Badge */}
            <rect x="-48" y="6" width="96" height="26" rx="6" fill="#0d9488" stroke="#ffffff" strokeWidth="1.5" />
            <text
              x="0"
              y="23"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="12"
              fontWeight="800"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              ▼ {units100Ui} UI ALVO
            </text>
          </g>
        </svg>

        {/* Legend beneath the syringe illustration */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '0 8px', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
          <span>◁ Agulha e Canhão Laranja U-100</span>
          <span style={{ color: '#0f766e', fontWeight: 700 }}>● Borda Dianteira da Borracha Preta = {units100Ui} UI</span>
          <span>Apoio do Polegar ▷</span>
        </div>
      </div>

      {/* Overflow Warning if units exceed syringe */}
      {units100Ui > maxUi && (
        <div style={{ background: '#fef2f2', border: '1.5px solid #ef4444', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 14, fontWeight: 700, fontSize: '0.86rem' }}>
          ⚠️ Atenção: A dose necessária ({units100Ui} UI) é maior do que a capacidade desta seringa de {maxUi} UI. Selecione a seringa de 100 UI acima para aplicar com segurança.
        </div>
      )}

      {/* Result Explanatory Box (HIGH CONTRAST) */}
      <div style={{ background: 'var(--soft, #e6eddf)', borderRadius: 10, padding: '14px 16px', borderLeft: '5px solid var(--accent, #0d9488)' }}>
        <strong style={{ fontSize: '0.95rem', color: 'var(--accent, #0d9488)', display: 'block', marginBottom: 6, fontWeight: 800 }}>
          Orientação Prática para sua Aplicação:
        </strong>
        <p style={{ fontSize: '0.88rem', color: 'var(--text, #1e293b)', margin: 0, lineHeight: 1.55, fontWeight: 600 }}>
          Para a concentração de <strong>{concentrationMgPerMl.toFixed(1)} mg/mL</strong> (frasco de {totalMg}mg em {totalMl}mL), para aplicar a sua dose prescrita de <strong>{targetDoseMg} mg</strong>:
        </p>
        <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--card, #ffffff)', borderRadius: 8, border: '1px solid var(--line, #cbd5e1)', color: 'var(--text, #1e293b)' }}>
          👉 Puxe o êmbolo até que a <strong>primeira borda da borracha preta</strong> fique perfeitamente alinhada com o traço <strong>{units100Ui} UI ({volumeToInjectMl.toFixed(2)} mL)</strong>.
        </div>
      </div>

      {/* Safety Medical Disclaimer */}
      <p style={{ fontSize: '0.72rem', color: 'var(--muted, #64748b)', marginTop: 12, marginBottom: 0, lineHeight: 1.4 }}>
        * Ferramenta de auxílio matemático. Nunca altere sua dose sem prescrição médica. Sempre confirme a concentração e volume indicados no rótulo da farmácia de manipulação credenciada antes da aplicação.
      </p>
    </section>
  );
}
