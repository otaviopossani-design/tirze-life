import React, { useState } from 'react';
import { Icon } from './dashboard-ui';

export interface DoseInfo {
  dose: string;
  stage: string;
  focus: string;
  primarySymptom: string;
  gastricBehavior: string;
  nutritionalRecommendation: string;
  studyTitle: string;
  studyJournal: string;
  studyUrl: string;
  evidenceSummary: string;
}

export interface MedicationProtocol {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  targetMechanism: string;
  overview: string;
  hydrationRequirement: string;
  doses: DoseInfo[];
}

export const PROTOCOLS_DATA: MedicationProtocol[] = [
  {
    id: 'tirzepatide',
    name: 'Tirzepatida (Mounjaro / Zepbound)',
    shortName: 'Tirzepatida',
    badge: 'Duplo Agonista GLP-1 / GIP',
    targetMechanism: 'Ativa receptores de GLP-1 (reduz esvaziamento gástrico e apetite) e GIP (otimiza sensibilidade insulínica e metabolismo adiposo).',
    overview: 'Padrão-ouro em controle glicêmico e peso corporal, com curva de meia-vida de 120 horas e pico de ação entre 24h e 72h pós-aplicação.',
    hydrationRequirement: '35 ml/kg de peso corporal + 250 ml por unidade de álcool consumida.',
    doses: [
      {
        dose: '2,5 mg',
        stage: 'Semanas 1 a 4 · Iniciação e Adaptação',
        focus: 'Adaptação de Receptores e Tolerabilidade Gástrica',
        primarySymptom: 'Plenitude gástrica precoce, enjoo transitório leve ou boca seca.',
        gastricBehavior: 'Início da modulação dos receptores GLP-1/GIP no trato gastrointestinal. Prepara o organismo para os degraus terapêuticos.',
        nutritionalRecommendation: 'Fracionar refeições em pequenas porções; priorizar líquidos claros e manter 35 ml de água por kg.',
        studyTitle: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)',
        studyJournal: 'New England Journal of Medicine (NEJM) · 2022',
        studyUrl: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2206038',
        evidenceSummary: 'O escalonamento iniciando em 2,5 mg reduz drasticamente a descontinuação, com eventos gástricos sendo leves a moderados e transitórios.',
      },
      {
        dose: '5,0 mg',
        stage: 'Semanas 5 a 8 · Primeiro Degrau Terapêutico',
        focus: 'Controle de Saciedade e Atraso no Esvaziamento Gástrico',
        primarySymptom: 'Pico de náusea entre 24h e 72h após a aplicação; aversão a gorduras e frituras.',
        gastricBehavior: 'Máxima lentidão na motilidade gástrica. O estômago retém o bolo alimentar por muito mais tempo, prolongando a saciedade.',
        nutritionalRecommendation: 'Ativar o Modo Enjoo no pico: frango desfiado, purê de abóbora/cenoura e suspender alimentos pesados.',
        studyTitle: 'Tirzepatide versus Semaglutide Once Weekly in Type 2 Diabetes (SURPASS-2)',
        studyJournal: 'The Lancet / NEJM · 2021',
        studyUrl: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)01443-4/fulltext',
        evidenceSummary: 'A dose de 5 mg inicia a curva de eficácia terapêutica consistente, com redução expressiva do ruído alimentar e controle glicêmico.',
      },
      {
        dose: '7,5 mg',
        stage: 'Semanas 9 a 12 · Aceleração Metabólica',
        focus: 'Manejo de Trânsito Intestinal e Hidratação Ativa',
        primarySymptom: 'Tendência a constipação (intestino preso) ou estufamento pós-prandial.',
        gastricBehavior: 'Volume fecal reduzido e trânsito digestivo mais lento. Exige reforço mecânico com fibras solúveis e água morna.',
        nutritionalRecommendation: '25g a 30g de fibras solúveis (aveia, psyllium, mamão) com água morna em jejum. Não forçar grandes pratos.',
        studyTitle: 'Clinical Management of Gastrointestinal Adverse Events with Incretin Therapies',
        studyJournal: 'PMC / Advances in Therapy · 2023',
        studyUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9821052/',
        evidenceSummary: 'Intervenções comportamentais alimentares (hidratação, redução de gorduras e fracionamento) resolvem mais de 85% das queixas gástricas.',
      },
      {
        dose: '10,0 mg a 15,0 mg',
        stage: 'Semanas 13+ · Altas Doses e Manutenção',
        focus: 'Preservação de Massa Magra (Proteção Anti-Sarcopenia)',
        primarySymptom: 'Apetite muito baixo ("esquecer de comer"), risco de queima muscular se faltar proteína.',
        gastricBehavior: 'Controle profundo do apetite. Risco de déficit calórico extremo se não houver disciplina proteica.',
        nutritionalRecommendation: 'Bater obrigatoriamente o piso de 1,6g a 2,0g de proteína por kg através de shakes, claras de ovos, peixes e suplementos.',
        studyTitle: 'Consenso Europeu EASO / EFAD / ECPO sobre Terapias Incretínicas',
        studyJournal: 'Obesity Facts · 2026 Consensus',
        studyUrl: 'https://easo.org/nutritional-functional-and-psychological-considerations-for-obesity-management-medications-in-adults-an-easo-efad-and-ecpo-consensus-statement/',
        evidenceSummary: 'O sucesso sustentável exige proteção deliberada da massa muscular esquelética por meio de alta densidade proteica e treino de força.',
      },
    ],
  },
  {
    id: 'retatrutide',
    name: 'Retatrutida (Triplo Agonista · Retar)',
    shortName: 'Retatrutida',
    badge: 'Triplo Agonista GLP-1 / GIP / Glucagon',
    targetMechanism: 'Ativa simultaneamente três eixos: GLP-1 e GIP (saciedade gástrica e sensibilidade insulínica) + Receptor de Glucagon (aumento direto do gasto energético basal e termogênese hepática).',
    overview: 'Molécula de última geração em ensaios clínicos globais (Eli Lilly). Promove taxas de perda ponderal superiores ao estimular ativamente a queima energética no fígado e tecido adiposo marrom.',
    hydrationRequirement: '40 ml/kg de peso corporal (a termogênese ampliada exige maior aporte hídrico contínuo e eletrólitos).',
    doses: [
      {
        dose: '1,0 mg a 2,0 mg',
        stage: 'Fase Inicial · Iniciação de Termogênese',
        focus: 'Adaptação do Receptor de Glucagon e Tolerabilidade Cardíaca/Gástrica',
        primarySymptom: 'Leve sensação de calor corporal, aumento sutil transitório da frequência cardíaca em repouso e saciedade imediata.',
        gastricBehavior: 'A combinação do Glucagon com GLP-1 induz consumo calórico basal mais alto, mantendo o esvaziamento gástrico moderado.',
        nutritionalRecommendation: 'Aporte de água com eletrólitos (sódio, magnésio, potássio); evitar jejum prolongado sem líquidos.',
        studyTitle: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial',
        studyJournal: 'New England Journal of Medicine (NEJM) · 2023',
        studyUrl: 'https://www.nejm.org/doi/full/10.1056/NEJMoa2301972',
        evidenceSummary: 'Os ensaios de fase 2 mostraram redução de peso de até 24,2% em 48 semanas, com excelente perfil metabólico quando acompanhado de nutrição adequada.',
      },
      {
        dose: '4,0 mg a 8,0 mg',
        stage: 'Fase Terapêutica Intermediária',
        focus: 'Mobilização Lipídica Hepática Acelerada',
        primarySymptom: 'Apetite drasticamente diminuído, elevação da taxa metabólica basal, sede acentuada.',
        gastricBehavior: 'Esvaziamento gástrico lento somado à lipólise acelerada no tecido hepático. O corpo consome reservas rapidamente.',
        nutritionalRecommendation: 'Manter rigorosamente 1,8g de proteína/kg para evitar catabolismo muscular; fracionar em shakes e caldos.',
        studyTitle: 'Retatrutide for Type 2 Diabetes and Obesity: Metabolic Mechanisms',
        studyJournal: 'The Lancet · 2023',
        studyUrl: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01053-X/fulltext',
        evidenceSummary: 'A ativação do receptor de glucagon acelera o esvaziamento de gordura intra-hepática, melhorando esteatose e sensibilidade à insulina.',
      },
      {
        dose: '12,0 mg',
        stage: 'Dose Máxima Terapêutica',
        focus: 'Preservação de Força e Densidade Óssea',
        primarySymptom: 'Saciedade quase contínua; necessidade de disciplina para não passar o dia em jejum acidental.',
        gastricBehavior: 'Taxa metabólica máxima com apetite residual mínimo.',
        nutritionalRecommendation: 'Suplementação proteica concentrada (Whey isolado ou proteína vegetal) combinada a 3 treinos resistidos por semana.',
        studyTitle: 'Long-term Efficacy and Safety Profile of Triple Incretin Agonists',
        studyJournal: 'Nature Medicine Reviews · 2024',
        studyUrl: 'https://www.nature.com/articles/s41591-023-02418-0',
        evidenceSummary: 'Resultados sem precedentes em composição corporal, reforçando a necessidade mandatória de aporte proteico para preservar massa magra.',
      },
    ],
  },
  {
    id: 'cagrisema',
    name: 'CagriSema (Cagrilintida + Semaglutida)',
    shortName: 'CagriSema',
    badge: 'Co-Agonista Amilina + GLP-1',
    targetMechanism: 'Combina Cagrilintida (análogo de amilina que atua no controle hipotalâmico de saciedade e esvaziamento) com Semaglutida (agonista GLP-1).',
    overview: 'Dupla ação em vias não-concorrentes de saciedade no sistema nervoso central e estômago, gerando plenitude profunda com doses menores de GLP-1.',
    hydrationRequirement: '35 ml/kg de peso corporal fracionados em pequenos goles ao longo do dia.',
    doses: [
      {
        dose: '0,25 / 0,25 mg',
        stage: 'Iniciação · Dupla Sinergia',
        focus: 'Adaptação do Eixo Amilina-GLP-1',
        primarySymptom: 'Plenitude gástrica acentuada mesmo com metade da porção habitual.',
        gastricBehavior: 'A amilina age no centro de saciedade no tronco cerebral reduzindo a velocidade com que os sólidos entram no duodeno.',
        nutritionalRecommendation: 'Comer metade da porção no prato, aguardar 15 minutos e observar o sinal de saciedade antes de continuar.',
        studyTitle: 'CagriSema (semaglutide and cagrilintide) once weekly for weight management',
        studyJournal: 'The Lancet · 2023',
        studyUrl: 'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01164-9/fulltext',
        evidenceSummary: 'A combinação em dose fixa de cagrilintida com semaglutida demonstrou controle de apetite significativamente superior aos componentes isolados.',
      },
      {
        dose: '1,0 / 1,0 mg a 2,4 / 2,4 mg',
        stage: 'Doses Terapêuticas Plenas',
        focus: 'Manutenção de Densidade Nutricional e Controle de Enjoo',
        primarySymptom: 'Enjoo a refeições volumosas ou ricas em carboidratos refinados.',
        gastricBehavior: 'Saciedade mecânica e neuroquímica duradoura.',
        nutritionalRecommendation: 'Substituir refeições volumosas por pratos compactos com alta densidade nutricional: ovos, atum, queijos brancos e azeite.',
        studyTitle: 'Dual Amylin and GLP-1 Receptor Agonism in Clinical Practice',
        studyJournal: 'Diabetes Care · 2024',
        studyUrl: 'https://doi.org/10.2337/doci25-0008',
        evidenceSummary: 'Estratégia eficaz na quebra de platôs metabólicos com proteção da função das células beta pancreáticas.',
      },
    ],
  },
  {
    id: 'peptides_glow',
    name: 'Peptídeos Estéticos & Regenerativos (Glow / GHK-Cu)',
    shortName: 'Glow / GHK-Cu',
    badge: 'Peptídeo de Cobre & Síntese de Colágeno',
    targetMechanism: 'O tripeptídeo GHK-Cu (Glicil-L-histidil-L-lisina com íon de cobre) estimula a transcrição gênica de colágeno, elastina e glicosaminoglicanos, além de possuir ação antioxidante e anti-inflamatória tecidual.',
    overview: 'Utilizado frequentemente como adjuvante em protocolos de emagrecimento para combater o chamado "Ozempic Face" (flacidez facial e perda de sustentação) e o eflúvio telógeno (queda capilar pós-perda de peso rápida).',
    hydrationRequirement: '35 a 40 ml/kg de peso corporal para suporte à matriz extracelular.',
    doses: [
      {
        dose: '1,0 mg a 2,5 mg / dia',
        stage: 'Protocolo Subcutâneo Contínuo (Ciclos de 4 a 8 semanas)',
        focus: 'Matriz Dérmica, Firmeza Facial e Fortalecimento Folicular',
        primarySymptom: 'Sensação leve de formigamento ou vermelhidão transitória no local da injeção.',
        gastricBehavior: 'Não atua no esvaziamento gástrico nem no apetite; sua ação é biológica celular nos fibroblastos dérmicos e folículos capilares.',
        nutritionalRecommendation: 'Consumo obrigatório de Vitamina C (100 a 500 mg/dia via frutas cítricas ou suplemento) como cofator de hidroxilação do colágeno, associado a 10g a 15g de peptídeos de colágeno ou whey protein.',
        studyTitle: 'Regenerative and Protective Actions of the GHK-Cu Peptide in the Light of the New Gene Data',
        studyJournal: 'International Journal of Molecular Sciences · PMC 2018',
        studyUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/',
        evidenceSummary: 'O GHK-Cu reprograma a expressão de centenas de genes envolvidos no remodelamento dérmico, estimulando síntese de colágeno tipo 1 e cicatrização acelerada.',
      },
    ],
  },
];

