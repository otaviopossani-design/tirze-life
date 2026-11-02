import { beforeEach,afterEach,describe,it,expect,vi } from 'vitest';
import { ageAt,demoCareRecord,localDate,profileSchema,weeklyStats,daysAgo,type ActivityLog,type CareProfile } from '../src/domain/care';
import { readCare,saveProfile,addActivity,removeActivity,listClinicCare,careKey } from '../src/store/care-store';
describe('shared registration and movement',()=>{
 beforeEach(()=>{
  vi.useFakeTimers();vi.setSystemTime(new Date(2026,9,22,12));
  const memory=new Map<string,string>();
  vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v),key:(i:number)=>[...memory.keys()][i]??null,get length(){return memory.size;}});
  vi.stubGlobal('window',new EventTarget());
 });
 afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
 const profile=(id='TEST-B2C',channel:CareProfile['channel']='individual'):CareProfile=>({...demoCareRecord('TL-001')!.profile,id,channel});
 const log=(id='one',activity:ActivityLog['activity']='walk',date=localDate()):ActivityLog=>({id,activity,date,minutes:12,effort:'Leve',note:''});
 it('requires an adult birth date and correct metric units',()=>{
  expect(ageAt('2008-10-22')).toBe(18);expect(ageAt('2008-10-23')).toBe(17);
  for(const patch of [{birthDate:'2020-05-01'},{birthDate:'1990-02-30'},{heightCm:1.65},{weightKg:0}])expect(profileSchema.safeParse({...profile(),...patch}).success).toBe(false);
 });
 it('separates individual registrations from the clinic list',()=>{
  saveProfile(profile(),null);saveProfile(profile('TEST-CLINIC','clinic'),null);
  const ids=listClinicCare().map(r=>r.profile.id);
  expect(ids).toContain('TEST-CLINIC');expect(ids).not.toContain('TEST-B2C');expect(ids).toHaveLength(9);
 });
 it('keeps a daily weight history without inventing a measurement when unchanged',()=>{
  const first=saveProfile(profile(),null);
  const second=saveProfile({...first.profile,weightKg:81.5},first.savedAt);
  expect(second.weights).toEqual([{date:localDate(),kg:81.5}]);
  vi.setSystemTime(new Date(2026,9,23,12));
  const third=saveProfile(second.profile,second.savedAt);expect(third.weights).toHaveLength(1);
  const fourth=saveProfile({...third.profile,weightKg:81.2},third.savedAt);
  expect(fourth.weights).toHaveLength(2);
 });
 it('preserves concurrent activity logs and prevents stale profile overwrites',()=>{
  const first=saveProfile(profile(),null);addActivity(first.profile.id,log());
  expect(()=>saveProfile({...first.profile,name:'Changed'},first.savedAt)).toThrow('outra aba');
  addActivity(first.profile.id,log('two','chair'));
  expect(readCare(first.profile.id)!.logs).toHaveLength(2);
  expect(readCare('TEST-OTHER')).toBeNull();
  removeActivity(first.profile.id,'one');expect(readCare(first.profile.id)!.logs[0]!.id).toBe('two');
 });
 it('counts distinct strength days, excluding last week and future entries',()=>{
  const stats=weeklyStats([log('a','chair'),log('b','wall'),log('c','walk'),log('d','mobility'),log('old','chair',daysAgo(8)),log('future','walk','2026-10-23')]);
  expect(stats).toEqual({minutes:48,days:1,strengthDays:1});
 });
 it('rejects invalid activity times and dates without altering saved data',()=>{
  saveProfile(profile(),null);
  for(const patch of [{minutes:0},{minutes:1.5},{date:'2026-10-23'},{date:'2025-01-01'}])expect(()=>addActivity('TEST-B2C',{...log(),...patch})).toThrow();
  expect(readCare('TEST-B2C')!.logs).toHaveLength(0);
 });
 it('keeps old recorded activities readable after more than one year',()=>{
  saveProfile(profile(),null);addActivity('TEST-B2C',log());
  vi.setSystemTime(new Date(2028,9,22,12));expect(readCare('TEST-B2C')!.logs).toHaveLength(1);
 });
 it('rejects mismatched identities and refuses to overwrite corrupt storage',()=>{
  const record=saveProfile(profile(),null);
  localStorage.setItem(careKey('TEST-OTHER'),JSON.stringify(record));
  expect(()=>readCare('TEST-OTHER')).toThrow('outra pessoa');
  localStorage.setItem(careKey('TEST-B2C'),'{');
  expect(()=>saveProfile(profile(),null)).toThrow();
  expect(localStorage.getItem(careKey('TEST-B2C'))).toBe('{');
 });
 it('does not report success when storage is unavailable',()=>{
  vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{throw Error('quota');}});
  expect(()=>saveProfile(profile(),null)).toThrow('Não foi possível salvar');
 });
});
