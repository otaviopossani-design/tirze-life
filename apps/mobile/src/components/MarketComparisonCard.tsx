import React, { useState } from 'react';
import { Icon } from './dashboard-ui';

interface FeatureRow {
  feature: string;
  tirzelife: string;
  shotsy: string;
  noom: string;
  ro: string;
}

const COMPARISON_DATA: FeatureRow[] = [
  {
    feature: 'Curva Farmacocinética Real (t½ 120h)',
    tirzelife: 'Sim (4 Fases)',
    shotsy: 'Sim (Básico)',
    noom: 'Não',
    ro: 'Não',
  },
  {
    feature: 'Nutrição Reativa Dinâmica (Adapta a Enjoo/Refluxo)',
    tirzelife: 'Sim (Exclusivo)',
    shotsy: 'Não',
    noom: 'Não (Fixo)',
    ro: 'Não',
  },
  {
    feature: 'Calculadora Visual de Seringa & Frascos Manipulados',
    tirzelife: 'Sim (100, 50, 30 UI)',
    shotsy: 'Não (Só canetas)',
    noom: 'Não',
    ro: 'Não',
  },
  {
    feature: 'Modo Vida Real Zero Culpa (Álcool, Gás e Eventos)',
    tirzelife: 'Sim (Exclusivo)',
    shotsy: 'Não',
    noom: 'Não (Punitivo)',
    ro: 'Não',
  },
  {
    feature: 'Painel da Clínica & Nutricionista Conectado (B2B2C)',
    tirzelife: 'Sim (/clinica)',
    shotsy: 'Não (Isolado)',
    noom: 'Não',
    ro: 'Sim (Fechado)',
  },
  {
    feature: 'Multi-Medicações de Fronteira (Retatrutida / Cagri / Glow)',
    tirzelife: 'Sim (Protocolos)',
    shotsy: 'Não',
    noom: 'Não',
    ro: 'Não',
  },
  {
    feature: 'Resumo para Consulta Médica em 1 Toque (WhatsApp / PDF)',
    tirzelife: 'Sim',
    shotsy: 'Não',
    noom: 'Não',
    ro: 'Não',
  },
];

export default function MarketComparisonCard() {
  const [open, setOpen] = useState(false);

  return (
    <section className="tl-card" style={{ borderColor: '#6366f1', borderTopWidth: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
        <span className="tl-kicker" style={{ color: '#4f46e5', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="chart" size={15} /> BENCHMARK DE MERCADO
        </span>
        <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4338ca', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>
          Padrão Ouro GLP-1
        </span>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: 4 }}>O Que o Tirze-Life Tem Que os Outros Não Têm?</h2>
      <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', marginBottom: 12 }}>
        Pesquisamos as maiores soluções globais (Shotsy, Noom Med, Ro Body). Veja o comparativo de engenharia de produto:
      </p>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-subtle, #f8fafc)',
          border: '1px solid #cbd5e1',
          padding: '10px 14px',
          borderRadius: 8,
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.86rem',
          color: '#1e293b',
          marginBottom: open ? 12 : 0,
        }}
      >
        <span>{open ? 'Ocultar tabela comparativa completa' : 'Ver tabela comparativa (Tirze-Life vs Concorrentes)'}</span>
        <Icon name={open ? 'close' : 'arrow'} size={15} />
      </button>

      {open && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #cbd5e1', background: '#f1f5f9' }}>
                <th style={{ padding: '8px 10px', color: '#334155', fontWeight: 700 }}>Diferencial</th>
                <th style={{ padding: '8px 10px', color: '#0f766e', fontWeight: 800, background: '#ccfbf1' }}>Tirze-Life 🌟</th>
                <th style={{ padding: '8px 10px', color: '#64748b' }}>Shotsy</th>
                <th style={{ padding: '8px 10px', color: '#64748b' }}>Noom GLP-1</th>
                <th style={{ padding: '8px 10px', color: '#64748b' }}>Ro Body</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600, color: '#1e293b' }}>{row.feature}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0d9488', background: 'rgba(204, 251, 241, 0.4)' }}>
                    {row.tirzelife}
                  </td>
                  <td style={{ padding: '8px 10px', color: row.shotsy === 'Não' ? '#ef4444' : '#334155' }}>{row.shotsy}</td>
                  <td style={{ padding: '8px 10px', color: row.noom.startsWith('Não') ? '#ef4444' : '#334155' }}>{row.noom}</td>
                  <td style={{ padding: '8px 10px', color: row.ro === 'Não' ? '#ef4444' : '#334155' }}>{row.ro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
