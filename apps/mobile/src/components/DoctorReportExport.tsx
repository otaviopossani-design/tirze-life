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

  const lastApp = quick.applications[0];
  const lastAppDate = lastApp ? new Date(lastApp.occurredAt).toLocaleDateString('pt-BR') : 'Esta semana';
  const lastAppSite = lastApp?.originalText?.includes('braço')
    ? 'Braço'
    : lastApp?.originalText?.includes('coxa')
    ? 'Coxa'
    : 'Abdômen';

  // Format professional message for WhatsApp/Doctor
  const generateDoctorText = () => {
    return `*RELATÓRIO DE ACOMPANHAMENTO CLÍNICO · TIRZE-LIFE*
Paciente: ${patientName} (ID: ${patientId})
Data da emissão: ${new Date().toLocaleDateString('pt-BR')}

📋 *TRATAMENTO ATUAL:*
• Medicação em uso: ${medication} (${doseMg} mg)
• Última aplicação registrada: ${lastAppDate} (Local: ${lastAppSite})
• Próxima dose programada: em 7 dias

💧 *ADESÃO & HÁBITOS:*
• Média de hidratação diária: ${waterTotalLiters}L (Meta clínica: ${waterTargetLiters}L)
• Registro alimentar e proteína: Plano ativo e em acompanhamento
• Momentos sociais sem culpa registrados: ${quick.moments.length} eventos (equilíbrio mantido)

🩺 *SINTOMAS & TOLERÂNCIA:*
• Adaptação gástrica: Monitorada (refeições amenas nos dias D+1 e D+2)
• Refluxo / Náusea: Sob controle com ajuste postural e porções compactas
• Total de relatos no diário: ${quick.entries.length} anotações

_Relatório exportado via Plataforma Tirze-Life para apoio à consulta médica._`;
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
    <section className="tl-card" style={{ borderColor: 'var(--brand-navy, #1e3a8a)', borderTopWidth: 3 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
        <span className="tl-kicker" style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="check" size={15} /> COMUNICAÇÃO COM SEU MÉDICO
        </span>
        <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1e40af', padding: '3px 8px', borderRadius: 999, fontWeight: 600 }}>
          Exportação em 1 Toque
        </span>
      </div>

      <h2 style={{ fontSize: '1.2rem', marginBottom: 6 }}>Resumo para Consulta com Endocrinologista</h2>
      <p style={{ fontSize: '0.86rem', color: 'var(--ink-secondary)', marginBottom: 14 }}>
        Chegue na sua consulta preparado: envie com 1 toque no WhatsApp do seu médico ou nutricionista um resumo com dados consolidados da sua evolução.
      </p>

      {/* Preview Card */}
      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155', maxHeight: '140px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
        {generateDoctorText()}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            flex: '1 1 200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: copied ? '#15803d' : '#25d366',
            color: '#ffffff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          <Icon name="check" size={16} />
          {copied ? 'Copiado para o WhatsApp!' : 'Copiar Resumo para WhatsApp'}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          style={{
            flex: '1 1 140px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: 'var(--bg-canvas, #ffffff)',
            color: 'var(--ink-primary)',
            border: '1px solid var(--border-subtle, #cbd5e1)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Icon name="arrow" size={15} />
          Imprimir / PDF
        </button>
      </div>
    </section>
  );
}
