import { profiles, sourceLinks, type Profile } from '../domain/nutrition';
import { Icon } from './dashboard-ui';

export function NutritionGuidance({ profile }: { profile: Profile }) {
  const current = profiles.find(p => p.id === profile)!;
  return <section className="nt-guidance" aria-label="Orientações alimentares">
    <span className="tl-kicker"><Icon name={current.icon} size={16}/> CUIDADO NA ROTINA</span>
    <h3>{current.summary}</h3>
    <ul>{current.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
    <p className="nt-small">Sintomas persistentes ou dificuldade para comer e beber precisam ser avaliados pela equipe. Não altere a medicação por conta própria.</p>
  </section>;
}
export function NutritionSources() {
  return <details className="nt-sources"><summary>De onde vêm estas orientações?</summary>
    <p>Revisão de fontes em 22/10/2026. Orientações educativas para adultos. Os modelos de refeições e porções são exemplos a revisar, não dietas validadas por dose.</p>
    <ul>{sourceLinks.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a></li>)}</ul>
    <p>Tirzepatida e semaglutida têm esquemas diferentes. Não há conversão de doses aqui. Metas e adaptações devem considerar o histórico clínico, inclusive condições renais, restrições de líquidos e risco de hipoglicemia.</p>
  </details>;
}
export function NutritionAlert() {
  return <details className="nt-alert"><summary>Quando procurar atendimento</summary><p>Dor abdominal intensa e persistente, vômitos repetidos, incapacidade de manter líquidos, pouca urina ou desmaio exigem atendimento rapidamente. Não trate esses sinais apenas trocando o cardápio.</p></details>;
}
