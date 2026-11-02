import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { calculateActiveTirzepatide, InjectionRecord } from '../utils/pharmacokinetics';

// Exemplo de dados simulados do usuário logado
const mockInjections: InjectionRecord[] = [
  { id: '1', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), doseMg: 2.5 } // Aplicado há 4 dias
];

const allowThigh = false; // Configuração do perfil: se falso, bloqueia as coxas por falta de gordura

export default function DashboardScreen() {
  const status = calculateActiveTirzepatide(mockInjections);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Cabeçalho de Boas-Vindas */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, Luiz!</Text>
        <Text style={styles.subGreeting}>Tratamento seguro e sem culpa.</Text>
      </View>

      {/* Card Principal: Farmacocinética & Pico da Droga */}
      <View style={[styles.card, status.isPeakWindow && styles.peakCardHighlight]}>
        <Text style={styles.cardTitle}>Concentração Ativa no Sangue</Text>
        <Text style={styles.bigNumber}>{status.activeConcentrationMg} mg</Text>
        
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>
            {status.isPeakWindow 
              ? '⚡ Janela de Pico (Estômago mais lento)' 
              : '🌱 Nível estável de manutenção'}
          </Text>
        </View>

        <Text style={styles.cardFooter}>
          {status.daysSinceInjection} dias desde a última injeção de 2.5mg
        </Text>
      </View>

      {/* Seção: Nutrição Reversa (Proteína e Hidratação) */}
      <View style={styles.row}>
        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>💧 Hidratação</Text>
          <Text style={styles.metricValue}>1.750 ml</Text>
          <Text style={styles.metricGoal}>Meta: 2.500 ml</Text>
        </View>

        <View style={[styles.card, styles.halfCard]}>
          <Text style={styles.cardTitle}>🥩 Proteína (Massa)</Text>
          <Text style={styles.metricValue}>110 g</Text>
          <Text style={styles.metricGoal}>Piso Mínimo: 130g</Text>
        </View>
      </View>

      {/* Módulo: Mapa Corporal de Rodízio & Regra dos 4 Dedos */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Mapa de Aplicação (Rodízio)</Text>
        <Text style={styles.bodyDescription}>
          Próxima aplicação: Abdômen (Quadrante Inferior Direito). 
          Respeitando a regra de 4 dedos de distância do umbigo.
        </Text>

        <View style={styles.bodyMapMock}>
          <Text style={styles.mapLabel}>🟢 Abdômen Esquerdo (Livre)</Text>
          <Text style={styles.mapLabelDisabled}>🔴 Abdômen Direito (Usado na Semana Passada)</Text>
          
          {!allowThigh ? (
            <Text style={styles.mapLabelLocked}>🔒 Coxas Bloqueadas (Pouco tecido subcutâneo)</Text>
          ) : (
            <Text style={styles.mapLabel}>🟢 Coxas (Disponíveis)</Text>
          )}
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>+ Registrar Nova Injeção</Text>
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
  mapLabelLocked: { color: '#94A3B8', fontSize: 13, marginVertical: 2, fontStyle: 'italic' },
  actionButton: { backgroundColor: '#0284C7', padding: 14, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});