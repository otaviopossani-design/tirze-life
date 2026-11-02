import { useEffect, useState } from 'react';
import { formatDate, makePlan, profiles, weekDates, type Profile } from '../domain/nutrition';
import { useMealLogs, useNutritionRecord } from '../store/nutrition-store';
import { Icon } from './dashboard-ui';
import { NutritionAlert, NutritionGuidance, NutritionSources } from './NutritionGuide';
import './nutrition.css';

export function usePatientNutrition(patientId: string) {
  const {record, error} = useNutritionRecord(patientId);
  const [profile, setProfile] = useState<Profile>('routine');
  useEffect(() => setProfile('routine'), [patientId]);
  const tracking = useMealLogs(patientId);
  const plan = record?.published ?? (patientId === 'TL-001' && !error ? makePlan() : null);
  const revision = record?.published ? String(record.revision) : 'example';
  const today = formatDate();
  const todayMeals = plan?.days[(new Date().getDay() + 6) % 7] ?? [];
  const completed = todayMeals.filter(m => !!tracking.logs[today + ':' + revision + ':' + m.id]).length;
  return {plan, record, error, tracking, revision, today, completed, profile, setProfile};
}
export default function PatientNutrition({nutrition, compact = false, onExpand}: {nutrition: ReturnType<typeof usePatientNutrition>; compact?: boolean; onExpand?: () => void}) {
  const {plan, record, error, tracking, revision, today, profile, setProfile} = nutrition;
  const [day, setDay] = useState((new Date().getDay() + 6) % 7);
  const [chosen, setChosen] = useState<Record<string, boolean>>({});
  useEffect(() => { setChosen({}); }, [revision, plan?.patientId]);
  const dates = weekDates();
  const selectedDate = dates[day]!.date;
  const meals = plan?.days[day] ?? [];
  const illustrative = !record?.published;
  const available = profile !== 'routine' && (illustrative || !!record?.published?.enabledProfiles.includes(profile));
  const profileLabel = profiles.find(p => p.id === (available ? profile : 'routine'))!.label;
  if (error) return <section className="tl-card nt-error" role="alert"><h2>Plano indisponível</h2><p>{error}</p></section>;
  if (!plan) return <section className="tl-card nt-empty"><Icon name="meal" size={32}/><h2>Seu plano está sendo preparado.</h2><p>A clínica ainda não publicou um cardápio para este paciente. As orientações individuais aparecerão aqui após a revisão.</p><NutritionAlert/></section>;
  const done = meals.filter(m => tracking.logs[selectedDate + ':' + revision + ':' + m.id]).length;
  return <div className={'nt-patient ' + (compact ? 'nt-compact' : '')}>
    <section className="tl-card nt-plan">
      <header className="nt-plan-heading"><div><span className="tl-kicker"><Icon name="leaf" size={16}/> NUTRIÇÃO NO SEU RITMO</span><h2>{plan.title}</h2><p>{record?.published ? 'Seu plano semanal, revisado pela equipe.' : 'Explore um exemplo. Seu plano individual depende da revisão da equipe.'}</p></div><span className="nt-tag">{record?.published ? 'Versão ' + revision : 'Modelo ilustrativo'}</span></header>
      {record?.published && <div className="nt-review-line"><Icon name="check" size={14}/><span>Revisão: {plan.reviewer} · {new Date(record.publishedAt!).toLocaleDateString('pt-BR')}</span></div>}
      {!compact && <div className="nt-week" role="group" aria-label="Dias do cardápio">{dates.map(d => <button key={d.date} aria-label={d.label + ', ' + d.number} aria-pressed={day === d.index} className={d.date === today ? 'is-today' : ''} onClick={() => setDay(d.index)}><span>{d.label.slice(0, 3)}</span><strong>{d.number}</strong><small>{d.date === today ? 'Hoje' : '\u00a0'}</small></button>)}</div>}
      <div className="nt-profile-heading"><h3>Como está sua alimentação?</h3><span>Selecione para adaptar o cardápio</span></div>
      <div className="nt-profile-tabs" role="group" aria-label="Tolerância alimentar">{profiles.map(p => <button key={p.id} aria-pressed={profile === p.id} onClick={() => {setProfile(p.id); setChosen({});}}><Icon name={p.icon} size={16}/>{p.label}</button>)}</div>
      {profile !== 'routine' && <div className="nt-adaptation-note" role="status">{available ? (illustrative ? 'Exemplo de cardápio adaptado. As porções precisam de revisão individual antes do uso.' : 'Cardápio adaptado com as opções liberadas pela equipe. Você pode voltar à opção habitual em cada refeição.') : 'Adaptação ainda não liberada pela equipe. O cardápio habitual continua abaixo; consulte as orientações e converse com sua clínica.'}{done > 0 && ' Refeições já registradas foram preservadas.'}</div>}
      {plan.restrictions && <div className="nt-restrictions"><strong>Alergias e restrições registradas</strong><p>{plan.restrictions}</p></div>}
      <div className="nt-meal-heading"><span>{compact ? 'Hoje' : weekdaysLabel(day)} · {profileLabel}</span><span>{done} de {meals.length} registradas</span></div>
      <div className="nt-meals">{meals.slice(0, compact ? 2 : 4).map(meal => {
        const key = selectedDate + ':' + revision + ':' + meal.id;
        const log = tracking.logs[key];
        const useAlternative = available && chosen[key] !== false;
        const option = log ?? meal.options[useAlternative ? profile : 'routine'];
        const editable = selectedDate <= today;
        return <article className={'nt-meal ' + (log ? 'is-complete' : '')} key={meal.id}>
          <div className="nt-meal-top"><span className="nt-time">{meal.time}</span><h3>{meal.title}</h3><span className="nt-meal-status">{log ? 'Registrada' : ''}</span></div>
          <strong className="nt-food">{option.food}</strong><p className="nt-portion">{option.portion}</p>
          <div className="nt-meal-actions">{available && !log && <button className="nt-substitute" aria-pressed={!!useAlternative} onClick={() => setChosen({...chosen, [key]: !useAlternative})}>{useAlternative ? 'Voltar à opção habitual' : illustrative ? 'Usar exemplo adaptado' : 'Usar opção revisada'}</button>}
            <button className={'nt-record ' + (log ? 'is-done' : '')} aria-label={(log ? 'Desmarcar ' : 'Concluir ') + meal.title} aria-pressed={!!log} disabled={!editable} onClick={() => tracking.toggle(key, {food: option.food, portion: option.portion, profile: useAlternative ? profile : 'routine', recordedAt: new Date().toISOString()})}><Icon name={log ? 'check' : 'plus'} size={16}/>{log ? 'Refeição registrada' : editable ? 'Registrar refeição' : 'Dia futuro'}</button>
          </div>
          {log && <small className="nt-small">{log.profile !== 'routine' ? 'Registro com opção adaptada. ' : 'Refeição já registrada. '}Desmarque para alterar.</small>}
        </article>;
      })}</div>
      {tracking.error && <p role="alert" className="nt-error">{tracking.error}</p>}
      {compact && <button className="tl-text-button full" onClick={onExpand}>Abrir cardápio semanal <Icon name="arrow" size={16}/></button>}
      {!compact && <p className="nt-small nt-tracking-note">O registro indica a refeição selecionada; não calcula a quantidade efetivamente consumida nem gramas de proteína.</p>}
    </section>
    {!compact && <aside className="nt-side">
      <NutritionGuidance profile={profile}/>
      <section className="tl-card nt-care"><span className="tl-kicker">COMBINADO COM A EQUIPE</span><h3>Seu plano é individual.</h3><div className="nt-targets"><div><strong>{record?.published && plan.proteinTarget ? plan.proteinTarget + ' g' : 'A definir'}</strong><span>Proteína / dia</span></div><div><strong>{record?.published && plan.waterTarget ? (plan.waterTarget / 1000).toLocaleString('pt-BR') + ' L' : 'A definir'}</strong><span>Líquidos / dia</span></div></div><p>{plan.notes}</p><p className="nt-small">Nesta demonstração, as metas são fictícias. No atendimento real, a equipe define os valores individualmente, sem calculá-los pela dose.</p></section>
      <NutritionAlert/><NutritionSources/>
      <p className="nt-local-note">Demonstração local: use dados fictícios. Planos e registros ficam salvos neste navegador.</p>
    </aside>}
  </div>;
}
function weekdaysLabel(day: number) { return ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'][day]; }
