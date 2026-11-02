import { useEffect, useState } from 'react';
import { makePlan, profiles, publicationErrors, weekdays, type NutritionPlan, type Profile } from '../domain/nutrition';
import { readRecord, saveRecord } from '../store/nutrition-store';
import { Icon } from './dashboard-ui';
import { NutritionGuidance, NutritionSources } from './NutritionGuide';
import './nutrition.css';

type Props = { patientId: string; patientName: string; medication: string; onDirty: (dirty: boolean) => void; onSaved: (plan: NutritionPlan, published: boolean) => void };
export default function ClinicNutritionEditor({patientId, patientName, medication, onDirty, onSaved}: Props) {
  const [initial] = useState(() => {
    try { return { record: readRecord(patientId), error: '' }; }
    catch { return { record: null, error: 'O plano local não pôde ser lido. Não é seguro sobrescrevê-lo; reabra a ficha após verificar o armazenamento.' }; }
  });
  const [plan, setPlan] = useState<NutritionPlan>(() => structuredClone(initial.record?.draft ?? initial.record?.published ?? makePlan(patientId, patientName, medication)));
  const [savedAt, setSavedAt] = useState(initial.record?.savedAt ?? null);
  const [revision, setRevision] = useState(initial.record?.revision ?? 0);
  const [day, setDay] = useState(0);
  const [profile, setProfile] = useState<Profile>('routine');
  const [reviewed, setReviewed] = useState(false);
  const [errors, setErrors] = useState<string[]>(initial.error ? [initial.error] : []);
  const [status, setStatus] = useState('');
  const [copy, setCopy] = useState(false);
  const [modified, setModified] = useState(false);
  useEffect(() => {
    if (!modified) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [modified]);
  function update(next: NutritionPlan) { setPlan(next); setModified(true); onDirty(true); setReviewed(false); setStatus(''); setErrors([]); }
  function field<K extends keyof NutritionPlan>(key: K, value: NutritionPlan[K]) { update({...plan, [key]: value}); }
  function mealField(index: number, key: 'food' | 'portion' | 'time', value: string) {
    const next = structuredClone(plan); const meal = next.days[day]![index]!;
    if (key === 'time') meal.time = value; else meal.options[profile][key] = value;
    update(next);
  }
  function save(publish: boolean) {
    const validation = publish ? publicationErrors(plan) : [];
    if (publish && !reviewed) validation.unshift('Confirme a revisão de todos os dias e das adaptações liberadas.');
    if (validation.length) { setErrors(validation); return; }
    try {
      const record = saveRecord(plan, publish, savedAt);
      setSavedAt(record.savedAt); setRevision(record.revision); setErrors([]); setModified(false); onDirty(false); setReviewed(false);
      setStatus(publish ? 'Versão ' + record.revision + ' publicada no app local do paciente.' : 'Rascunho salvo. O paciente continua vendo a última versão publicada.');
      onSaved(plan, publish);
    } catch (error) { setErrors([error instanceof Error ? error.message : 'Não foi possível salvar. Verifique o armazenamento do navegador.']); }
  }
  return <div className="nt-editor">
    <div className="nt-editor-intro"><span className="nt-tag"><Icon name="meal" size={14}/> PLANO SEMANAL</span><h3>Do cuidado ao cardápio.</h3><p>Revise cada dia, personalize as porções e libere apenas as adaptações adequadas a este paciente.</p><span className="nt-small">{medication} · Registro de contexto. A dose não define o cardápio.</span></div>
    <div className="nt-local-note">Prévia com dados fictícios. Publicação e rascunhos ficam neste navegador, sem prontuário ou envio externo.</div>
    <label className="tl-field">Nome do plano<input maxLength={100} value={plan.title} onChange={e => field('title', e.target.value)}/></label>
    <div className="nt-day-tabs" role="group" aria-label="Dia em edição">{weekdays.map((label, i) => <button key={label} aria-pressed={day === i} onClick={() => {setDay(i); setCopy(false);}}>{label.slice(0, 3)}</button>)}</div>
    <label className="tl-field">Perfil alimentar em edição<select value={profile} onChange={e => setProfile(e.target.value as Profile)}>{profiles.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label>
    {profile !== 'routine' && <label className="nt-check"><input type="checkbox" checked={plan.enabledProfiles.includes(profile)} onChange={e => field('enabledProfiles', e.target.checked ? [...plan.enabledProfiles, profile] : plan.enabledProfiles.filter(p => p !== profile))}/>Liberar opções para {profiles.find(p => p.id === profile)?.label.toLowerCase()} após revisão</label>}
    <p className="nt-small">Exemplos editáveis. As opções não têm equivalência nutricional automática.</p>
    <div className="nt-edit-meals">{plan.days[day]!.map((meal, i) => <fieldset className="nt-edit-meal" key={meal.id}><legend>{meal.title}</legend>
      <label className="tl-field">Horário de {meal.title}<input type="time" value={meal.time} onChange={e => mealField(i, 'time', e.target.value)}/></label>
      <label className="tl-field">Alimentos de {meal.title}<textarea rows={2} maxLength={2000} value={meal.options[profile].food} onChange={e => mealField(i, 'food', e.target.value)}/></label>
      <label className="tl-field">Porção de {meal.title}<textarea rows={2} maxLength={2000} value={meal.options[profile].portion} onChange={e => mealField(i, 'portion', e.target.value)}/></label>
    </fieldset>)}</div>
    <button className="tl-outline full" onClick={() => setCopy(true)}>Repetir este dia na semana</button>
    {copy && <div className="nt-copy" role="alert"><p>Substituir os sete dias pelos horários e opções de {weekdays[day]?.toLowerCase()}, incluindo todos os perfis?</p><div className="nt-actions"><button className="tl-outline" onClick={() => setCopy(false)}>Cancelar</button><button className="tl-primary" onClick={() => {update({...plan, days: weekdays.map(() => structuredClone(plan.days[day]!))}); setCopy(false);}}>Aplicar aos sete dias</button></div></div>}
    <details className="nt-details"><summary>Restrições, metas e orientações</summary>
      <label className="tl-field">Alergias e restrições<textarea rows={2} maxLength={2000} value={plan.restrictions} onChange={e => field('restrictions', e.target.value)} placeholder="Revise ingredientes e alternativas manualmente."/></label>
      <p className="nt-small">O sistema não detecta alergênicos nem calcula necessidades nutricionais.</p>
      <div className="nt-two-fields"><label className="tl-field">Meta de proteína (g/dia)<input type="number" min="1" max="500" value={plan.proteinTarget ?? ''} onChange={e => field('proteinTarget', e.target.value === '' ? null : Number(e.target.value))} placeholder="Opcional"/></label>
      <label className="tl-field">Meta de líquidos (ml/dia)<input type="number" min="1" max="10000" value={plan.waterTarget ?? ''} onChange={e => field('waterTarget', e.target.value === '' ? null : Number(e.target.value))} placeholder="Opcional"/></label></div>
      <label className="tl-field">Orientações individuais<textarea rows={3} maxLength={2000} value={plan.notes} onChange={e => field('notes', e.target.value)}/></label>
    </details>
    <NutritionGuidance profile={profile}/>
    <section className="nt-publish"><span className="tl-kicker">REVISÃO E PUBLICAÇÃO</span><h3>{revision ? 'Versão publicada: ' + revision : 'Ainda não publicado'}</h3>
      <label className="tl-field">Responsável pela revisão<input value={plan.reviewer} maxLength={100} onChange={e => field('reviewer', e.target.value)} placeholder="Nome do nutricionista na demonstração"/></label>
      <label className="nt-check"><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)}/>Revisei os sete dias, porções, restrições e todas as adaptações que estou liberando.</label>
      <div className="nt-actions"><button className="tl-outline" disabled={!!initial.error} onClick={() => save(false)}>Salvar rascunho</button><button className="tl-primary" disabled={!!initial.error || !reviewed} onClick={() => save(true)}>Publicar no app local</button></div>
      {errors.length > 0 && <div className="nt-error" role="alert"><strong>Antes de continuar</strong><ul>{errors.slice(0, 8).map((error, i) => <li key={i}>{error}</li>)}</ul>{errors.length > 8 && <p>Há mais {errors.length - 8} campos para revisar.</p>}</div>}
      {status && <p className="nt-success" role="status">{status}</p>}
      <a className="nt-open-patient" href={'/?view=nutrition&paciente=' + encodeURIComponent(patientId)} target="_blank" rel="noreferrer">Abrir plano deste paciente ↗</a>
    </section>
    <NutritionSources/>
  </div>;
}
