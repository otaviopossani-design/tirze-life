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
    feature: 'Curva Farmacocinética t½ 120h',
    tirzelife: 'Sim (4 Fases Biológicas)',
    shotsy: 'Parcial (Apenas gráfico estático)',
    noom: 'Não (Apenas hábitos)',
    ro: 'Não',
  },
  {
    feature: 'Nutrição Reativa Dinâmica por Sintomas',
    tirzelife: 'Sim (Exclusivo)',
    shotsy: 'Não (Apenas tags de texto)',
    noom: 'Não (Cardápio fixo)',
    ro: 'Não',
  },
  {
    feature: 'Calculadora de Seringa & Manipulados',
    tirzelife: 'Sim (100, 50 e 30 UI com réplica visual)',
    shotsy: 'Não (Apenas canetas comerciais)',
    noom: 'Não',
    ro: 'Não',
  },
  {
    feature: 'Portal B2B2C para Clínicas & Nutricionistas',
    tirzelife: 'Sim (Acesso equipe /clinica)',
    shotsy: 'Não (App B2C isolado no iCloud)',
    noom: 'Não (Plataforma fechada)',
    ro: 'Fechado (Apenas telemedicina interna)',
  },
  {
    feature: 'Modo Vida Real Zero Culpa (Social, Álcool, Gás)',
    tirzelife: 'Sim (Compensação hídrica sem punição)',
    shotsy: 'Não',
    noom: 'Não (Semáforo calórico punitivo)',
    ro: 'Não',
  },
  {
    feature: 'Multi-Moléculas (Retatrutida, CagriSema, Glow)',
    tirzelife: 'Sim (Protocolos científicos integrados)',
    shotsy: 'Não (Apenas Tirzepatida/Semaglutida)',
    noom: 'Não',
    ro: 'Não',
  },
  {
    feature: 'Resumo Formatado para Consulta (WhatsApp / PDF)',
    tirzelife: 'Sim (1 Toque)',
    shotsy: 'Parcial (Apenas PDF básico)',
    noom: 'Não',
    ro: 'Não',
  },
];

export default function MarketComparisonCard() {
  const [open, setOpen] = useState(false);

  return (
    <section
      className="tl-card"
      style={{
        borderTop: '3px solid #6366f1',
        borderRadius: '12px',
        padding: '16px 14px',
        marginTop: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#4f46e5', display: 'flex', alignItems: 'center' }}>
            <Icon name="chart" size={15} />
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#4f46e5', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Auditoria Técnica &amp; Benchmark Global
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', background: 'rgba(99, 102, 241, 0.1)', color: '#4338ca', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
          Padrão Clínico
        </span>
      </div>

      <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text, #1e293b)' }}>
        O Que o Tirze-Life Oferece à Sua Clínica?
      </h2>
      <p style={{ fontSize: '0.82rem', color: 'var(--muted, #7b887a)', margin: '0 0 10px 0', lineHeight: 1.4 }}>
        Varredura de engenharia de produto comparando o ecossistema Tirze-Life com as principais soluções globais (Shotsy, Noom Med, Ro Body):
      </p>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--card, #ffffff)',
          border: '1px solid var(--line, #cbd5e1)',
          padding: '8px 12px',
          borderRadius: 6,
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.78rem',
          color: 'var(--text, #1e293b)',
        }}
      >
        <span>{open ? 'Ocultar matriz de auditoria' : 'Ver comparativo de engenharia completo (Auditado)'}</span>
        <Icon name={open ? 'close' : 'arrow'} size={14} />
      </button>

      {open && (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginTop: 10 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--line, #cbd5e1)', background: 'var(--soft, #f1f5f9)' }}>
                <th style={{ padding: '6px 8px', color: 'var(--text, #334155)', fontWeight: 700 }}>Recurso / Diferencial</th>
                <th style={{ padding: '6px 8px', color: '#0d9488', fontWeight: 800 }}>Tirze-Life 🌟</th>
                <th style={{ padding: '6px 8px', color: 'var(--muted, #64748b)' }}>Shotsy</th>
                <th style={{ padding: '6px 8px', color: 'var(--muted, #64748b)' }}>Noom GLP-1</th>
                <th style={{ padding: '6px 8px', color: 'var(--muted, #64748b)' }}>Ro Body</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--line, #e2e8f0)' }}>
                  <td style={{ padding: '6px 8px', fontWeight: 600, color: 'var(--text, #1e293b)' }}>{row.feature}</td>
                  <td style={{ padding: '6px 8px', fontWeight: 800, color: '#0d9488', background: 'rgba(204, 251, 241, 0.25)' }}>
                    {row.tirzelife}
                  </td>
                  <td style={{ padding: '6px 8px', color: row.shotsy.startsWith('Não') ? '#ef4444' : 'var(--text, #334155)' }}>{row.shotsy}</td>
                  <td style={{ padding: '6px 8px', color: row.noom.startsWith('Não') ? '#ef4444' : 'var(--text, #334155)' }}>{row.noom}</td>
                  <td style={{ padding: '6px 8px', color: row.ro.startsWith('Não') || row.ro.startsWith('Fechado') ? '#ef4444' : 'var(--text, #334155)' }}>{row.ro}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.66rem', color: 'var(--muted, #94a3b8)', marginTop: 8, marginBottom: 0, lineHeight: 1.35 }}>
            * Auditoria técnica realizada com base nas especificações públicas das plataformas em 2026. Shotsy é marca registrada de Shotsy App; Noom de Noom Inc.; Ro de Ro Inc. O Tirze-Life é a única plataforma que une o suporte ao paciente e o painel de retaguarda para clínicas de endocrinologia e nutrição.
          </p>
        </div>
      )}
    </section>
  );
}
