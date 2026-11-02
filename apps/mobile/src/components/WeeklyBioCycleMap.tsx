import React, { useState } from 'react';
import { Icon } from './dashboard-ui';

interface CyclePhase {
  phaseNumber: number;
  days: string;
  name: string;
  badge: string;
  badgeColor: string;
  physiology: string;
  psychologyNoGuilt: string;
  nutritionTip: string;
}

const PHASES: CyclePhase[] = [
  {
    phaseNumber: 1,
    days: 'D+0 a D+2',
    name: 'Absorção e Pico Plasmático',
    badge: 'Pico Hormonal',
    badgeColor: '#f43f5e',
    physiology: 'Pico em 24h a 48h. Esvaziamento gástrico no ponto mais lento.',
    psychologyNoGuilt: 'Se sentir aversão a comidas pesadas ou cheiros, não force. É o pico de receptores.',
    nutritionTip: 'Comidas frias/amenas (iogurte grego, ovos mornos, shakes). Evite vapores quentes.',
  },
  {
    phaseNumber: 2,
    days: 'D+3 a D+4',
    name: 'Platô Terapêutico & Músculo',
    badge: 'Estabilidade',
    badgeColor: '#10b981',
    physiology: 'Concentração em equilíbrio ideal. Náuseas mínimas e mente tranquila.',
    psychologyNoGuilt: 'Aproveite a clareza mental e a ausência de "food noise". Você está no controle.',
    nutritionTip: 'Janela de Ouro do Músculo: bata 1,6g a 2,0g de proteína por kg e treine força.',
  },
  {
    phaseNumber: 3,
    days: 'D+5 a D+6',
    name: 'Decaimento & Retorno da Fome',
    badge: 'Anticulpa',
    badgeColor: '#f59e0b',
    physiology: 'Meia-vida de 120h: nível cai ~50%. Os sinais naturais de fome retornam.',
    psychologyNoGuilt: 'ZERO CULPA: O remédio não parou de funcionar. É pura farmacocinética natural.',
    nutritionTip: 'Aumente o volume com fibras solúveis (aveia, maçã, chia, folhas crocantes).',
  },
  {
    phaseNumber: 4,
    days: 'D+7',
    name: 'Renovação do Ciclo & Rotação',
    badge: 'Nova Aplicação',
    badgeColor: '#3b82f6',
    physiology: 'Ponto de reaplicação para manter a curva basal sem oscilação.',
    psychologyNoGuilt: 'Celebre cada pequena vitória da semana anterior.',
    nutritionTip: 'Refeição leve antes da injeção. Alterne o sítio (abdômen, coxa ou braço).',
  },
];

export default function WeeklyBioCycleMap() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const current = PHASES.find((p) => p.phaseNumber === selectedPhase) ?? PHASES[0]!;

  return (
    <section
      className="tl-card"
      style={{
        borderTop: '3px solid var(--accent, #0d9488)',
        borderRadius: '10px',
        padding: '12px 14px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--accent, #0d9488)', display: 'flex', alignItems: 'center' }}>
            <Icon name="activity" size={15} />
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--accent, #0d9488)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Mapa Semanal t½ 120h
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', background: 'var(--soft, #eef2e6)', color: 'var(--accent, #0d9488)', padding: '2px 8px', borderRadius: 999, fontWeight: 700 }}>
          7 Dias
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--muted, #7b887a)', margin: '0 0 12px 0', lineHeight: 1.4 }}>
        O comportamento fisiológico do seu corpo ao longo da semana:
      </p>

      {/* 4 Tabs - Compact */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
        {PHASES.map((p) => {
          const isSel = selectedPhase === p.phaseNumber;
          return (
            <button
              key={p.phaseNumber}
              type="button"
              onClick={() => setSelectedPhase(p.phaseNumber)}
              style={{
                padding: '6px 2px',
                borderRadius: 6,
                border: isSel ? `1.5px solid ${p.badgeColor}` : '1px solid var(--line, #e4e8dc)',
                background: isSel ? `${p.badgeColor}20` : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: isSel ? p.badgeColor : 'var(--text, #284c43)' }}>
                {p.days}
              </div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted, #7b887a)', marginTop: 1 }}>
                Fase {p.phaseNumber}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Phase Detail - Compact */}
      <div style={{ background: 'var(--card, #fffefa)', borderRadius: 8, padding: '12px 10px', border: '1px solid var(--line, #e4e8dc)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
          <strong style={{ fontSize: '0.9rem', color: 'var(--text, #284c43)', fontWeight: 700 }}>
            {current.name}
          </strong>
          <span style={{ fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: current.badgeColor, color: '#ffffff' }}>
            {current.badge}
          </span>
        </div>

        <p style={{ fontSize: '0.78rem', color: 'var(--text, #284c43)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          🧬 <strong>Fisiologia:</strong> {current.physiology}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          <div style={{ background: 'var(--soft, #eef2e6)', padding: '8px 10px', borderRadius: 6 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent, #0d9488)', fontWeight: 800, display: 'block', marginBottom: 2 }}>
              🥗 Nutrição Recomendada
            </span>
            <p style={{ fontSize: '0.74rem', color: 'var(--text, #284c43)', margin: 0, lineHeight: 1.35 }}>
              {current.nutritionTip}
            </p>
          </div>

          <div style={{ background: 'var(--life, #f4e8dd)', padding: '8px 10px', borderRadius: 6 }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--life-text, #825746)', fontWeight: 800, display: 'block', marginBottom: 2 }}>
              🌿 Psicologia Sem Culpa
            </span>
            <p style={{ fontSize: '0.74rem', color: 'var(--life-text, #825746)', margin: 0, lineHeight: 1.35 }}>
              {current.psychologyNoGuilt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
