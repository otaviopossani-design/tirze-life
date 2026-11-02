import { useEffect, useState } from 'react';
import { type DimensionValue, View, Text, TextInput, Pressable, ScrollView, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../src/store/useAppStore';
import { RealLifeModeModal, eventLabels } from '../src/components/RealLifeModeModal';
import { DOSES } from '../src/domain/models';
import { INJECTION_SITES, type InjectionSite } from '../src/utils/pharmacokinetics';

const siteNames: Record<InjectionSite, string> = {
  ABD_SUP_DIR: 'Abdômen superior direito', ABD_INF_DIR: 'Abdômen inferior direito',
  ABD_SUP_ESQ: 'Abdômen superior esquerdo', ABD_INF_ESQ: 'Abdômen inferior esquerdo',
  COXA_DIR: 'Coxa direita', COXA_ESQ: 'Coxa esquerda', BRACO_DIR: 'Braço direito', BRACO_ESQ: 'Braço esquerdo',
};
function Button({ title, onPress, secondary = false, disabled = false }: {
  title: string; onPress: () => void; secondary?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" onPress={onPress} disabled={disabled}
    style={[s.button, secondary && s.secondary, disabled && { opacity: .45 }]}>
    <Text style={[s.buttonText, secondary && { color: '#275747' }]}>{title}</Text>
  </Pressable>;
}
function Field({ label, value, onChange, numeric = false }: {
  label: string; value: string; onChange: (value: string) => void; numeric?: boolean;
}) {
  return <View style={{ flexGrow: 1, minWidth: 140, gap: 6 }}>
    <Text style={s.label}>{label}</Text>
    <TextInput accessibilityLabel={label} style={s.input} value={value} onChangeText={onChange}
      keyboardType={numeric ? 'decimal-pad' : 'default'} autoCapitalize="none" />
  </View>;
}
function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: value }} onPress={() => onChange(!value)}
    style={s.check}><Text style={s.body}>{value ? '☑' : '☐'} {label}</Text></Pressable>;
}

