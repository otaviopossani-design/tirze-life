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
    name: 'Tirzepatida 10mg / 2mL',
    medication: 'Tirzepatida',
    totalMg: 10,
    totalMl: 2.0,
    typicalDoses: [1.25, 2.5, 3.75, 5.0],
  },
  {
    name: 'Tirzepatida 20mg / 2mL',
    medication: 'Tirzepatida',
    totalMg: 20,
    totalMl: 2.0,
    typicalDoses: [2.5, 5.0, 7.5, 10.0],
  },
  {
    name: 'Tirzepatida 30mg / 3mL',
    medication: 'Tirzepatida',
    totalMg: 30,
    totalMl: 3.0,
    typicalDoses: [2.5, 5.0, 7.5, 10.0, 15.0],
  },
  {
    name: 'Retatrutida 10mg / 2mL',
    medication: 'Retatrutida',
    totalMg: 10,
    totalMl: 2.0,
    typicalDoses: [1.0, 2.0, 4.0],
  },
  {
    name: 'GHK-Cu Glow 50mg / 2mL',
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

  // Syringe SVG scale dimensions (delicate, slim medical aesthetic)
  const barrelStartX = 112;
  const barrelEndX = 540;
  const scaleLength = barrelEndX - barrelStartX; // 428px
  const clampedUnits = Math.min(maxUi, Math.max(0, units100Ui));
  const liquidTargetX = barrelStartX + (clampedUnits / maxUi) * scaleLength;

  // Steps for graduation ticks
  const tickStep = syringeType === '100ui' ? 10 : 5;
  const numTicks = Math.round(maxUi / tickStep);

  return (
    <section
      className="tl-card"
      style={{
        background: 'var(--card, #ffffff)',
        border: '1px solid var(--line, #e2e8f0)',
        borderRadius: '16px',
        padding: '18px 16px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Delicate Accent Top Line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 16,
          right: 16,
          height: '2px',
          background: 'linear-gradient(90deg, transparent 0%, var(--accent, #0d9488) 50%, transparent 100%)',
          opacity: 0.8,
        }}
      />

      {/* Header - Soft, Elegant */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--accent, #0d9488)', display: 'flex', opacity: 0.9 }}>
            <Icon name="activity" size={15} />
          </span>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent, #0d9488)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>
            Guia Visual de Diluição
          </span>
        </div>
        <span
          style={{
            fontSize: '0.7rem',
            background: 'var(--soft, rgba(13, 148, 136, 0.08))',
            color: 'var(--accent, #0d9488)',
            border: '1px solid rgba(13, 148, 136, 0.15)',
            padding: '2px 8px',
            borderRadius: 999,
            fontWeight: 600,
          }}
        >
          {concentrationMgPerMl.toFixed(1)} mg/mL
        </span>
      </div>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text)', margin: '0 0 4px 0', letterSpacing: '-0.3px' }}>
        Calculadora de Seringa
      </h2>
      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: '0 0 14px 0', lineHeight: 1.45 }}>
        Conferência da marcação exata na seringa para seu frasco de aplicação.
      </p>

      {/* Preset Chips - Delicate Pill Carousel */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
          Frasco em uso
        </div>
        <div
          style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            paddingBottom: 4,
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
          }}
        >
          {COMMON_PRESETS.map((p, idx) => {
            const isSelected = selectedPresetIndex === idx;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => handlePresetSelect(idx)}
                style={{
                  flexShrink: 0,
                  fontSize: '0.74rem',
                  padding: '5px 11px',
                  borderRadius: 999,
                  border: isSelected ? '1px solid var(--accent, #0d9488)' : '1px solid var(--line, #e2e8f0)',
                  background: isSelected ? 'var(--soft, rgba(13, 148, 136, 0.12))' : 'transparent',
                  color: isSelected ? 'var(--accent, #0d9488)' : 'var(--muted)',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Delicate Metric Cards (Total, Volume, Dose) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        {/* Card 1: Total */}
        <div
          style={{
            background: 'var(--soft, rgba(0, 0, 0, 0.02))',
            border: '1px solid var(--line, #e2e8f0)',
            borderRadius: 10,
            padding: '8px 6px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 3 }}>
            Frasco
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
            <input
              type="number"
              step="1"
              value={totalMg}
              onChange={(e) => setTotalMg(parseFloat(e.target.value) || 0)}
              style={{
                width: '42px',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '1px 0',
                border: 'none',
                borderBottom: '1px solid var(--line, #cbd5e1)',
                background: 'transparent',
                color: 'var(--text)',
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>mg</span>
          </div>
        </div>

        {/* Card 2: Volume */}
        <div
          style={{
            background: 'var(--soft, rgba(0, 0, 0, 0.02))',
            border: '1px solid var(--line, #e2e8f0)',
            borderRadius: 10,
            padding: '8px 6px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.62rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 3 }}>
            Volume
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
            <input
              type="number"
              step="0.5"
              value={totalMl}
              onChange={(e) => setTotalMl(parseFloat(e.target.value) || 0)}
              style={{
                width: '42px',
                fontSize: '1rem',
                fontWeight: 600,
                padding: '1px 0',
                border: 'none',
                borderBottom: '1px solid var(--line, #cbd5e1)',
                background: 'transparent',
                color: 'var(--text)',
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>mL</span>
          </div>
        </div>

        {/* Card 3: Dose Prescrita */}
        <div
          style={{
            background: 'var(--soft, rgba(13, 148, 136, 0.07))',
            border: '1px solid rgba(13, 148, 136, 0.25)',
            borderRadius: 10,
            padding: '8px 6px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '0.62rem', color: 'var(--accent, #0d9488)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: 3 }}>
            Dose Alvo
          </span>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2 }}>
            <input
              type="number"
              step="0.25"
              value={targetDoseMg}
              onChange={(e) => setTargetDoseMg(parseFloat(e.target.value) || 0)}
              style={{
                width: '46px',
                fontSize: '1rem',
                fontWeight: 700,
                padding: '1px 0',
                border: 'none',
                borderBottom: '1.5px solid var(--accent, #0d9488)',
                background: 'transparent',
                color: 'var(--accent, #0d9488)',
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--accent, #0d9488)' }}>mg</span>
          </div>
        </div>
      </div>

      {/* Syringe Type Toggle - Soft Minimalist Segmented Pill */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 12 }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--muted)', fontWeight: 500 }}>
          Seringa utilizada:
        </span>
        <div style={{ display: 'inline-flex', background: 'var(--soft, rgba(0,0,0,0.03))', padding: 2, borderRadius: 8, border: '1px solid var(--line, #e2e8f0)' }}>
          {(['100ui', '50ui', '30ui'] as SyringeType[]).map((st) => {
            const isCur = syringeType === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setSyringeType(st)}
                style={{
                  fontSize: '0.7rem',
                  padding: '3px 9px',
                  borderRadius: 6,
                  border: 'none',
                  background: isCur ? 'var(--card, #ffffff)' : 'transparent',
                  color: isCur ? 'var(--accent, #0d9488)' : 'var(--muted)',
                  cursor: 'pointer',
                  fontWeight: isCur ? 700 : 500,
                  boxShadow: isCur ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {st === '100ui' ? '100 UI' : st === '50ui' ? '50 UI' : '30 UI'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Result - Delicate Pill Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--soft, #f0fdfa) 0%, rgba(13, 148, 136, 0.06) 100%)',
          border: '1px solid rgba(13, 148, 136, 0.18)',
          padding: '9px 12px',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--muted)', fontWeight: 500 }}>Alvo na seringa:</span>
          <strong style={{ fontSize: '1.05rem', color: 'var(--accent, #0d9488)', fontWeight: 700 }}>
            {units100Ui} UI
          </strong>
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--muted)' }}>
          Equivale a <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{volumeToInjectMl.toFixed(2)} mL</strong>
        </div>
      </div>

      {/* DELICATE MEDICAL SYRINGE SVG (ULTRA-FINE GLASS & SATIN SILICONE) */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.02) 0%, rgba(0, 0, 0, 0.02) 100%)',
          borderRadius: 12,
          border: '1px solid var(--line, #e2e8f0)',
          padding: '16px 8px 8px',
          marginBottom: 10,
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <svg
          viewBox="0 0 660 100"
          style={{ width: '100%', minWidth: '460px', height: 'auto', display: 'block' }}
          role="img"
          aria-label={`Seringa com êmbolo puxado até ${units100Ui} UI`}
        >
          <defs>
            {/* Satin stainless steel needle */}
            <linearGradient id="needleFine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="50%" stopColor="#f8fafc" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>

            {/* Soft coral/orange hub */}
            <linearGradient id="hubFine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fdba74" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>

            {/* Luminous crystal barrel glass */}
            <linearGradient id="glassFine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(248, 250, 252, 0.9)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.98)" />
              <stop offset="100%" stopColor="rgba(241, 245, 249, 0.85)" />
            </linearGradient>

            {/* Translucent mint medicine liquid */}
            <linearGradient id="fluidFine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#14b8a6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.75" />
            </linearGradient>

            {/* Soft silicone charcoal stopper (delicate, not aggressive black) */}
            <linearGradient id="stopperFine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Plunger satin rod */}
            <linearGradient id="rodFine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="50%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
          </defs>

          {/* 1. Fine Needle (Stainless Steel) */}
          <line x1="14" y1="52" x2="62" y2="52" stroke="url(#needleFine)" strokeWidth="1.8" strokeLinecap="round" />
          <polygon points="14,52 18,50.8 18,53.2" fill="#94a3b8" />

          {/* 2. Soft Coral Insulin Hub */}
          <path
            d="M 62,45 L 86,44 L 90,41 L 94,41 L 94,63 L 90,63 L 86,60 L 62,59 Z"
            fill="url(#hubFine)"
            stroke="#ea580c"
            strokeWidth="0.8"
            opacity="0.9"
          />
          <line x1="74" y1="45" x2="74" y2="59" stroke="#fed7aa" strokeWidth="0.8" />
          <line x1="82" y1="44" x2="82" y2="60" stroke="#fed7aa" strokeWidth="0.8" />

          {/* 3. Luer Barrel Cone */}
          <path d="M 94,46 L 112,38 L 112,66 L 94,58 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />

          {/* 4. Plunger Satin Rod (Extending Right) */}
          <rect
            x={Math.min(540, liquidTargetX + 20)}
            y="47"
            width={Math.max(12, 630 - (liquidTargetX + 20))}
            height="10"
            fill="url(#rodFine)"
            stroke="#cbd5e1"
            strokeWidth="0.8"
            rx="1"
          />

          {/* 5. Plunger Thumb Rest Button */}
          <rect x="630" y="32" width="10" height="40" rx="3" fill="url(#rodFine)" stroke="#94a3b8" strokeWidth="1" />

          {/* 6. Syringe Barrel Glass Tube */}
          <rect
            x="112"
            y="30"
            width="430"
            height="44"
            rx="4"
            fill="url(#glassFine)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />

          {/* 7. Translucent Mint Medicine Fluid */}
          {clampedUnits > 0 && (
            <rect
              x="112"
              y="31"
              width={Math.max(0, liquidTargetX - 112)}
              height="42"
              fill="url(#fluidFine)"
              rx="1"
            />
          )}

          {/* Meniscus Light Glow */}
          {clampedUnits > 0 && (
            <rect
              x="112"
              y="32"
              width={Math.max(0, liquidTargetX - 112)}
              height="5"
              fill="#ffffff"
              opacity="0.45"
            />
          )}

          {/* 8. Silicone Stopper (Delicate Dual Ring) */}
          <g transform={`translate(${liquidTargetX}, 0)`}>
            {/* Front sealing ring (exact dose alignment!) */}
            <rect x="0" y="31" width="7" height="42" fill="url(#stopperFine)" stroke="#1e293b" strokeWidth="0.8" rx="0.5" />
            {/* Stopper center waist */}
            <rect x="7" y="34" width="6" height="36" fill="#334155" opacity="0.9" />
            {/* Rear sealing ring */}
            <rect x="13" y="31" width="7" height="42" fill="url(#stopperFine)" stroke="#1e293b" strokeWidth="0.8" rx="0.5" />
          </g>

          {/* 9. Finger Flange Wings */}
          <rect x="542" y="20" width="10" height="64" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />

          {/* 10. Graduation Ticks & Numbers (Delicate Hairline & Clean Font) */}
          {Array.from({ length: numTicks + 1 }).map((_, i) => {
            const val = i * tickStep;
            const x = barrelStartX + (val / maxUi) * scaleLength;
            const isTarget = Math.abs(val - units100Ui) < 0.1;

            return (
              <g key={i}>
                {/* Top tick mark */}
                <line
                  x1={x}
                  y1="30"
                  x2={x}
                  y2={val % 10 === 0 ? "41" : "36"}
                  stroke={isTarget ? "#0d9488" : "#475569"}
                  strokeWidth={isTarget ? "1.8" : val % 10 === 0 ? "1.2" : "0.7"}
                  opacity={isTarget ? 1 : 0.8}
                />

                {/* Bottom tick mark */}
                <line
                  x1={x}
                  y1={val % 10 === 0 ? "63" : "68"}
                  x2={x}
                  y2="74"
                  stroke={isTarget ? "#0d9488" : "#475569"}
                  strokeWidth={isTarget ? "1.8" : val % 10 === 0 ? "1.2" : "0.7"}
                  opacity={isTarget ? 1 : 0.8}
                />

                {/* Number labels */}
                {val % (syringeType === '100ui' ? 10 : 5) === 0 && (
                  <text
                    x={x}
                    y="55"
                    textAnchor="middle"
                    fill={isTarget ? "#0f766e" : "#334155"}
                    fontSize={isTarget ? "10" : "8.5"}
                    fontWeight={isTarget ? "800" : "600"}
                    fontFamily="system-ui, -apple-system, sans-serif"
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}

          {/* 11. Delicate Floating Indicator Chip */}
          <g transform={`translate(${liquidTargetX}, 0)`}>
            {/* Soft guide line */}
            <line x1="0" y1="23" x2="0" y2="30" stroke="#0d9488" strokeWidth="1.5" strokeDasharray="2 1.5" />
            <polygon points="0,29 -3.5,23 3.5,23" fill="#0d9488" />

            {/* Chip Badge */}
            <rect x="-30" y="4" width="60" height="18" rx="9" fill="#0d9488" />
            <text
              x="0"
              y="16.5"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="9"
              fontWeight="700"
              fontFamily="system-ui, -apple-system, sans-serif"
            >
              {units100Ui} UI
            </text>
          </g>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, padding: '0 4px', fontSize: '0.68rem', color: 'var(--muted)' }}>
          <span>Agulha U-100</span>
          <span style={{ color: 'var(--accent, #0d9488)', fontWeight: 600 }}>Alinhar na primeira borda do êmbolo ({units100Ui} UI)</span>
          <span>Apoio</span>
        </div>
      </div>

      {/* Overflow Warning if units exceed syringe */}
      {units100Ui > maxUi && (
        <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444', padding: '6px 10px', borderRadius: 8, marginBottom: 10, fontSize: '0.75rem', fontWeight: 600 }}>
          ⚠️ A dose ({units100Ui} UI) excede a capacidade desta seringa de {maxUi} UI. Selecione a de 100 UI.
        </div>
      )}

      {/* Gentle Guidance Footer */}
      <div
        style={{
          background: 'var(--soft, rgba(13, 148, 136, 0.04))',
          borderRadius: 8,
          padding: '8px 12px',
          border: '1px solid var(--line, #e2e8f0)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ color: 'var(--accent, #0d9488)', display: 'flex' }}>
          <Icon name="check" size={14} />
        </span>
        <span style={{ fontSize: '0.76rem', color: 'var(--text)', lineHeight: 1.4 }}>
          Puxe o êmbolo até a linha da borracha atingir o traço <strong>{units100Ui} UI</strong> ({volumeToInjectMl.toFixed(2)} mL).
        </span>
      </div>
    </section>
  );
}
