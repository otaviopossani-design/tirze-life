import { useNutritionRecord } from '../store/nutrition-store';
import { Icon } from './dashboard-ui';
import { NutritionSources } from './NutritionGuide';
import './nutrition.css';

type PatientSummary = {id: string; name: string; medication: string};
function PlanCard({patient, onOpen}: {patient: PatientSummary; onOpen: () => void}) {
  const {record, error} = useNutritionRecord(patient.id);
  const plan = record?.draft ?? record?.published;
  return <section className="tl-card cl-plan-card"><div className="cl-person"><span className="cl-avatar">{patient.name.split(' ').slice(0,2).map(n => n[0]).join('')}</span><div><strong>{patient.name}</strong><small>{patient.id} · {patient.medication}</small></div></div>
    <span className={'cl-plan-status ' + (record?.published ? 'reviewed' : '')}>{record?.published ? 'Publicado · versão ' + record.revision : record?.draft ? 'Rascunho salvo' : 'Aguardando revisão'}</span>
    <h2>{plan?.title ?? 'Plano alimentar semanal'}</h2><div className="nt-card-meta"><span><strong>7 dias</strong> · 4 refeições por dia</span><span>{record?.published ? record.published.enabledProfiles.length + ' adaptações liberadas' : 'Opções por tolerância alimentar'}</span><span>{record?.published ? 'Revisão: ' + record.published.reviewer : 'Porções e metas a individualizar'}</span></div>
    {error && <p role="alert">{error}</p>}
    <button className="tl-outline full" onClick={onOpen}>Abrir plano <Icon name="arrow" size={16}/></button>
    <a className="nt-card-patient-link" href={'/?view=nutrition&paciente=' + encodeURIComponent(patient.id)} target="_blank" rel="noreferrer">Ver como paciente ↗</a>
  </section>;
}
export default function ClinicNutritionOverview({patients, onOpen}: {patients: PatientSummary[]; onOpen: (id: string) => void}) {
  return <div className="nt-plan-overview"><section className="nt-plan-banner"><div><span className="tl-kicker">ALIMENTAÇÃO COM CONTINUIDADE</span><h2>Um plano. Diferentes momentos.</h2><p>Organize a semana e revise as opções para enjoo, intestino preso e diarreia. Publique quando o plano estiver pronto para o paciente.</p></div><Icon name="leaf" size={46}/></section>
    <div className="cl-plan-grid">{patients.map(patient => <PlanCard key={patient.id} patient={patient} onOpen={() => onOpen(patient.id)}/>)}</div>
    <NutritionSources/>
  </div>;
}