export default function DoseScienceGuide() {
  const [selectedMedIndex, setSelectedMedIndex] = useState(0);
  const [selectedDoseIndex, setSelectedDoseIndex] = useState(0);

  const currentMed = PROTOCOLS_DATA[selectedMedIndex] ?? PROTOCOLS_DATA[0]!;
  const currentDose = currentMed.doses[selectedDoseIndex] ?? currentMed.doses[0]!;

  function handleMedChange(idx: number) {
    setSelectedMedIndex(idx);
    setSelectedDoseIndex(0);
  }

  return (
    <section className="tl-card dose-science-card" style={{ marginTop: '1.25rem' }}>
      <div className="tl-card-heading">
        <span className="tl-kicker">
          <Icon name="activity" size={16} /> PROTOCOLOS &amp; BASE CIENTÍFICA
        </span>
        <span className="tl-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          Conexão Clínica &bull; Evidências
        </span>
      </div>

      <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
          Diretrizes por Medicação e Dose
        </h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted, #64748b)', margin: 0 }}>
          Cruzamento científico entre o tratamento informado pela clínica e a rotina do paciente. Selecione a substância para ver doses e alívio de sintomas.
        </p>
      </div>

      {/* Seletor de Medicação (Tirze, Retar, CagriSema, Glow/GHK-Cu) */}
      <div style={{ marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted, #94a3b8)', display: 'block', marginBottom: '0.4rem' }}>
          Selecione a Medicação em Uso:
        </span>
        <div
          role="tablist"
          aria-label="Medicação do tratamento"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.4rem',
          }}
        >
          {PROTOCOLS_DATA.map((med, idx) => (
            <button
              key={med.id}
              role="tab"
              aria-selected={selectedMedIndex === idx}
              onClick={() => handleMedChange(idx)}
              className="tl-outline"
              style={{
                padding: '0.45rem 0.75rem',
                fontWeight: 600,
                fontSize: '0.825rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedMedIndex === idx ? 'var(--accent, #10b981)' : 'transparent',
                color: selectedMedIndex === idx ? '#fff' : 'inherit',
                borderColor: selectedMedIndex === idx ? 'var(--accent, #10b981)' : 'var(--border, #334155)',
              }}
            >
              {med.shortName}
            </button>
          ))}
        </div>
      </div>

      {/* Header da Medicação Selecionada */}
      <div
        style={{
          backgroundColor: 'rgba(30, 41, 59, 0.4)',
          border: '1px solid var(--border, #334155)',
          borderRadius: '10px',
          padding: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <strong style={{ fontSize: '1rem', color: 'var(--foreground, #f8fafc)' }}>
            {currentMed.name}
          </strong>
          <span style={{ fontSize: '0.725rem', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
            {currentMed.badge}
          </span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--foreground, #cbd5e1)', margin: '0.35rem 0 0 0', lineHeight: 1.4 }}>
          {currentMed.targetMechanism}
        </p>
        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Icon name="drop" size={13} />
          <strong>Meta hídrica recomendada:</strong> {currentMed.hydrationRequirement}
        </div>
      </div>

      {/* Seletor de Doses da Medicação */}
      <div style={{ marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted, #94a3b8)', display: 'block', marginBottom: '0.35rem' }}>
          Degraus de Dose:
        </span>
        <div
          role="tablist"
          aria-label="Doses da medicação"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${currentMed.doses.length}, minmax(60px, 1fr))`,
            gap: '0.4rem',
          }}
        >
          {currentMed.doses.map((d, idx) => (
            <button
              key={d.dose}
              role="tab"
              aria-selected={selectedDoseIndex === idx}
              onClick={() => setSelectedDoseIndex(idx)}
              className="tl-outline"
              style={{
                padding: '0.45rem 0.25rem',
                textAlign: 'center',
                fontWeight: 700,
                fontSize: '0.825rem',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedDoseIndex === idx ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                color: selectedDoseIndex === idx ? '#10b981' : 'inherit',
                borderColor: selectedDoseIndex === idx ? '#10b981' : 'var(--border, #334155)',
              }}
            >
              {d.dose}
            </button>
          ))}
        </div>
      </div>

      {/* Detalhes da Dose Selecionada */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid var(--border, #334155)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent, #10b981)', textTransform: 'uppercase' }}>
              {currentDose.stage}
            </span>
            <h3 style={{ margin: '0.2rem 0 0 0', fontSize: '1.05rem', fontWeight: 700 }}>
              {currentDose.focus}
            </h3>
          </div>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(51, 65, 85, 0.6)',
              color: 'var(--foreground, #e2e8f0)',
            }}
          >
            Dose selecionada: <strong>{currentDose.dose}</strong>
          </span>
        </div>

        {/* Sintoma & Mecanismo Gástrico */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.75rem' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
            <strong style={{ fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Icon name="heart" size={14} /> Sintomas Mais Frequentes
            </strong>
            <p style={{ fontSize: '0.825rem', margin: '0.35rem 0 0 0', lineHeight: 1.4, color: 'var(--foreground, #cbd5e1)' }}>
              {currentDose.primarySymptom}
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.5)', padding: '0.75rem', borderRadius: '8px' }}>
            <strong style={{ fontSize: '0.8rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Icon name="activity" size={14} /> Resposta Biológica no Organismo
            </strong>
            <p style={{ fontSize: '0.825rem', margin: '0.35rem 0 0 0', lineHeight: 1.4, color: 'var(--foreground, #cbd5e1)' }}>
              {currentDose.gastricBehavior}
            </p>
          </div>
        </div>

        {/* Recomendação Prática de Alimentação */}
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.75rem', borderRadius: '8px' }}>
          <strong style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Icon name="leaf" size={14} /> Como Aliviar à Mesa (Consenso Nutricional da Clínica)
          </strong>
          <p style={{ fontSize: '0.825rem', margin: '0.35rem 0 0 0', lineHeight: 1.45, color: 'var(--foreground, #f1f5f9)' }}>
            {currentDose.nutritionalRecommendation}
          </p>
        </div>

        {/* Box da Evidência Científica com Link Oficial */}
        <div style={{ borderTop: '1px solid var(--border, #334155)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <span style={{ fontSize: '0.725rem', color: 'var(--muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Fonte Científica Primária
              </span>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--foreground, #f8fafc)' }}>
                {currentDose.studyTitle}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted, #94a3b8)' }}>
                Publicado em: <em>{currentDose.studyJournal}</em>
              </div>
            </div>

            <a
              href={currentDose.studyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tl-outline"
              style={{
                fontSize: '0.75rem',
                padding: '0.4rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none',
                color: 'var(--accent, #10b981)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                borderRadius: '6px',
                whiteSpace: 'nowrap',
              }}
            >
              Ler Estudo Oficial ↗
            </a>
          </div>

          <p style={{ fontSize: '0.775rem', color: 'var(--muted, #94a3b8)', margin: '0.5rem 0 0 0', fontStyle: 'italic', lineHeight: 1.4 }}>
            "{currentDose.evidenceSummary}"
          </p>
        </div>
      </div>

      {/* Disclaimer Médico Obrigatório com Borda Destacada */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.85rem',
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          borderLeft: '4px solid #ef4444',
          borderRadius: '0 8px 8px 0',
          fontSize: '0.775rem',
          lineHeight: 1.45,
          color: 'var(--foreground, #e2e8f0)',
        }}
      >
        <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.25rem' }}>
          ⚠️ Aviso de Isenção de Responsabilidade Médica (Não-Exercício Médico)
        </strong>
        O Tirze-Life atua exclusivamente no suporte de estilo de vida, hábitos alimentares de bem-estar e conexão com as orientações da clínica. 
        <strong> Não somos médicos, não fazemos diagnósticos e não prescrevemos medicamentos nem dosagens.</strong> 
        As informações aqui apresentadas são referências extraídas de ensaios clínicos revisados por pares para auxílio no alívio de desconfortos comuns. 
        Toda alteração de dosagem deve ser previamente orientada e acompanhada pelo seu médico assistente.
      </div>
    </section>
  );
}