export default function Preview() {
  const state = useAppStore();
  const { width } = useWindowDimensions();
  const [now, setNow] = useState(new Date());
  const [modal, setModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInjection, setShowInjection] = useState(false);
  const [api, setApi] = useState('Conectando');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState(state.profile?.fullName ?? '');
  const [weight, setWeight] = useState(String(state.profile?.currentWeightKg ?? 80));
  const [target, setTarget] = useState(String(state.profile?.targetWeightKg ?? 70));
  const [height, setHeight] = useState(String(state.profile?.heightCm ?? 170));
  const [dose, setDose] = useState(state.profile?.currentDoseMg ?? 2.5);
  const [lowFat, setLowFat] = useState(state.profile?.hasLowThighFat ?? true);
  const [restricted, setRestricted] = useState(state.profile?.hasFluidRestriction ?? false);
  const [prescribed, setPrescribed] = useState(false);
  const [site, setSite] = useState<InjectionSite>('ABD_SUP_DIR');
  const [at, setAt] = useState(new Date().toISOString());
  const [injectionConfirmed, setInjectionConfirmed] = useState(false);
  const [distance, setDistance] = useState(false);
  const [heartburn, setHeartburn] = useState('1');
  const [bloating, setBloating] = useState('1');
  const [confirmClear, setConfirmClear] = useState(false);
  useEffect(() => {
    const update = () => setNow(new Date());
    const unsubscribe = useAppStore.persist.onFinishHydration(update);
    const timer = setInterval(update, 30_000);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    fetch((process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8010') + '/health', { signal: controller.signal })
      .then(response => setApi(response.ok ? 'API conectada' : 'API indisponível'))
      .catch(() => setApi('API indisponível')).finally(() => clearTimeout(timeout));
    return () => { unsubscribe(); clearInterval(timer); clearTimeout(timeout); controller.abort(); };
  }, []);
  const summary = state.getDailySummary(now);
  const cycle = state.getCycleStatus(now);
  const attempt = (action: () => void, message: string) => {
    try { action(); setNotice(message); setNow(new Date()); } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Confira os campos.');
    }
  };
  const saveProfile = () => attempt(() => {
    state.updateProfile({
      fullName: name, medication: 'TIRZEPATIDE', currentWeightKg: Number(weight.replace(',', '.')),
      targetWeightKg: Number(target.replace(',', '.')), heightCm: Number(height),
      currentDoseMg: dose, preferredInjectionDay: 0, preferredInjectionTime: '09:00',
      hasLowThighFat: lowFat, hasFluidRestriction: restricted, timeZone: 'America/Sao_Paulo',
    }, prescribed);
    setShowProfile(false); setPrescribed(false);
  }, 'Perfil salvo. Vamos no seu ritmo.');
  const exportData = () => {
    if (Platform.OS === 'web') {
      const blob = new Blob([state.exportData()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'tirze-life.json'; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  };
  return <SafeAreaView style={s.safe}>
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.top}>
        <View style={s.brand}><View style={s.logo}><Text style={s.logoText}>t.</Text></View>
          <Text style={s.brandName}>tirze-life</Text></View>
        <View style={s.status}><View style={[s.dot, api !== 'API conectada' && { backgroundColor: '#af9667' }]} />
          <Text style={s.statusText}>{api}</Text></View>
      </View>
      <View style={s.hero}>
        <Text style={s.eyebrow}>SEU COMPANHEIRO DE ROTINA</Text>
        <Text style={[s.title, width < 600 && { fontSize: 37, lineHeight: 44 }]}>
          Seu cuidado cabe{ '\n' }na vida real.
        </Text>
        <Text style={s.subtitle}>{state.profile ? 'Olá, ' + state.profile.fullName + '. ' : ''}
          Um dia de cada vez. Mais escuta, menos cobrança.</Text>
      </View>
      <View style={s.previewNote}>
        <Text style={s.note}>PRÉVIA LOCAL · ETAPAS 1 E 2</Text>
        <Text style={s.body}>{Platform.OS === 'web'
          ? 'Seus registros ficam nesta sessão e são apagados ao recarregar a página. Use dados fictícios para experimentar.'
          : 'Seus registros ficam criptografados neste dispositivo.'}</Text>
      </View>
      {!state.hydrated && <Text style={s.feedback}>Aguardando leitura segura do histórico local. Se não concluir, mantenha os dados e verifique o armazenamento.</Text>}
      {!!notice && <Text accessibilityRole="alert" style={s.feedback}>{notice}</Text>}
      {(!state.profile || showProfile) && <View style={s.card}>
        <Text style={s.cardTitle}>Comece pelo seu perfil</Text>
        <Text style={s.body}>Esta primeira versão calcula apenas tirzepatida. Informe a dose prescrita, sem alterá-la com base no app.</Text>
        <Field label="Como prefere ser chamado(a)?" value={name} onChange={setName} />
        <View style={s.row}>
          <Field label="Peso atual (kg)" value={weight} onChange={setWeight} numeric />
          <Field label="Peso de referência / meta (kg)" value={target} onChange={setTarget} numeric />
          <Field label="Altura (cm)" value={height} onChange={setHeight} numeric />
        </View>
        <Text style={s.label}>Dose prescrita de tirzepatida</Text>
        <View style={s.row}>{DOSES.map(value => <Button key={value} title={value + ' mg'} secondary={dose !== value} onPress={() => setDose(value)} />)}</View>
        <Check label="Tenho pouca gordura subcutânea nas coxas." value={lowFat} onChange={setLowFat} />
        <Check label="Tenho orientação para restringir líquidos." value={restricted} onChange={setRestricted} />
        <Check label="Esta dosagem foi prescrita pelo meu médico." value={prescribed} onChange={setPrescribed} />
        <Button title="Salvar meu perfil" onPress={saveProfile} disabled={!state.hydrated} />
      </View>}
      <View style={[s.columns, width < 850 && { flexDirection: 'column' }]}>
        <View style={[s.cycleCard, { flex: 1.1 }]}>
          <Text style={s.darkEyebrow}>SEU CICLO, COM CONTEXTO</Text>
          <Text style={s.cycleTitle}>{cycle.phaseTitle}</Text>
          <View style={s.metricRow}><Text style={s.cycleNumber}>{cycle.estimatedActiveMg.toFixed(2).replace('.', ',')}</Text>
            <Text style={s.cycleUnit}>mg{ '\n' }estimados</Text></View>
          <Text style={s.darkBody}>{cycle.digestiveAdvice}</Text>
          <Text style={s.darkNote}>{cycle.hoursSinceLastInjection === null ? 'Nenhuma aplicação registrada.'
            : Math.floor(cycle.hoursSinceLastInjection) + ' horas desde a última aplicação.'}</Text>
          <View style={s.divider} />
          <Text style={s.darkNote}>Modelo educacional de absorção e meia-vida de 120h. Não é uma medição sanguínea e não orienta dose.</Text>
          <Button title="+ Registrar aplicação" secondary disabled={!state.profile} onPress={() => setShowInjection(!showInjection)} />
        </View>
        <View style={{ flex: 1, gap: 16 }}>
          <View style={s.waterCard}>
            <Text style={s.eyebrow}>ÁGUA, AOS POUCOS</Text>
            <Text style={s.metric}>{summary.waterMl.toLocaleString('pt-BR')} <Text style={s.unit}>ml registrados</Text></Text>
            <Text style={s.body}>{summary.dynamicWaterGoalMl === null ? 'Meta automática ainda não definida ou suspensa.'
              : 'Referência do dia: ' + summary.dynamicWaterGoalMl.toLocaleString('pt-BR') + ' ml'}</Text>
            <View style={s.track}><View style={[s.progress, { width: (summary.dynamicWaterGoalMl ? Math.min(100, summary.waterMl / summary.dynamicWaterGoalMl * 100) : 0) + '%' as DimensionValue }]} /></View>
            <Text style={s.note}>Base + ajustes de hoje: +{summary.extraWaterMl} ml</Text>
            <Button title="+ 250 ml de água" secondary disabled={!state.profile}
              onPress={() => attempt(() => state.addWater(250), 'Água registrada.')} />
          </View>
          <View style={s.proteinCard}>
            <Text style={s.eyebrow}>NUTRIÇÃO QUE SUSTENTA</Text>
            <Text style={s.metric}>{summary.proteinG} <Text style={s.unit}>g de proteína</Text></Text>
            <Text style={s.body}>Referência mínima do projeto: {summary.proteinGoalG} g / dia</Text>
            <Button title="+ 24 g de proteína" secondary disabled={!state.profile}
              onPress={() => attempt(() => state.addProtein(24), 'Proteína registrada.')} />
          </View>
        </View>
      </View>
      {showInjection && <View style={s.card}>
        <Text style={s.cardTitle}>Registrar uma aplicação realizada</Text>
        <Text style={s.body}>O registro descreve o que já aconteceu. A dose do perfil só muda em “Editar perfil”.</Text>
        <Field label="Data e hora ISO com fuso" value={at} onChange={setAt} />
        <Text style={s.label}>Dose aplicada</Text>
        <View style={s.row}>{DOSES.map(value => <Button key={value} title={value + ' mg'} secondary={dose !== value} onPress={() => setDose(value)} />)}</View>
        <Text style={s.label}>Local utilizado</Text>
        <View style={s.row}>{INJECTION_SITES.map(value => <Button key={value} title={siteNames[value]} secondary={site !== value} onPress={() => setSite(value)} />)}</View>
        <Text style={s.note}>Sugestões de rodízio: {state.getSiteRecommendations().recommended.map(value => siteNames[value]).join(' · ')}</Text>
        <Check label="Esta aplicação corresponde à prescrição médica." value={injectionConfirmed} onChange={setInjectionConfirmed} />
        {site.startsWith('ABD_') && <Check label="Confirmei a orientação abdominal do projeto com minha equipe (regra dos 4 dedos)." value={distance} onChange={setDistance} />}
        <Button title="Salvar aplicação" onPress={() => attempt(() => {
          state.addInjection({ doseMg: dose, site, appliedAt: at, doctorPrescribedConfirmed: injectionConfirmed, fourFingersRuleConfirmed: distance });
          setShowInjection(false); setInjectionConfirmed(false); setDistance(false);
        }, 'Aplicação registrada. Estimativa atualizada.')} />
      </View>}
      <View style={s.lifeCard}>
        <View style={{ flex: 1, gap: 8 }}>
          <Text style={s.eyebrow}>MODO VIDA REAL</Text><Text style={s.cardTitle}>Seu momento também faz parte.</Text>
          <Text style={s.body}>Um encontro, uma bebida, uma refeição diferente.{ '\n' }Registre, observe e siga em frente com gentileza.</Text>
        </View>
        <Button title="+ Registrar meu momento" disabled={!state.profile} onPress={() => setModal(true)} />
      </View>
      {state.profile && <View style={s.card}>
        <Text style={s.cardTitle}>Como está seu conforto digestivo?</Text>
        <Text style={s.body}>De 1 (mínimo) a 5 (intenso). A análise considera os registros das últimas 48 horas.</Text>
        <View style={s.row}><Field label="Azia (1 a 5)" value={heartburn} onChange={setHeartburn} numeric />
          <Field label="Estufamento (1 a 5)" value={bloating} onChange={setBloating} numeric /></View>
        <Button title="Registrar como me sinto" secondary onPress={() => attempt(() => state.addSymptom({
          heartburnLevel: Number(heartburn), bloatingLevel: Number(bloating), loggedAt: new Date().toISOString(),
        }), 'Seu conforto foi registrado.')} />
      </View>}
      <View style={s.card}>
        <Text style={s.cardTitle}>Seu histórico, sem julgamentos</Text>
        {!state.injections.length && !state.realLifeEvents.length && <Text style={s.body}>Seus próximos registros aparecem aqui.</Text>}
        {[...state.realLifeEvents].reverse().map(event => <View key={event.id} style={s.history}>
          <View style={{ flex: 1, gap: 5 }}><Text style={s.label}>{eventLabels[event.eventType]} · {event.quantity} unidade(s)</Text>
            <Text style={s.note}>{new Date(event.loggedAt).toLocaleString('pt-BR')} · +{event.result.waterAdjustmentMl} ml</Text>
            <Text style={s.body}>{event.result.message}</Text></View>
          <Button title="Remover evento" secondary onPress={() => state.deleteRealLifeEvent(event.id)} />
        </View>)}
        {state.injections.map(injection => <View key={injection.id} style={s.history}>
          <View style={{ flex: 1 }}><Text style={s.label}>Aplicação · {injection.doseMg} mg</Text>
            <Text style={s.note}>{new Date(injection.appliedAt).toLocaleString('pt-BR')} · {siteNames[injection.site]}</Text></View>
          <Button title="Remover aplicação" secondary onPress={() => state.deleteInjection(injection.id)} />
        </View>)}
      </View>
      <View style={s.footer}>
        <Text style={s.note}>Um apoio à sua rotina. Metas e orientações precisam respeitar seu cuidado individual.</Text>
        <View style={s.row}>
          {state.profile && <Button title="Editar perfil" secondary onPress={() => {
            setName(state.profile!.fullName); setWeight(String(state.profile!.currentWeightKg));
            setTarget(String(state.profile!.targetWeightKg)); setHeight(String(state.profile!.heightCm));
            setDose(state.profile!.currentDoseMg); setLowFat(state.profile!.hasLowThighFat);
            setRestricted(state.profile!.hasFluidRestriction); setShowProfile(!showProfile);
          }} />}
          {Platform.OS === 'web' && <Button title="Exportar meus dados" secondary onPress={exportData} />}
          <Button title={confirmClear ? 'Confirmar exclusão dos dados locais' : 'Apagar dados locais'} secondary onPress={() => {
            if (!confirmClear) { setConfirmClear(true); return; }
            void state.clearAllData().then(() => {
              setConfirmClear(false); setNotice('Dados locais apagados.'); setName('');
            }).catch(() => setNotice('Não foi possível apagar o armazenamento. Tente novamente.'));
          }} />
          {confirmClear && <Button title="Cancelar exclusão" secondary onPress={() => setConfirmClear(false)} />}
        </View>
      </View>
      <RealLifeModeModal visible={modal} onClose={() => { setModal(false); setNow(new Date()); }} />
    </ScrollView>
  </SafeAreaView>;
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7ef' },
  page: { width: '100%', maxWidth: 1160, alignSelf: 'center', padding: 24, paddingBottom: 48, gap: 22 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  brand: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  logo: { width: 40, height: 40, borderRadius: 15, backgroundColor: '#245b4b', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#f0f3d8', fontSize: 30, fontWeight: '600' },
  brandName: { color: '#173e35', fontSize: 24, fontWeight: '600', letterSpacing: -.7 },
  status: { flexDirection: 'row', gap: 7, alignItems: 'center', backgroundColor: '#e9efe3', padding: 10, borderRadius: 20 },
  statusText: { fontSize: 12, color: '#365a49' },
  dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#58895d' },
  hero: { paddingVertical: 18, gap: 18 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: '#587060' },
  title: { fontSize: 56, lineHeight: 62, fontWeight: '600', color: '#214d3e', letterSpacing: -2 },
  subtitle: { fontSize: 17, lineHeight: 25, color: '#617368' },
  previewNote: { borderLeftWidth: 3, borderColor: '#b8c69a', paddingLeft: 16, gap: 5 },
  note: { fontSize: 12, color: '#67796d', lineHeight: 19 },
  body: { fontSize: 15, color: '#53695d', lineHeight: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#355347', lineHeight: 21 },
  card: { backgroundColor: '#fffef9', padding: 24, borderRadius: 22, borderWidth: 1, borderColor: '#e2e7da', gap: 16 },
  cardTitle: { fontSize: 23, color: '#254e3e', fontWeight: '600', letterSpacing: -.4 },
  columns: { flexDirection: 'row', gap: 20 },
  cycleCard: { backgroundColor: '#214f40', borderRadius: 26, padding: 28, gap: 18, justifyContent: 'space-between' },
  darkEyebrow: { color: '#c1d4aa', fontWeight: '600', letterSpacing: 1.5, fontSize: 11 },
  cycleTitle: { fontSize: 26, fontWeight: '500', color: '#f5f7e8' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  cycleNumber: { fontSize: 74, fontWeight: '500', letterSpacing: -3, color: '#e7efb9' },
  cycleUnit: { fontSize: 15, lineHeight: 23, color: '#d1deca' },
  darkBody: { color: '#e1e8d9', fontSize: 16, lineHeight: 26 },
  darkNote: { color: '#b7cdbe', fontSize: 12, lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#446b57' },
  waterCard: { backgroundColor: '#e8eee2', borderRadius: 22, padding: 24, gap: 14 },
  proteinCard: { backgroundColor: '#f0ecd9', borderRadius: 22, padding: 24, gap: 14 },
  metric: { fontSize: 36, color: '#234c3c', fontWeight: '600' },
  unit: { fontSize: 14, color: '#61715f', fontWeight: '400' },
  track: { height: 6, borderRadius: 5, backgroundColor: '#d4ddca', overflow: 'hidden' },
  progress: { height: '100%', borderRadius: 5, backgroundColor: '#62865e' },
  button: { backgroundColor: '#2b624d', paddingVertical: 13, paddingHorizontal: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', minHeight: 44 },
  buttonText: { color: '#fffef6', fontSize: 14, fontWeight: '600' },
  secondary: { backgroundColor: '#edf1e6', borderWidth: 1, borderColor: '#d7e1cc' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  input: { backgroundColor: '#fff', borderColor: '#d5decf', borderWidth: 1, borderRadius: 10, padding: 12, color: '#234d3c', minHeight: 46 },
  check: { paddingVertical: 8 },
  lifeCard: { backgroundColor: '#e6ebcf', borderRadius: 24, padding: 28, gap: 22 },
  history: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderColor: '#e2e7da' },
  feedback: { backgroundColor: '#eee9d7', borderRadius: 12, padding: 16, color: '#5c624b', lineHeight: 22 },
  footer: { gap: 18, paddingVertical: 16 },
});
