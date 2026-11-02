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
  // Percentage of syringe filled
  const fillPercent = Math.min(100, Math.max(0, (units100Ui / maxUi) * 100));

  return (
    <section className="tl-card" style={{ borderColor: 'var(--brand-teal, #0d9488)', borderTopWidth: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <span className="tl-kicker" style={{ color: '#0d9488', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="activity" size={15} /> EXCLUSIVIDADE TIRZE-LIFE · SEGURANÇA MÁXIMA
        </span>
        <span style={{ fontSize: '0.75rem', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
          Diluição &amp; Seringas
        </span>
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: 6 }}>Calculadora Visual de Seringa &amp; Manipulados</h2>
      <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginBottom: 16 }}>
        Evite o erro nº 1 de quem usa frasco-ampola ou manipulado: saiba exatamente até qual traço puxar o êmbolo.
      </p>

      {/* Preset selector buttons */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--ink-tertiary)', display: 'block', marginBottom: 6 }}>
          Frascos Mais Comuns no Brasil
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {COMMON_PRESETS.map((p, idx) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handlePresetSelect(idx)}
              style={{
                fontSize: '0.78rem',
                padding: '6px 10px',
                borderRadius: 8,
                border: selectedPresetIndex === idx ? '1.5px solid #0d9488' : '1px solid var(--border-subtle)',
                background: selectedPresetIndex === idx ? 'rgba(13, 148, 136, 0.12)' : 'var(--bg-canvas)',
                color: selectedPresetIndex === idx ? '#0d9488' : 'var(--ink-primary)',
                fontWeight: selectedPresetIndex === idx ? 700 : 500,
                cursor: 'pointer',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Numerical inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 18 }}>
        <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: 10, borderRadius: 10 }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--ink-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
            Total no Frasco
          </label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <input
              type="number"
              step="1"
              value={totalMg}
              onChange={(e) => setTotalMg(parseFloat(e.target.value) || 0)}
              style={{ width: '65px', fontSize: '1.1rem', fontWeight: 700, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>mg</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: 10, borderRadius: 10 }}>
          <label style={{ fontSize: '0.72rem', color: 'var(--ink-tertiary)', textTransform: 'uppercase', display: 'block', fontWeight: 600 }}>
            Volume do Frasco
          </label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <input
              type="number"
              step="0.5"
              value={totalMl}
              onChange={(e) => setTotalMl(parseFloat(e.target.value) || 0)}
              style={{ width: '65px', fontSize: '1.1rem', fontWeight: 700, padding: '2px 4px', borderRadius: 4, border: '1px solid #cbd5e1' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--ink-secondary)' }}>mL</span>
          </div>
        </div>

        <div style={{ background: 'var(--bg-subtle, #f8fafc)', padding: 10, borderRadius: 10, border: '1.5px solid #0d9488' }}>
          <label style={{ fontSize: '0.72rem', color: '#0d9488', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>
            Dose Prescrita
          </label>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
            <input
              type="number"
              step="0.25"
              value={targetDoseMg}
              onChange={(e) => setTargetDoseMg(parseFloat(e.target.value) || 0)}
              style={{ width: '65px', fontSize: '1.1rem', fontWeight: 800, color: '#0d9488', padding: '2px 4px', borderRadius: 4, border: '1px solid #0d9488' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#0d9488', fontWeight: 700 }}>mg</span>
          </div>
        </div>
      </div>

      {/* Syringe Type Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--ink-secondary)', fontWeight: 600 }}>Tipo de Seringa de Insulina:</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['100ui', '50ui', '30ui'] as SyringeType[]).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSyringeType(st)}
              style={{
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: 6,
                border: syringeType === st ? '1px solid #0d9488' : '1px solid #cbd5e1',
                background: syringeType === st ? '#0d9488' : 'transparent',
                color: syringeType === st ? '#fff' : 'var(--ink-secondary)',
                cursor: 'pointer',
                fontWeight: syringeType === st ? 700 : 500,
              }}
            >
              {st === '100ui' ? '100 UI (1,0 mL)' : st === '50ui' ? '50 UI (0,5 mL)' : '30 UI (0,3 mL)'}
            </button>
          ))}
        </div>
      </div>

      {/* VISUAL SYRINGE RENDERER */}
      <div style={{ background: '#f8fafc', padding: '16px 12px', borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e293b' }}>
            Alvo na Seringa de {maxUi} UI:
          </span>
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0d9488' }}>
            {units100Ui} UI <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>({volumeToInjectMl.toFixed(2)} mL)</span>
          </span>
        </div>

        {/* Syringe Barrel Graphic */}
        <div style={{ position: 'relative', width: '100%', height: '42px', background: '#ffffff', borderRadius: 6, border: '2px solid #94a3b8', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
          {/* Fluid Fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${fillPercent}%`,
              background: 'linear-gradient(90deg, rgba(13, 148, 136, 0.45) 0%, rgba(13, 148, 136, 0.75) 100%)',
              borderRight: '3px solid #0f766e',
              transition: 'width 0.3s ease',
            }}
          />

          {/* Tick marks */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'space-between', padding: '0 4px', pointerEvents: 'none' }}>
            {Array.from({ length: 11 }).map((_, i) => {
              const val = Math.round((maxUi / 10) * i);
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'space-between', padding: '2px 0' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#475569', zIndex: 2 }}>{val}</span>
                  <div style={{ width: '1px', height: i % 2 === 0 ? '12px' : '6px', background: '#64748b' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Plunger Warning if overflows */}
        {units100Ui > maxUi && (
          <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginTop: 8, fontWeight: 600 }}>
            ⚠️ A dose calculada ({units100Ui} UI) ultrapassa a capacidade desta seringa de {maxUi} UI. Escolha uma seringa maior.
          </p>
        )}
      </div>

      {/* Result Explanatory Box */}
      <div style={{ background: 'rgba(13, 148, 136, 0.08)', borderRadius: 10, padding: '12px 14px', borderLeft: '4px solid #0d9488' }}>
        <strong style={{ fontSize: '0.88rem', color: '#0f766e', display: 'block', marginBottom: 4 }}>
          Orientação Prática para sua Aplicação:
        </strong>
        <p style={{ fontSize: '0.84rem', color: 'var(--ink-secondary)', margin: 0, lineHeight: 1.45 }}>
          Com a concentração de <strong>{concentrationMgPerMl.toFixed(1)} mg/mL</strong>, para administrar a dose de <strong>{targetDoseMg} mg</strong>, puxe exatamente <strong>{units100Ui} unidades (UI)</strong> ou <strong>{volumeToInjectMl.toFixed(2)} mL</strong>.
        </p>
      </div>

      {/* Safety Medical Disclaimer */}
      <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 12, marginBottom: 0, lineHeight: 1.35 }}>
        * Ferramenta de apoio matemático para conferência. Nunca altere a dosagem prescrita pelo seu médico. Verifique sempre os dados do rótulo da farmácia de manipulação credenciada antes da aplicação.
      </p>
    </section>
  );
}
