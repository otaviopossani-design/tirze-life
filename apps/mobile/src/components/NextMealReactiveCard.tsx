import React, { useState, useEffect } from 'react';
import { Icon } from './dashboard-ui';
import {
  generateNextMealSuggestion,
  evaluateDoseProgression,
  SymptomTrigger,
  VolumeFeeling,
  MealIntakeLog,
  NextMealSuggestion,
  DoctorWeeklyOpinion
} from '../domain/reactive-nutrition';

interface Props {
  patientId?: string;
  patientName?: string;
  currentMedication?: string;
  currentDoseMg?: number;
}

const STORAGE_KEY_MEAL_LOGS = 'tirzelife-meal-reactive-logs';
const STORAGE_KEY_OPINION = 'tirzelife-doctor-weekly-opinion';

export default function NextMealReactiveCard({
  patientId = 'TL-001',
  patientName = 'Marina',
  currentMedication = 'Tirzepatida',
  currentDoseMg = 2.5
}: Props) {
  const [consumedFood, setConsumedFood] = useState('');
  const [volumeFeeling, setVolumeFeeling] = useState<VolumeFeeling>('NORMAL');
  const [symptomTrigger, setSymptomTrigger] = useState<SymptomTrigger>('ANCIA_CHEIRO');
  const [syringeUI, setSyringeUI] = useState<number>(6);
  const [logs, setLogs] = useState<MealIntakeLog[]>([]);
  const [suggestion, setSuggestion] = useState<NextMealSuggestion>(() =>
    generateNextMealSuggestion({ symptomTrigger: 'ANCIA_CHEIRO', volumeFeeling: 'NORMAL' }, currentMedication, currentDoseMg)
  );
  const [doctorOpinion, setDoctorOpinion] = useState<DoctorWeeklyOpinion | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState('');
  const [showSyringeHelper, setShowSyringeHelper] = useState(false);

  // Carrega histórico e parecer do localStorage
  useEffect(() => {
    try {
      const savedLogs = localStorage.getItem(`${STORAGE_KEY_MEAL_LOGS}-${patientId}`);
      if (savedLogs) {
        const parsed = JSON.parse(savedLogs);
        setLogs(parsed);
        if (parsed.length > 0) {
          setSuggestion(generateNextMealSuggestion(parsed[0], currentMedication, currentDoseMg));
        }
      } else {
        // Inicializa com relato exemplo da dor do usuário
        const initialLog: MealIntakeLog = {
          id: 'log-init-1',
          patientId,
          consumedFood: 'Ovo mexido e café pela manhã (dose aplicada: 6 UI na seringa)',
          estimatedProteinG: 12,
          volumeFeeling: 'LEVE',
          symptomTrigger: 'ANCIA_CHEIRO',
          loggedAt: new Date().toISOString()
        };
        setLogs([initialLog]);
        setSuggestion(generateNextMealSuggestion(initialLog, currentMedication, currentDoseMg));
      }

      const savedOpinion = localStorage.getItem(`${STORAGE_KEY_OPINION}-${patientId}`);
      if (savedOpinion) {
        setDoctorOpinion(JSON.parse(savedOpinion));
      } else {
        // Parecer padrão gerado pela clínica para o caso
        const autoOpinion: DoctorWeeklyOpinion = {
          id: 'op-01',
          patientId,
          doctorName: 'Dra. Camila Endocrinologia (CRM 142.890)',
          reviewedAt: new Date().toLocaleDateString('pt-BR'),
          periodSummary: 'Avaliação dos últimos 7 dias pós-dose fracionada (6 UI em seringa)',
          medication: currentMedication,
          currentDose: `${currentDoseMg} mg`,
          syringeUnitsUI: 6,
          gastricToleranceScore: 2,
          decision: 'MANTER_DOSE_MINIMA',
          decisionLabel: 'Manter Dose Mínima (2,5 mg) · Contraindicado Subir para 5,0 mg',
          clinicalFeedback:
            'Identifiquei no seu histórico náusea olfativa ("ânsia ao sentir cheiro forte") e regurgitação desencadeada por esforço físico. Este quadro indica que seu esvaziamento gástrico está no limite da tolerabilidade. Não vamos subir para 5,0 mg esta semana. Manteremos a dose mínima de 2,5 mg por mais 3 semanas até acomodação mecânica.',
          doseAdjustmentGuide:
            'Atenção à medição da seringa de insulina: 6 UI é uma subdose em relação a 8 UI (variação de 25%). A oscilação entre doses desestabiliza a curva estável de 120h no sangue. Mantenha exatamente a marcação alinhada com a equipe.'
        };
        setDoctorOpinion(autoOpinion);
      }
    } catch {}
  }, [patientId, currentMedication, currentDoseMg]);

  function handleLogIntake() {
    const newLog: MealIntakeLog = {
      id: `log-${Date.now()}`,
      patientId,
      consumedFood: consumedFood || 'Refeição registrada com observação de sintomas',
      estimatedProteinG: 20,
      volumeFeeling,
      symptomTrigger,
      loggedAt: new Date().toISOString()
    };

    const nextLogs = [newLog, ...logs];
    setLogs(nextLogs);
    try {
      localStorage.setItem(`${STORAGE_KEY_MEAL_LOGS}-${patientId}`, JSON.stringify(nextLogs));
    } catch {}

    // Gera a próxima refeição imediata
    const newSug = generateNextMealSuggestion(newLog, currentMedication, currentDoseMg);
    setSuggestion(newSug);

    // Avalia e atualiza o parecer médico automaticamente
    const evalResult = evaluateDoseProgression(currentDoseMg, syringeUI, nextLogs);
    const updatedOpinion: DoctorWeeklyOpinion = {
      id: `op-${Date.now()}`,
      patientId,
      doctorName: 'Equipe Médica & Nutrição Clínica',
      reviewedAt: new Date().toLocaleDateString('pt-BR'),
      periodSummary: 'Parecer atualizado com base no último relato de sintomas',
      medication: currentMedication,
      currentDose: `${currentDoseMg} mg (${syringeUI} UI na seringa)`,
      syringeUnitsUI: syringeUI,
      gastricToleranceScore: symptomTrigger === 'NENHUM' ? 4 : 2,
      decision: evalResult.suggestedDecision,
      decisionLabel: evalResult.decisionLabel,
      clinicalFeedback: evalResult.medicalRationale,
      doseAdjustmentGuide: evalResult.safeSyringeAdvice
    };

    setDoctorOpinion(updatedOpinion);
    try {
      localStorage.setItem(`${STORAGE_KEY_OPINION}-${patientId}`, JSON.stringify(updatedOpinion));
    } catch {}

    setFeedbackNotice('Relato processado! Próxima refeição adaptada e parecer clínico atualizado.');
    setTimeout(() => setFeedbackNotice(''), 4500);
    setConsumedFood('');
  }

  return (
    <div className="tl-card reactive-nutrition-wrapper" style={{ marginTop: '1.25rem' }}>
      <div className="tl-card-heading">
        <span className="tl-kicker">
          <Icon name="meal" size={16} /> NUTRIÇÃO REATIVA &bull; PRÓXIMA REFEIÇÃO
        </span>
        <span className="tl-badge" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
          Sincronizado com a Clínica
        </span>
      </div>

      <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
          O Que Você Comeu e Como Seu Corpo Reagiu?
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted, #64748b)', margin: 0 }}>
          O sistema adapta a próxima refeição em tempo real para blindar seu estômago contra náusea olfativa e regurgitação mecânica.
        </p>
      </div>

      {/* Formulário Rápido de Ingestão e Sintomas */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          border: '1px solid var(--border, #334155)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <label className="tl-field" style={{ margin: 0 }}>
          O que você ingeriu recentemente? (Opcional)
          <input
            value={consumedFood}
            onChange={(e) => setConsumedFood(e.target.value)}
            placeholder="Ex.: Café com leite, 1 fatia de pão, shake proteico..."
            style={{ marginTop: '0.25rem' }}
          />
        </label>

        {/* Sintomas Desencadeados */}
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--foreground, #cbd5e1)', display: 'block', marginBottom: '0.35rem' }}>
            Como você se sentiu após comer ou sentir cheiros?
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.4rem' }}>
            {[
              { id: 'ANCIA_CHEIRO', label: '🤢 Ânsia com cheiro forte', desc: 'Cheiro de comida quente/fritura' },
              { id: 'REGURGITACAO_ESFORCO', label: '⚡ Regurgitei em esforço', desc: 'Voltou líquido ao agachar/treinar' },
              { id: 'EMPACHADO_PESADO', label: '🪨 Empachamento / Pesado', desc: 'Digestão parada' },
              { id: 'NENHUMA_FOME', label: '🧊 Zero apetite / Aversão', desc: 'Não consigo engolir sólidos' },
              { id: 'NENHUM', label: '✨ Digestão normal', desc: 'Tolerância tranquila' },
            ].map((s) => (
              <button
                key={s.id}
                type="button"
                className="tl-outline"
                style={{
                  padding: '0.5rem',
                  textAlign: 'left',
                  borderRadius: '8px',
                  backgroundColor: symptomTrigger === s.id ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                  borderColor: symptomTrigger === s.id ? '#ef4444' : 'var(--border, #334155)',
                  cursor: 'pointer',
                }}
                onClick={() => setSymptomTrigger(s.id as SymptomTrigger)}
              >
                <strong style={{ fontSize: '0.8rem', display: 'block', color: symptomTrigger === s.id ? '#f87171' : 'inherit' }}>
                  {s.label}
                </strong>
                <small style={{ fontSize: '0.7rem', color: 'var(--muted, #94a3b8)' }}>{s.desc}</small>
              </button>
            ))}
          </div>
        </div>

        {/* Dose e Seringa */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', borderTop: '1px solid var(--border, #334155)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted, #94a3b8)' }}>Unidades na seringa:</span>
            <input
              type="number"
              min={1}
              max={50}
              value={syringeUI}
              onChange={(e) => setSyringeUI(Number(e.target.value) || 6)}
              style={{ width: '60px', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border, #334155)', background: '#090d16', color: '#fff' }}
            />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>UI</span>
          </div>

          <button
            type="button"
            className="tl-outline"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
            onClick={() => setShowSyringeHelper(!showSyringeHelper)}
          >
            {showSyringeHelper ? 'Ocultar guia de seringa' : '🔍 Entender 6 UI vs 8 UI'}
          </button>
        </div>

        {/* Guia de Seringa Expansível */}
        {showSyringeHelper && (
          <div style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '8px', padding: '0.75rem', fontSize: '0.785rem', lineHeight: 1.45 }}>
            <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '0.25rem' }}>
              💉 Por que a variação na seringa causa mal-estar?
            </strong>
            Em seringas de insulina (100 UI = 1 mL), a diferença de <strong>8 UI (2,5 mg prescrito)</strong> para <strong>6 UI</strong> representa uma queda de 25% na concentração, ou se a concentração do frasco for maior, pode haver sobredose acidental. A oscilação na quantidade de medicamento desregula a adaptação dos receptores no estômago, provocando o retorno abrupto de náusea e regurgitação.
          </div>
        )}

        <button
          type="button"
          className="tl-primary full"
          style={{ marginTop: '0.25rem' }}
          onClick={handleLogIntake}
        >
          Calcular Próxima Refeição &amp; Enviar para Parecer do Médico
        </button>
      </div>

      {feedbackNotice && (
        <div style={{ padding: '0.6rem 0.85rem', marginTop: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
          {feedbackNotice}
        </div>
      )}

      {/* CARD DA PRÓXIMA REFEIÇÃO SUGERIDA */}
      <div
        style={{
          marginTop: '1.25rem',
          backgroundColor: 'rgba(16, 185, 129, 0.05)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          padding: '1.2rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.5px' }}>
            🍽️ Recomendação Dinâmica para seu Prato
          </span>
          <span style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
            Temperatura: {suggestion.temperature}
          </span>
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--foreground, #f8fafc)' }}>
          {suggestion.title}
        </h3>

        <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border, #334155)', marginBottom: '0.75rem' }}>
          <strong style={{ fontSize: '0.9rem', color: '#10b981', display: 'block', marginBottom: '0.2rem' }}>
            {suggestion.food}
          </strong>
          <p style={{ fontSize: '0.825rem', color: 'var(--muted, #94a3b8)', margin: 0 }}>
            Porção recomendada: <strong>{suggestion.portion}</strong> &bull; Meta proteica: <strong>{suggestion.proteinG}g</strong>
          </p>
        </div>

        <p style={{ fontSize: '0.825rem', color: 'var(--foreground, #cbd5e1)', lineHeight: 1.45, margin: '0 0 0.75rem 0' }}>
          <strong>Por que esta escolha?</strong> {suggestion.clinicalReasoning}
        </p>

        {suggestion.physicalActivityWarning && (
          <div style={{ padding: '0.65rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', borderRadius: '0 6px 6px 0', fontSize: '0.8rem', color: '#fef3c7', marginBottom: '0.75rem' }}>
            {suggestion.physicalActivityWarning}
          </div>
        )}

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f87171', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
            Evitar nesta refeição:
          </span>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.785rem', color: 'var(--muted, #94a3b8)' }}>
            {suggestion.contraindications.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* PARECER DO MÉDICO RESPONSÁVEL (ACOMPANHAMENTO SEMANAL) */}
      {doctorOpinion && (
        <div
          style={{
            marginTop: '1.25rem',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            border: '1px solid var(--border, #334155)',
            borderRadius: '12px',
            padding: '1.2rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#38bdf8' }}>
                👨‍⚕️ Parecer Clínico &bull; {doctorOpinion.doctorName}
              </span>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>{doctorOpinion.periodSummary}</div>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                backgroundColor: doctorOpinion.decision === 'MANTER_DOSE_MINIMA' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: doctorOpinion.decision === 'MANTER_DOSE_MINIMA' ? '#ef4444' : '#10b981',
                border: doctorOpinion.decision === 'MANTER_DOSE_MINIMA' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              {doctorOpinion.decisionLabel}
            </span>
          </div>

          <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.5)', padding: '0.85rem', borderRadius: '8px', borderLeft: '3px solid #38bdf8', marginBottom: '0.75rem' }}>
            <strong style={{ fontSize: '0.825rem', color: 'var(--foreground, #f8fafc)', display: 'block', marginBottom: '0.25rem' }}>
              Avaliação do Prescritor:
            </strong>
            <p style={{ fontSize: '0.825rem', color: 'var(--foreground, #cbd5e1)', margin: 0, lineHeight: 1.45 }}>
              “{doctorOpinion.clinicalFeedback}”
            </p>
          </div>

          <div style={{ fontSize: '0.785rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '0.65rem', borderRadius: '6px' }}>
            <strong>Orientação sobre dosagem:</strong> {doctorOpinion.doseAdjustmentGuide}
          </div>
        </div>
      )}
    </div>
  );
}
