import React, { useState } from 'react';
import { Icon } from './dashboard-ui';

interface CyclePhase {
  phaseNumber: number;
  days: string;
  name: string;
  badge: string;
  badgeColor: string;
  physiology: string;
  actionGuidance: string;
  psychologyNoGuilt: string;
  nutritionTip: string;
}

const PHASES: CyclePhase[] = [
  {
    phaseNumber: 1,
    days: 'D+0 a D+2',
    name: 'Absorção e Pico Plasmático',
    badge: 'Pico Hormonal',
    badgeColor: '#e11d48',
    physiology: 'A concentração plasmática atinge o pico entre 24h e 48h. O esvaziamento gástrico fica no ponto mais lento da semana.',
    actionGuidance: 'Beba 2,5L a 3,0L de água em pequenos goles com eletrólitos. Mantenha postura ereta por 2h após comer.',
    psychologyNoGuilt: 'Se sentir aversão a comidas pesadas ou cheiro de refogado, não force. Seu corpo está calibrando os receptores.',
    nutritionTip: 'Comidas frias ou amenas (iogurte grego, ovos mexidos mornos, shake proteico). Evite vapores quentes e gordura.',
  },
  {
    phaseNumber: 2,
    days: 'D+3 a D+4',
    name: 'Platô Terapêutico & Janela Muscular',
    badge: 'Estabilidade',
    badgeColor: '#059669',
    physiology: 'Concentração em equilíbrio ideal. Náuseas zeradas ou mínimas com saciedade controlada e mente tranquila.',
    actionGuidance: 'Esta é a sua Janela de Ouro do Músculo (Muscle Defense). Priorize treinos de força para proteger a taxa metabólica basal.',
    psychologyNoGuilt: 'Você está no comando. Aproveite a clareza mental e a ausência do ruído de comida ("food noise").',
    nutritionTip: 'Bata 1,6g a 2,0g de proteína por kg de peso corporal (peixes, frango, whey, queijo cottage).',
  },
  {
    phaseNumber: 3,
    days: 'D+5 a D+6',
    name: 'Decaimento Biológico e Retorno da Fome',
    badge: 'Atenção Anticulpa',
    badgeColor: '#d97706',
    physiology: 'A meia-vida de 120h faz o nível do medicamento cair cerca de 50%. Os hormônios da fome (grelina) voltam a emitir sinais.',
    actionGuidance: 'Aumente o volume das refeições com alimentos de baixa densidade calórica e muitas fibras solúveis.',
    psychologyNoGuilt: 'ZERO CULPA: O remédio não "parou de funcionar" e você não "perdeu o foco". É pura farmacocinética natural.',
    nutritionTip: 'Saladas crocantes, vegetais cozidos no vapor, aveia, semente de chia e frutas com casca.',
  },
  {
    phaseNumber: 4,
    days: 'D+7',
    name: 'Renovação do Ciclo & Rotação',
    badge: 'Nova Aplicação',
    badgeColor: '#2563eb',
    physiology: 'Momento de reaplicação para reiniciar o ciclo de 120h sem deixar a curva basal cair a zero.',
    actionGuidance: 'Alterne o local de aplicação: se na semana passada foi no abdômen esquerdo, hoje use o abdômen direito ou a coxa.',
    psychologyNoGuilt: 'Celebre cada pequena vitória da semana anterior: roupas mais confortáveis, mais disposição e controle.',
    nutritionTip: 'Refeição leve antes da aplicação. Tenha água fresca por perto.',
  },
];

export default function WeeklyBioCycleMap() {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const current = PHASES.find((p) => p.phaseNumber === selectedPhase) ?? PHASES[0]!;

  return (
    <section className="tl-card" style={{ borderColor: 'var(--brand-teal, #0d9488)', borderTopWidth: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <span className="tl-kicker" style={{ color: '#0d9488', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="activity" size={15} /> MAPA FARMACOCINÉTICO DE 7 DIAS
        </span>
        <span style={{ fontSize: '0.72rem', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
          Ciclo Biológico t½ 120h
        </span>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: 6 }}>O Que Acontece no Seu Corpo Dia a Dia</h2>
      <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', marginBottom: 14 }}>
        A tirzepatida e os agonistas GLP-1/GIP têm comportamento semanal previsível. Entenda a biologia e viva sem culpa:
      </p>

      {/* Phase Selector Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
        {PHASES.map((p) => (
          <button
            key={p.phaseNumber}
            type="button"
            onClick={() => setSelectedPhase(p.phaseNumber)}
            style={{
              padding: '8px 4px',
              borderRadius: 8,
              border: selectedPhase === p.phaseNumber ? `2px solid ${p.badgeColor}` : '1px solid #cbd5e1',
              background: selectedPhase === p.phaseNumber ? `${p.badgeColor}15` : 'transparent',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: selectedPhase === p.phaseNumber ? p.badgeColor : '#64748b' }}>
              {p.days}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#475569', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Fase {p.phaseNumber}
            </div>
          </button>
        ))}
      </div>

      {/* Selected Phase Detail Card */}
      <div style={{ background: '#f8fafc', borderRadius: 10, padding: 14, border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ fontSize: '1.05rem', margin: 0, color: '#1e293b' }}>
            {current.name}
          </h3>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: current.badgeColor, color: '#ffffff' }}>
            {current.badge}
          </span>
        </div>

        <p style={{ fontSize: '0.84rem', color: '#334155', marginBottom: 12, lineHeight: 1.45 }}>
          🧬 <strong>Fisiologia do momento:</strong> {current.physiology}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <strong style={{ fontSize: '0.78rem', color: '#0d9488', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Icon name="heart" size={14} /> Recomendação de Nutrição:
            </strong>
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.4 }}>
              {current.nutritionTip}
            </p>
          </div>

          <div style={{ background: '#fffbeb', padding: 10, borderRadius: 8, border: '1px solid #fef3c7' }}>
            <strong style={{ fontSize: '0.78rem', color: '#b45309', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Icon name="leaf" size={14} /> Psicologia Anticulpa:
            </strong>
            <p style={{ fontSize: '0.8rem', color: '#78350f', margin: 0, lineHeight: 1.4 }}>
              {current.psychologyNoGuilt}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
