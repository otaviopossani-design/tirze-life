import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppStore } from '../store/useAppStore';

export default function DashboardScreen() {
  const getCycleStatus = useAppStore((state) => state.getCycleStatus);
  const getSiteRecommendations = useAppStore((state) => state.getSiteRecommendations);
  const profile = useAppStore((state) => state.profile);
  const todayWaterMl = useAppStore((state) => state.todayWaterMl);
  const todayProteinG = useAppStore((state) => state.todayProteinG);

  const status = getCycleStatus();
  const siteRecs = getSiteRecommendations();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {profile.fullName}!</Text>
        <Text style={styles.subGreeting}>Tratamento seguro, eficaz e sem culpa.</Text>
      </View>

      <View style={[styles.card, status.isPeakWindow && styles.peakCardHighlight]}>
        <Text style={styles.cardTitle}>Concentração Ativa Estimada</Text>
        <Text style={styles.bigNumber}>{status.estimatedActiveMg} mg</Text>
        
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⚡ {status.phaseTitle}</Text>
        </View>

        <Text style={styles.cardFooter}>{status.digestiveAdvice}</Text>
      </View>

      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>💧 Hidratação</Text>
          <Text style={styles.metricValue}>{todayWaterMl} ml</Text>
          <Text style={styles.metricGoal}>Meta Dinâmica: {profile.baseWaterGoalMl} ml</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>🥩 Proteína (Massa)</Text>
          <Text style={styles.metricValue}>{todayProteinG} g</Text>
          <Text style={styles.metricGoal}>Piso Mínimo: {profile.dailyProteinGoalG}g</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mapa Anatômico & Rodízio</Text>
        <Text style={styles.bodyDescription}>{siteRecs.ruleReminder}</Text>

        <View style={styles.bodyMapMock}>
          <Text style={styles.mapLabel}>🟢 Recomendado: {siteRecs.recommended.join(', ')}</Text>
          <Text style={styles.mapLabelDisabled}>🔒 Bloqueados / Descanso: {siteRecs.blocked.join(', ')}</Text>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Registrar Injeção ou Evento Social</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 20 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  subGreeting: { fontSize: 14, color: '#94A3B8' },
  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#334155' },
  peakCardHighlight: { borderColor: '#38BDF8', backgroundColor: '#1E293B' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#F8FAFC', marginBottom: 8 },
  bigNumber: { fontSize: 36, fontWeight: 'bold', color: '#38BDF8', marginVertical: 4 },
  badgeContainer: { backgroundColor: '#0369A1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginVertical: 8 },
  badgeText: { color: '#E0F2FE', fontSize: 12, fontWeight: '500' },
  cardFooter: { fontSize: 12, color: '#94A3B8', marginTop: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfCard: { flex: 0.48 },
  metricValue: { fontSize: 24, fontWeight: 'bold', color: '#34D399', marginVertical: 4 },
  metricGoal: { fontSize: 12, color: '#94A3B8' },
  bodyDescription: { fontSize: 13, color: '#94A3B8', marginBottom: 12 },
  bodyMapMock: { backgroundColor: '#0F172A', padding: 12, borderRadius: 8, marginBottom: 16 },
  mapLabel: { color: '#34D399', fontSize: 13, marginVertical: 2 },
  mapLabelDisabled: { color: '#F87171', fontSize: 13, marginVertical: 2 },
  actionButton: { backgroundColor: '#0284C7', padding: 14, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});