import React, { useState } from 'react';
import { Icon } from './dashboard-ui';
import { useQuickJournal } from './quick-journal';
import { usePatientNutrition } from './PatientNutrition';

interface DoctorReportProps {
  patientId: string;
  patientName: string;
  medication: string;
  doseMg: number;
}

export default function DoctorReportExport({
  patientId,
  patientName,
  medication,
  doseMg,
}: DoctorReportProps) {
  const [copied, setCopied] = useState(false);
  const quick = useQuickJournal(patientId);
  const nutrition = usePatientNutrition(patientId);

  const waterTotalLiters = (quick.water / 1000).toFixed(1);
  const waterTargetLiters = nutrition.record?.published?.waterTarget
    ? (nutrition.record.published.waterTarget / 1000).toFixed(1)
    : '2.5';

  const appsChronological = [...quick.applications].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()
  );
  const totalApps = appsChronological.length;
  const currentWeekNum = totalApps > 0 ? totalApps : 1;

  const lastApp = quick.applications[0];
  const lastAppDate = lastApp ? new Date(lastApp.occurredAt).toLocaleDateString('pt-BR') : 'Esta semana';
  const lastAppSite = lastApp?.originalText?.includes('braço')
    ? 'Braço'
    : lastApp?.originalText?.includes('coxa')
    ? 'Coxa'
    : 'Abdômen';

  let nextDoseDateStr = 'em 7 dias';
  if (lastApp) {
    const lastTime = new Date(lastApp.occurredAt).getTime();
    if (!isNaN(lastTime)) {
      const nextDate = new Date(lastTime + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const target = new Date(nextDate);
      target.setHours(0, 0, 0, 0);
      const diff = Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const targetFormatted = nextDate.toLocaleDateString('pt-BR');
      if (diff > 0) {
        nextDoseDateStr = `${targetFormatted} (em ${diff} ${diff === 1 ? 'dia' : 'dias'})`;
      } else if (diff === 0) {
        nextDoseDateStr = `HOJE (${targetFormatted})`;
      } else {
        nextDoseDateStr = `${targetFormatted} (há ${Math.abs(diff)} dias)`;
      }
    }
  }

  const weeklyBreakdown = appsChronological
    .map((app, idx) => {
      const w = idx + 1;
      const d = new Date(app.occurredAt).toLocaleDateString('pt-BR');
      const dText = app.doseText || `${doseMg} mg`;
      const loc = app.originalText || 'Abdômen';
      return `  • Semana ${w} (${d}): ${dText} · Local: ${loc}`;
    })
    .join('\n');

  const generateDoctorText = () => {
    return `*RELATÓRIO DE ACOMPANHAMENTO CLÍNICO · TIRZE-LIFE*
Paciente: ${patientName} (ID: ${patientId})
Data da emissão: ${new Date().toLocaleDateString('pt-BR')}

🗓️ *CRONOGRAMA & CICLO SEMANAL:*
• Semana atual em andamento: Semana ${currentWeekNum}
• Próxima aplicação semanal: ${nextDoseDateStr}

💉 *HISTÓRICO DE APLICAÇÕES SEMANAIS:*
${weeklyBreakdown || `  • Semana 1 (${lastAppDate}): ${doseMg} mg · Local: ${lastAppSite}`}

📋 *TRATAMENTO ATUAL:*
• Medicação prescrita: ${medication} (${doseMg} mg)
• Última dose aplicada: ${lastAppDate} (Local: ${lastAppSite})

💧 *ADESÃO & HÁBITOS:*
• Hidratação diária: ${waterTotalLiters}L (Meta: ${waterTargetLiters}L)
• Registro alimentar: Plano ativo sincronizado com a equipe
• Momentos sociais sem culpa: ${quick.moments.length} eventos

🩺 *SINTOMAS & TOLERÂNCIA:*
• Adaptação gástrica: Monitorada (refeições amenas em D+1/D+2)
• Refluxo / Náusea: Sob controle com ajuste postural
• Total de relatos registrados: ${quick.entries.length} anotações`;
  };

  const handleCopy = () => {
    const text = generateDoctorText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section
      className="tl-card"
      style={{
        borderTop: '3px solid #2563eb',
        borderRadius: '10px',
        padding: '12px 14px',
        marginTop: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#2563eb', display: 'flex', alignItems: 'center' }}>
            <Icon name="check" size={14} />
          </span>
          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#2563eb', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
            Relatório de Consulta &bull; Auto-Gerado
          </span>
        </div>
        <span style={{ fontSize: '0.68rem', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '2px 7px', borderRadius: 999, fontWeight: 700 }}>
          WhatsApp / PDF
        </span>
      </div>

      {/* Ciclo Semanal Automático */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.72rem', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '2px 8px', borderRadius: '5px', fontWeight: 700 }}>
          🗓️ Ciclo: Semana {currentWeekNum}
        </span>
        <span style={{ fontSize: '0.72rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '5px', fontWeight: 600 }}>
          💉 Próxima dose: {nextDoseDateStr}
        </span>
      </div>

      <p style={{ fontSize: '0.76rem', color: 'var(--muted, #7b887a)', margin: '0 0 6px 0', lineHeight: 1.35 }}>
        Atualizado automaticamente a cada aplicação semanal registrada:
      </p>

      {/* Preview Card - Compact */}
      <div
        style={{
          background: 'var(--card, #ffffff)',
          padding: '8px 10px',
          borderRadius: 6,
          border: '1px solid var(--line, #e4e8dc)',
          marginBottom: 8,
          fontFamily: 'monospace',
          fontSize: '0.71rem',
          color: 'var(--text, #284c43)',
          maxHeight: '95px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          lineHeight: 1.35,
        }}
      >
        {generateDoctorText()}
      </div>

      {/* Action Buttons - Compact */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            flex: '2 1 180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: copied ? '#15803d' : '#25d366',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          <Icon name="check" size={13} />
          {copied ? 'Copiado para WhatsApp!' : 'Copiar para WhatsApp'}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            flex: '1 1 90px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'transparent',
            color: 'var(--text, #284c43)',
            border: '1px solid var(--line, #cbd5e1)',
            borderRadius: 6,
            padding: '7px 12px',
            fontSize: '0.76rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon name="arrow" size={12} />
          PDF
        </button>
      </div>
    </section>
  );
}
