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
  const barrelStartX = 115;
  const barrelEndX = 540;
  const scaleLength = barrelEndX - barrelStartX; // 425px
  const clampedUnits = Math.min(maxUi, Math.max(0, units100Ui));
  const liquidTargetX = barrelStartX + (clampedUnits / maxUi) * scaleLength;

  // Steps for graduation ticks
  const tickStep = syringeType === '100ui' ? 10 : 5;
  const numTicks = Math.round(maxUi / tickStep);

  return (
    <section
      className="tl-card"
      style={{
        background: '#0b1329',
        border: '2px solid #1e293b',
        borderTop: '5px solid #0d9488',
        color: '#f8fafc',
        borderRadius: '16px',
        padding: '24px 20px',
      }}
    >
      {/* Header Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        <span style={{ color: '#2dd4bf', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: '0.85rem', letterSpacing: '0.5px' }}>
          <Icon name="activity" size={17} /> EXCLUSIVIDADE TIRZE-LIFE · SEGURANÇA MÁXIMA
        </span>
        <span style={{ fontSize: '0.8rem', background: 'rgba(13, 148, 136, 0.25)', color: '#2dd4bf', border: '1px solid #0d9488', padding: '4px 12px', borderRadius: 999, fontWeight: 700 }}>
          Diluição &amp; Seringas
        </span>
      </div>

      <h2 style={{ fontSize: '1.45rem', marginBottom: 8, color: '#ffffff', fontWeight: 800 }}>
        Calculadora Visual de Seringa &amp; Manipulados
      </h2>
      <p style={{ fontSize: '0.95rem', color: '#94a3b8', marginBottom: 20, lineHeight: 1.5 }}>
        Evite o erro nº 1 de quem usa frasco-ampola ou manipulado: veja na réplica gráfica da seringa exatamente até onde puxar o êmbolo.
      </p>

      {/* Preset selector buttons */}
      <div style={{ marginBottom: 22 }}>
        <label style={{ fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#cbd5e1', display: 'block', marginBottom: 10 }}>
          FRASCOS MAIS COMUNS NO BRASIL
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
                  fontSize: '0.85rem',
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: isSelected ? '2px solid #2dd4bf' : '1.5px solid #334155',
                  background: isSelected ? 'rgba(13, 148, 136, 0.35)' : '#0f172a',
                  color: isSelected ? '#5eead4' : '#cbd5e1',
                  fontWeight: isSelected ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 QUADROS COM ALTO CONTRASTE ABSOLUTO (SEM TEXTO BRANCO EM FUNDO BRANCO) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 22 }}>
        {/* QUADRO 1: TOTAL NO FRASCO */}
        <div
          style={{
            background: '#0f172a',
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '16px 14px',
          }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              color: '#38bdf8',
              textTransform: 'uppercase',
              display: 'block',
              fontWeight: 800,
              letterSpacing: '0.5px',
              marginBottom: 8,
            }}
          >
            TOTAL NO FRASCO
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              step="1"
              value={totalMg}
              onChange={(e) => setTotalMg(parseFloat(e.target.value) || 0)}
              style={{
                width: '80px',
                fontSize: '1.4rem',
                fontWeight: 900,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '2px solid #38bdf8',
                background: '#020617',
                color: '#ffffff',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>mg</span>
          </div>
        </div>

        {/* QUADRO 2: VOLUME DO FRASCO */}
        <div
          style={{
            background: '#0f172a',
            border: '2px solid #334155',
            borderRadius: '12px',
            padding: '16px 14px',
          }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              color: '#38bdf8',
              textTransform: 'uppercase',
              display: 'block',
              fontWeight: 800,
              letterSpacing: '0.5px',
              marginBottom: 8,
            }}
          >
            VOLUME DO FRASCO
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              step="0.5"
              value={totalMl}
              onChange={(e) => setTotalMl(parseFloat(e.target.value) || 0)}
              style={{
                width: '80px',
                fontSize: '1.4rem',
                fontWeight: 900,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '2px solid #38bdf8',
                background: '#020617',
                color: '#ffffff',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>mL</span>
          </div>
        </div>

        {/* QUADRO 3: DOSE PRESCRITA */}
        <div
          style={{
            background: 'rgba(13, 148, 136, 0.2)',
            border: '2px solid #2dd4bf',
            borderRadius: '12px',
            padding: '16px 14px',
          }}
        >
          <span
            style={{
              fontSize: '0.82rem',
              color: '#2dd4bf',
              textTransform: 'uppercase',
              display: 'block',
              fontWeight: 900,
              letterSpacing: '0.5px',
              marginBottom: 8,
            }}
          >
            DOSE PRESCRITA
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              step="0.25"
              value={targetDoseMg}
              onChange={(e) => setTargetDoseMg(parseFloat(e.target.value) || 0)}
              style={{
                width: '85px',
                fontSize: '1.4rem',
                fontWeight: 900,
                padding: '8px 10px',
                borderRadius: '8px',
                border: '2px solid #2dd4bf',
                background: '#020617',
                color: '#5eead4',
                textAlign: 'center',
              }}
            />
            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#2dd4bf' }}>mg</span>
          </div>
        </div>
      </div>

      {/* SELETOR DE TAMANHO DA SERINGA */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: '0.92rem', color: '#f1f5f9', fontWeight: 800 }}>
          Tipo de Seringa de Insulina:
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['100ui', '50ui', '30ui'] as SyringeType[]).map((st) => {
            const isCur = syringeType === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSyringeType(st)}
                style={{
                  fontSize: '0.85rem',
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: isCur ? '2px solid #2dd4bf' : '1.5px solid #475569',
                  background: isCur ? '#0d9488' : '#0f172a',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: isCur ? 800 : 600,
                  transition: 'all 0.15s ease',
                }}
              >
                {st === '100ui' ? '100 UI (1,0 mL)' : st === '50ui' ? '50 UI (0,5 mL)' : '30 UI (0,3 mL)'}
              </button>
            );
          })}
        </div>
      </div>

      {/* RESULTADO ALVO EM DESTAQUE GIGANTE */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.3) 0%, rgba(2, 6, 23, 0.8) 100%)',
          border: '2px solid #0d9488',
          padding: '16px 20px',
          borderRadius: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: 4 }}>
            ALVO NA SERINGA DE {maxUi} UI
          </span>
          <div style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: 900 }}>
            Puxar exatamente: <span style={{ color: '#2dd4bf', textDecoration: 'underline' }}>{units100Ui} UI</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: 2 }}>Volume em mL</span>
          <span style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 800 }}>
            {volumeToInjectMl.toFixed(2)} mL
          </span>
        </div>
      </div>

      {/* ILUSTRAÇÃO REALISTA DA SERINGA (BD ULTRA-FINE MODEL) */}
      <div
        style={{
          background: '#070d1e',
          borderRadius: 16,
          border: '2px solid #334155',
          padding: '24px 12px 14px',
          marginBottom: 18,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <svg
          viewBox="0 0 660 170"
          style={{ width: '100%', minWidth: '580px', height: 'auto', display: 'block' }}
          role="img"
          aria-label={`Ilustração médica da seringa de ${maxUi} UI com êmbolo puxado até ${units100Ui} UI`}
        >
          <defs>
            {/* Metallic needle gradient */}
            <linearGradient id="needleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#ffffff" />
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
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="30%" stopColor="#ffffff" />
              <stop offset="70%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
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
              <stop offset="0%" stopColor="#475569" />
              <stop offset="25%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#0f172a" />
              <stop offset="75%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Plunger plastic rod gradient */}
            <linearGradient id="rodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f1f5f9" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#64748b" />
            </linearGradient>

            {/* Drop shadow for pointer badge */}
            <filter id="badgeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2dd4bf" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 1. NEEDLE (AGULHA BISELADA) */}
          <line x1="10" y1="85" x2="60" y2="85" stroke="url(#needleGrad)" strokeWidth="3" strokeLinecap="round" />
          <polygon points="10,85 16,83 16,87" fill="#64748b" />

          {/* 2. U-100 ORANGE NEEDLE HUB (CANHÃO LARANJA PADRÃO INSULINA) */}
          <path
            d="M 60,74 L 88,72 L 92,66 L 96,66 L 96,104 L 92,104 L 88,98 L 60,96 Z"
            fill="url(#orangeHubGrad)"
            stroke="#7c2d12"
            strokeWidth="1.8"
          />
          {/* Hub grip ribs */}
          <line x1="72" y1="74" x2="72" y2="96" stroke="#ea580c" strokeWidth="1.5" />
          <line x1="80" y1="73" x2="80" y2="97" stroke="#ea580c" strokeWidth="1.5" />

          {/* 3. BARREL CONE (BICO DE LUER/CONE DO TUBO) */}
          <path d="M 96,73 L 115,65 L 115,105 L 96,97 Z" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.8" />

          {/* 4. PLUNGER ROD (HASTE PLÁSTICA DO ÊMBOLO) */}
          <rect
            x={Math.min(540, liquidTargetX + 26)}
            y="76"
            width={Math.max(15, 630 - (liquidTargetX + 26))}
            height="18"
            fill="url(#rodGrad)"
            stroke="#64748b"
            strokeWidth="1.5"
          />
          <line
            x1={Math.min(540, liquidTargetX + 26)}
            y1="85"
            x2="630"
            y2="85"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="6 4"
          />

          {/* 5. THUMB REST / PLUNGER BUTTON (BOTÃO DO POLEGAR) */}
          <rect x="630" y="52" width="16" height="66" rx="4" fill="url(#rodGrad)" stroke="#475569" strokeWidth="2" />
          <line x1="635" y1="60" x2="635" y2="110" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="640" y1="60" x2="640" y2="110" stroke="#94a3b8" strokeWidth="1.5" />

          {/* 6. SYRINGE BARREL GLASS (CORPO CILÍNDRICO PRINCIPAL) */}
          <rect
            x="115"
            y="52"
            width="430"
            height="66"
            rx="4"
            fill="url(#barrelGlass)"
            stroke="#0f172a"
            strokeWidth="2.5"
          />

          {/* 7. LIQUID MEDICINE FILL (LÍQUIDO DO MEDICAMENTO) */}
          {clampedUnits > 0 && (
            <rect
              x="115"
              y="53.5"
              width={Math.max(0, liquidTargetX - 115)}
              height="63"
              fill="url(#fluidGrad)"
              opacity="0.95"
            />
          )}

          {/* Liquid meniscus shine reflection */}
          {clampedUnits > 0 && (
            <rect
              x="115"
              y="55"
              width={Math.max(0, liquidTargetX - 115)}
              height="8"
              fill="#ffffff"
              opacity="0.4"
            />
          )}

          {/* 8. BLACK RUBBER PLUNGER STOPPER (ÊMBOLO DE BORRACHA PRETO COM ANÉIS DUPLOS) */}
          <g transform={`translate(${liquidTargetX}, 0)`}>
            {/* Front Sealing Ring (Front Face = EXACT DOSE LINE) */}
            <rect x="0" y="53" width="10" height="64" fill="url(#rubberStopperGrad)" stroke="#020617" strokeWidth="1.5" />
            {/* Stopper Waist (recesso central da borracha) */}
            <rect x="10" y="57" width="8" height="56" fill="#0f172a" stroke="#020617" strokeWidth="1" />
            {/* Rear Sealing Ring */}
            <rect x="18" y="53" width="10" height="64" fill="url(#rubberStopperGrad)" stroke="#020617" strokeWidth="1.5" />
            {/* Bevel on front tip */}
            <polygon points="0,53 -4,85 0,117" fill="#0f172a" />
          </g>

          {/* 9. FINGER FLANGE WINGS (ASAS DE APOIO PARA OS DEDOS) */}
          <rect x="545" y="30" width="16" height="110" rx="6" fill="#f1f5f9" stroke="#0f172a" strokeWidth="2.5" />
          <line x1="553" y1="38" x2="553" y2="132" stroke="#cbd5e1" strokeWidth="2" />

          {/* 10. GRADUATION TICKS & NUMBERS (TRAÇOS DE GRADUAÇÃO E NÚMEROS) */}
          {Array.from({ length: numTicks + 1 }).map((_, i) => {
            const val = i * tickStep;
            const x = barrelStartX + (val / maxUi) * scaleLength;
            const isTarget = Math.abs(val - units100Ui) < 0.1;

            return (
              <g key={i}>
                {/* Top tick mark */}
                <line
                  x1={x}
                  y1="52"
                  x2={x}
                  y2={val % 10 === 0 ? "70" : "63"}
                  stroke={isTarget ? "#0d9488" : "#020617"}
                  strokeWidth={isTarget ? "3" : val % 10 === 0 ? "2" : "1.2"}
                />

                {/* Bottom tick mark */}
                <line
                  x1={x}
                  y1={val % 10 === 0 ? "98" : "105"}
                  x2={x}
                  y2="118"
                  stroke={isTarget ? "#0d9488" : "#020617"}
                  strokeWidth={isTarget ? "3" : val % 10 === 0 ? "2" : "1.2"}
                />

                {/* Sub-ticks (intermediate marks) */}
                {val < maxUi && (
                  <>
                    <line x1={x + scaleLength / numTicks / 2} y1="52" x2={x + scaleLength / numTicks / 2} y2="60" stroke="#334155" strokeWidth="1.2" />
                    <line x1={x + scaleLength / numTicks / 2} y1="110" x2={x + scaleLength / numTicks / 2} y2="118" stroke="#334155" strokeWidth="1.2" />
                  </>
                )}

                {/* Number labels (bold black/dark text) */}
                {val % (syringeType === '100ui' ? 10 : 5) === 0 && (
                  <text
                    x={x}
                    y="89"
                    textAnchor="middle"
                    fill={isTarget ? "#0f766e" : "#020617"}
                    fontSize={isTarget ? "14" : "12"}
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}

          {/* 11. DYNAMIC TARGET CALLOUT (SETA E ETIQUETA INDICADORA NO PONTO EXATO) */}
          <g transform={`translate(${liquidTargetX}, 0)`} filter="url(#badgeGlow)">
            {/* Target Line Down into the rubber front ring */}
            <line x1="0" y1="28" x2="0" y2="52" stroke="#2dd4bf" strokeWidth="3" strokeDasharray="3 2" />

            {/* Pointer Triangle */}
            <polygon points="0,50 -7,38 7,38" fill="#2dd4bf" />

            {/* Target Pill Badge */}
            <rect x="-56" y="4" width="112" height="30" rx="8" fill="#0f766e" stroke="#2dd4bf" strokeWidth="2" />
            <text
              x="0"
              y="24"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="13"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              ▼ {units100Ui} UI ALVO
            </text>
          </g>
        </svg>

        {/* Legend beneath the syringe illustration */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, padding: '0 8px', fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>
          <span>◁ Agulha e Canhão Laranja U-100</span>
          <span style={{ color: '#2dd4bf', fontWeight: 900 }}>● Borda Dianteira da Borracha Preta = {units100Ui} UI</span>
          <span>Apoio do Polegar ▷</span>
        </div>
      </div>

      {/* Overflow Warning if units exceed syringe */}
      {units100Ui > maxUi && (
        <div style={{ background: '#7f1d1d', border: '2px solid #ef4444', color: '#fef2f2', padding: '12px 16px', borderRadius: 10, marginBottom: 16, fontWeight: 800, fontSize: '0.92rem' }}>
          ⚠️ Atenção: A dose necessária ({units100Ui} UI) é maior do que a capacidade desta seringa de {maxUi} UI. Selecione a seringa de 100 UI acima para aplicar com segurança.
        </div>
      )}

      {/* PASSO A PASSO DA APLICAÇÃO EM CAIXA DE ALTO CONTRASTE */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.85)',
          borderRadius: 12,
          padding: '18px 20px',
          border: '2px solid #0d9488',
        }}
      >
        <strong style={{ fontSize: '1.05rem', color: '#2dd4bf', display: 'block', marginBottom: 8, fontWeight: 900 }}>
          Orientação Prática para sua Aplicação:
        </strong>
        <p style={{ fontSize: '0.92rem', color: '#e2e8f0', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
          Com a concentração de <strong style={{ color: '#ffffff' }}>{concentrationMgPerMl.toFixed(1)} mg/mL</strong> (frasco de {totalMg}mg em {totalMl}mL), para aplicar a sua dose prescrita de <strong style={{ color: '#2dd4bf' }}>{targetDoseMg} mg</strong>:
        </p>
        <div
          style={{
            marginTop: 10,
            padding: '12px 16px',
            background: '#020617',
            borderRadius: 8,
            border: '2px solid #2dd4bf',
            color: '#ffffff',
            fontSize: '1rem',
            fontWeight: 800,
          }}
        >
          👉 Puxe o êmbolo até que a <span style={{ color: '#2dd4bf' }}>primeira borda da borracha preta</span> fique perfeitamente alinhada com o traço <span style={{ color: '#2dd4bf' }}>{units100Ui} UI ({volumeToInjectMl.toFixed(2)} mL)</span>.
        </div>
      </div>

      {/* Safety Medical Disclaimer */}
      <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 14, marginBottom: 0, lineHeight: 1.45 }}>
        * Ferramenta de auxílio matemático. Nunca altere sua dose sem prescrição médica. Sempre confirme a concentração e volume indicados no rótulo da farmácia de manipulação credenciada antes da aplicação.
      </p>
    </section>
  );
}
