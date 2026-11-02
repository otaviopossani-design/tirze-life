import { useEffect,useState } from 'react';
import { ageAt,localDate,type CareProfile,type CareRecord } from '../domain/care';
import { saveProfile,useCare } from '../store/care-store';
import './care.css';
const num=(value:number)=>value.toLocaleString('pt-BR',{maximumFractionDigits:1});
export function ProfileForm({id,channel,initial,initialName='',initialMedication='Não informado',onSaved,onCancel,onDirty}:{id:string;channel:CareProfile['channel'];initial?:CareRecord|null;initialName?:string;initialMedication?:string;onSaved:(r:CareRecord)=>void;onCancel?:()=>void;onDirty?:(dirty:boolean)=>void}) {
 const [form,setForm]=useState({name:initial?.profile.name??initialName,birthDate:initial?.profile.birthDate??'',email:initial?.profile.email??'',phone:initial?.profile.phone??'',heightCm:String(initial?.profile.heightCm??''),weightKg:String(initial?.profile.weightKg??''),goal:initial?.profile.goal??'Saúde e disposição',level:initial?.profile.level??'Começando agora',medication:initial?.profile.medication??initialMedication,limitations:initial?.profile.limitations??'',conditions:initial?.profile.conditions??''});
 const [expectedSavedAt]=useState(initial?.savedAt??null);
 const [dirty,setDirty]=useState(false),[error,setError]=useState('');
 useEffect(()=>{onDirty?.(dirty);},[dirty,onDirty]);
 useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty]);
 function set(key:keyof typeof form,value:string){setForm(f=>({...f,[key]:value}));setDirty(true);setError('');}
 function submit(e:React.FormEvent){e.preventDefault();try{
  const record=saveProfile({...form,id,channel,heightCm:Number(form.heightCm.replace(',','.')),weightKg:Number(form.weightKg.replace(',','.'))} as CareProfile,expectedSavedAt);
  setDirty(false);onDirty?.(false);onSaved(record);
 }catch(e){setError(e instanceof Error?e.message:'Não foi possível salvar.');}}
 return <form className="care-form" onSubmit={submit}>
  <p>Dados básicos para acompanhar sua rotina. Campos com * são obrigatórios. Nesta demonstração, use dados fictícios de adultos.</p>
  <div className="care-fields">
   <label className="tl-field care-span">Nome completo *<input aria-label="Nome completo" required maxLength={100} value={form.name} onChange={e=>set('name',e.target.value)} autoComplete="name"/></label>
   <label className="tl-field">Data de nascimento *<input aria-label="Data de nascimento" type="date" required max={localDate()} value={form.birthDate} onChange={e=>set('birthDate',e.target.value)}/></label>
   <label className="tl-field">E-mail (opcional)<input aria-label="E-mail" type="email" maxLength={150} value={form.email} onChange={e=>set('email',e.target.value)} autoComplete="email"/></label>
   <label className="tl-field">Telefone (opcional)<input aria-label="Telefone" type="tel" maxLength={30} value={form.phone} onChange={e=>set('phone',e.target.value)} autoComplete="tel"/></label>
   <label className="tl-field">Altura em centímetros *<input aria-label="Altura em centímetros" inputMode="decimal" required placeholder="Ex.: 165" value={form.heightCm} onChange={e=>set('heightCm',e.target.value)}/></label>
   <label className="tl-field">Peso atual em quilos *<input aria-label="Peso atual em quilos" inputMode="decimal" required placeholder="Ex.: 82,4" value={form.weightKg} onChange={e=>set('weightKg',e.target.value)}/></label>
   <label className="tl-field">Objetivo<select aria-label="Objetivo" value={form.goal} onChange={e=>set('goal',e.target.value)}>{['Saúde e disposição','Perda de peso acompanhada','Manutenção do peso'].map(v=><option key={v}>{v}</option>)}</select></label>
   <label className="tl-field">Rotina de atividade física<select aria-label="Rotina de atividade física" value={form.level} onChange={e=>set('level',e.target.value)}>{['Começando agora','Às vezes','Regularmente'].map(v=><option key={v}>{v}</option>)}</select></label>
   <label className="tl-field">Medicação informada<select aria-label="Medicação informada" value={form.medication} onChange={e=>set('medication',e.target.value)}>{['Não informado','Não utilizo','Tirzepatida','Retatrutida','CagriSema','Glow / GHK-Cu','Semaglutida','Liraglutida','Outro'].map(v=><option key={v}>{v}</option>)}</select></label>
   <label className="tl-field care-span">Dores, limitações ou dificuldade de equilíbrio (opcional)<textarea aria-label="Limitações" rows={2} maxLength={1500} value={form.limitations} onChange={e=>set('limitations',e.target.value)} placeholder="O que precisa ser considerado nas atividades?"/></label>
   <label className="tl-field care-span">Condições de saúde e cuidados orientados (opcional)<textarea aria-label="Condições de saúde" rows={2} maxLength={1500} value={form.conditions} onChange={e=>set('conditions',e.target.value)} placeholder="Informações para conversar com a equipe, sem avaliação automática."/></label>
  </div>
  <p className="care-note">{channel==='clinic'?'Cadastro vinculado à clínica de demonstração.':'Cadastro individual, sem vínculo automático com uma clínica.'} Dados ficam neste navegador; não cria login nem envia convites.</p>
  {error&&<p role="alert" className="care-error">{error}</p>}
  <div className="care-actions"><button className="tl-primary" type="submit">{initial?'Salvar cadastro':'Concluir cadastro'}</button>{onCancel&&<button className="tl-outline" type="button" onClick={()=>{onDirty?.(false);onCancel();}}>Cancelar edição</button>}</div>
 </form>;
}
export default function CareProfilePanel({patientId,channel='individual',initialName,initialMedication,onSaved,onDirty}:{patientId:string;channel?:CareProfile['channel'];initialName?:string;initialMedication?:string;onSaved?:(r:CareRecord)=>void;onDirty?:(dirty:boolean)=>void}) {
 const {record,error}=useCare(patientId),[editing,setEditing]=useState(false),[message,setMessage]=useState('');
 const [newId]=useState(()=> 'B2C-'+crypto.randomUUID());
 if(error)return <p className="care-error" role="alert">{error}</p>;
 return <section className="tl-card care-profile">
  <span className="tl-kicker">SEU PONTO DE PARTIDA</span><h2>{record?'Cadastro e medidas':'Vamos começar pelo seu cadastro'}</h2>
  {record&&!editing?<><div className="care-person"><div><h3>{record.profile.name}</h3><p>{ageAt(record.profile.birthDate)} anos · {record.profile.channel==='clinic'?'Acompanhamento pela clínica':'Jornada individual'}</p></div><button className="tl-outline" onClick={()=>{setEditing(true);setMessage('');}}>Editar cadastro</button></div>
   <div className="care-stats"><div><strong>{num(record.profile.heightCm)}<small> cm</small></strong><span>Altura informada</span></div><div><strong>{num(record.profile.weightKg)}<small> kg</small></strong><span>Peso informado</span></div><div><strong>{record.weights.length}</strong><span>Registros de peso</span></div></div>
   <dl className="care-facts"><div><dt>Objetivo</dt><dd>{record.profile.goal}</dd></div><div><dt>Atividade física</dt><dd>{record.profile.level}</dd></div><div><dt>Medicação informada</dt><dd>{record.profile.medication}</dd></div><div><dt>Contato</dt><dd>{[record.profile.email,record.profile.phone].filter(Boolean).join(' · ')||'Não informado'}</dd></div><div><dt>Limitações</dt><dd>{record.profile.limitations||'Não informadas'}</dd></div><div><dt>Condições e cuidados</dt><dd>{record.profile.conditions||'Não informados'}</dd></div></dl>
   <p className="care-note">Atualize o peso em “Editar cadastro”. O histórico guarda uma medida por dia; correções no mesmo dia substituem essa medida.</p>
   <WeightHistory record={record}/>
   {record.profile.channel==='clinic'&&<a className="care-link" href={'/?paciente='+encodeURIComponent(patientId)+'&view=activity'} target="_blank" rel="noreferrer">Abrir movimento no app deste paciente ↗</a>}
  </>:<ProfileForm id={patientId||newId} channel={record?.profile.channel??channel} initial={record} initialName={initialName} initialMedication={initialMedication} onDirty={onDirty} onCancel={record?()=>setEditing(false):undefined} onSaved={r=>{setEditing(false);setMessage('Cadastro salvo neste navegador.');onSaved?.(r);}}/>}
  {message&&<p className="care-success" role="status">{message}</p>}
 </section>;
}
export function WeightHistory({record}:{record:CareRecord}) {
 return <div className="care-history"><h3>Histórico de peso</h3><p>O peso isolado não informa quanto de músculo foi preservado. Força, alimentação e avaliação profissional também importam.</p><div className="care-table-wrap"><table><thead><tr><th>Data</th><th>Peso informado</th></tr></thead><tbody>{[...record.weights].sort((a,b)=>b.date.localeCompare(a.date)).map(w=><tr key={w.date}><td>{w.date.split('-').reverse().join('/')}</td><td>{num(w.kg)} kg</td></tr>)}</tbody></table></div></div>;
}
export function CareProgress({patientId}:{patientId:string}) {
 const {record,error}=useCare(patientId);
 return <section className="tl-card care-profile"><span className="tl-kicker">UMA VISÃO MAIS AMPLA</span><h2>Sua evolução é feita de muitos cuidados.</h2>{error?<p role="alert">{error}</p>:record?<WeightHistory record={record}/>:<p>Complete o cadastro para começar seu histórico de medidas.</p>}</section>;
}
