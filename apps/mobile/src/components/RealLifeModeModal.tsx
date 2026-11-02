import { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { EVENT_TYPES, type RealLifeEvent, type LifeEventResult } from '../domain/models';

export const eventLabels: Record<RealLifeEvent['eventType'], string> = {
  ALCOOL_CERVEJA: 'Cerveja / álcool', BEBIDA_COM_GAS: 'Bebida com gás',
  FRITURA_GORDURA: 'Fritura / gordura', DOCE: 'Doce', REFEICAO_LIVRE: 'Refeição livre',
};
export function RealLifeModeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [type, setType] = useState<RealLifeEvent['eventType']>('ALCOOL_CERVEJA');
  const [quantity, setQuantity] = useState(1);
  const [satiety, setSatiety] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<LifeEventResult | null>(null);
  const save = async () => {
    setBusy(true); setError('');
    try {
      setResult(await useAppStore.getState().logRealLifeEvent({
        eventType: type, quantity, stoppedBySatiety: satiety, loggedAt: new Date().toISOString(),
      }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível registrar agora.');
    } finally { setBusy(false); }
  };
  const close = () => {
    if (busy) return;
    setResult(null); setError(''); setQuantity(1); onClose();
  };
  return <Modal visible={visible} animationType="fade" transparent onRequestClose={close}>
    <View style={s.backdrop}><ScrollView contentContainerStyle={s.center}>
      <View style={s.sheet}>
        <Text style={s.eyebrow}>MODO VIDA REAL</Text>
        <Text style={s.title}>A vida acontece.{ '\n' }Você segue cuidando de si.</Text>
        <Text style={s.body}>Um registro para entender sua rotina, sem notas e sem culpa.</Text>
        {result ? <>
          <View style={s.feedback}>
            <Text style={s.feedbackTitle}>{result.message}</Text>
            <Text style={s.body}>Referência de água do dia: {result.dynamicWaterGoalMl === null
              ? 'ajuste suspenso por restrição de líquidos' : result.dynamicWaterGoalMl + ' ml'}</Text>
            {result.guidance.map(text => <Text key={text} style={s.body}>• {text}</Text>)}
          </View>
          <Text style={s.note}>{result.modelNotice}</Text>
          <Pressable accessibilityRole="button" style={s.primary} onPress={close}><Text style={s.white}>Concluir</Text></Pressable>
        </> : <>
          <Text style={s.label}>O que fez parte do seu momento?</Text>
          <View style={s.wrap}>{EVENT_TYPES.map(item => <Pressable accessibilityRole="button"
            accessibilityState={{ selected: item === type }} key={item}
            onPress={() => setType(item)} disabled={busy} style={[s.chip, item === type && s.selected]}>
            <Text style={{ color: item === type ? '#fff' : '#254e46' }}>{eventLabels[item]}</Text>
          </Pressable>)}</View>
          <Text style={s.label}>Quantidade {type === 'ALCOOL_CERVEJA' ? '(latas / copos)' : '(porções)'}</Text>
          <View style={s.counter}>
            <Pressable accessibilityRole="button" accessibilityLabel="Diminuir quantidade" style={s.step}
              disabled={busy || quantity <= 1} onPress={() => setQuantity(value => Math.max(1, value - 1))}><Text>−</Text></Pressable>
            <Text style={s.quantity}>{quantity}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Aumentar quantidade" style={s.step}
              disabled={busy || quantity >= 100} onPress={() => setQuantity(value => Math.min(100, value + 1))}><Text>+</Text></Pressable>
          </View>
          <Text style={s.label}>Como você percebeu esse momento?</Text>
          {[true, false].map(value => <Pressable key={String(value)} accessibilityRole="radio"
            accessibilityState={{ checked: satiety === value }} disabled={busy} onPress={() => setSatiety(value)}
            style={[s.choice, satiety === value && s.choiceSelected]}>
            <Text style={s.body}>{satiety === value ? '◉' : '○'} {value
              ? 'Era vontade e parei quando me senti saciado(a).' : 'Percebi impulso ou ansiedade.'}</Text>
          </Pressable>)}
          {!!error && <Text accessibilityRole="alert" style={s.error}>{error}</Text>}
          <Pressable accessibilityRole="button" disabled={busy} style={[s.primary, busy && { opacity: .6 }]} onPress={save}>
            <Text style={s.white}>{busy ? 'Cuidando do seu registro…' : 'Registrar meu momento'}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={busy} onPress={close} style={s.cancel}><Text>Voltar</Text></Pressable>
        </>}
      </View>
    </ScrollView></View>
  </Modal>;
}
const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(18,43,38,.55)' },
  center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: { backgroundColor: '#fffdf8', padding: 28, borderRadius: 28, width: '100%', maxWidth: 580, gap: 14 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 2, color: '#55746b' },
  title: { fontSize: 29, color: '#173e35', fontWeight: '600', lineHeight: 36 },
  body: { color: '#405c53', fontSize: 15, lineHeight: 23 },
  label: { fontSize: 14, fontWeight: '600', color: '#173e35', marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { padding: 12, borderRadius: 20, borderWidth: 1, borderColor: '#cfdcd6' },
  selected: { backgroundColor: '#245b4b', borderColor: '#245b4b' },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 24 },
  step: { backgroundColor: '#e9efe8', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  quantity: { fontSize: 24, fontWeight: '600', color: '#173e35' },
  choice: { padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#dde4da' },
  choiceSelected: { backgroundColor: '#eef3df', borderColor: '#93aa70' },
  primary: { backgroundColor: '#245b4b', borderRadius: 14, padding: 17, alignItems: 'center', marginTop: 8 },
  white: { color: '#fff', fontWeight: '600', fontSize: 15 },
  cancel: { padding: 12, alignItems: 'center' },
  feedback: { backgroundColor: '#edf3e6', padding: 18, borderRadius: 16, gap: 12 },
  feedbackTitle: { color: '#214d3e', fontSize: 18, fontWeight: '600', lineHeight: 26 },
  note: { fontSize: 12, color: '#637369', lineHeight: 18 },
  error: { backgroundColor: '#f1e7d2', color: '#675333', padding: 14, borderRadius: 12 },
});
