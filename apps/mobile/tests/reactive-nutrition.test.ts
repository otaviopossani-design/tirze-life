import { describe, it, expect } from 'vitest';
import {
  generateNextMealSuggestion,
  evaluateDoseProgression,
  MealIntakeLog,
} from '../src/domain/reactive-nutrition';

describe('Suíte de Testes Automatizados · Motor Reativo & Algoritmo de Doses', () => {
  // ORQUESTRADOR 1 / OPERADOR 1: Náusea Olfativa (Ânsia por Cheiro Forte)
  it('Operador 1: Deve sugerir prato Frio/Ambiente sem vapores quando houver náusea olfativa', () => {
    const log: Partial<MealIntakeLog> = {
      symptomTrigger: 'ANCIA_CHEIRO',
      volumeFeeling: 'LEVE',
    };
    const result = generateNextMealSuggestion(log, 'Tirzepatida', 2.5);

    expect(result.temperature).toBe('Frio / Ambiente');
    expect(result.title).toContain('Anti-Odores');
    expect(result.contraindications).toContain(
      'Comidas quentes fumegantes ou com cheiro forte (alho/cebola fritos)'
    );
    expect(result.proteinG).toBeGreaterThanOrEqual(20);
  });

  // ORQUESTRADOR 1 / OPERADOR 2: Regurgitação Mecânica em Esforço Físico
  it('Operador 2: Deve emitir alerta postural de atividade física quando houver regurgitação em esforço', () => {
    const log: Partial<MealIntakeLog> = {
      symptomTrigger: 'REGURGITACAO_ESFORCO',
      volumeFeeling: 'NORMAL',
    };
    const result = generateNextMealSuggestion(log, 'Tirzepatida', 2.5);

    expect(result.physicalActivityWarning).toBeDefined();
    expect(result.physicalActivityWarning).toContain('Evite agachamentos pesados');
    expect(result.contraindications).toContain(
      'Líquidos misturados com a refeição sólida (beba 30 min antes ou depois)'
    );
  });

  // ORQUESTRADOR 1 / OPERADOR 3: Empachamento Gástrico
  it('Operador 3: Deve sugerir textura líquida/cremosa morna suave se houver empachamento gástrico', () => {
    const log: Partial<MealIntakeLog> = {
      symptomTrigger: 'EMPACHADO_PESADO',
      volumeFeeling: 'EMPACHADO',
    };
    const result = generateNextMealSuggestion(log, 'Tirzepatida', 5.0);

    expect(result.temperature).toBe('Morno Suave');
    expect(result.title).toContain('Esvaziamento Gástrico Acelerado');
    expect(result.portion).toContain('pequenos goles');
  });

  // ORQUESTRADOR 2 / OPERADOR 4: Algoritmo de Escalonamento de Doses (6 UI vs 8 UI)
  it('Operador 4: Deve contraindicar subida para 5,0 mg se paciente apresentar regurgitação/náusea em 2,5 mg', () => {
    const logs: MealIntakeLog[] = [
      {
        id: '1',
        patientId: 'TL-001',
        consumedFood: 'Ovo e café matinal com 6 UI',
        estimatedProteinG: 12,
        volumeFeeling: 'NORMAL',
        symptomTrigger: 'ANCIA_CHEIRO',
        loggedAt: new Date().toISOString(),
      },
    ];

    const evalResult = evaluateDoseProgression(2.5, 6, logs);

    expect(evalResult.suggestedDecision).toBe('MANTER_DOSE_MINIMA');
    expect(evalResult.decisionLabel).toContain('Manter Dose Mínima (2,5 mg)');
    expect(evalResult.medicalRationale).toContain('terminantemente contraindicada');
    expect(evalResult.safeSyringeAdvice).toContain('Atenção à medida da seringa');
  });

  // SIMULAÇÃO DOS 3 USUÁRIOS REAIS
  describe('Simulação dos 3 Perfis de Usuários Reais', () => {
    // USUÁRIO 1: Marina (Tirzepatida 2,5 mg, oscilação de seringa 6 UI vs 8 UI, náusea e regurgitação)
    it('Usuário 1 (Marina): Protege contra hipersensibilidade olfativa e desaconselha aumento para 5 mg', () => {
      const marinaLogs: MealIntakeLog[] = [
        {
          id: 'm1',
          patientId: 'TL-001',
          consumedFood: '6 UI aplicadas; ânsia súbita ao sentir cheiro do almoço',
          estimatedProteinG: 10,
          volumeFeeling: 'LEVE',
          symptomTrigger: 'ANCIA_CHEIRO',
          loggedAt: new Date().toISOString(),
        },
      ];

      const meal = generateNextMealSuggestion(marinaLogs[0], 'Tirzepatida', 2.5);
      const evalProgression = evaluateDoseProgression(2.5, 6, marinaLogs);

      expect(meal.temperature).toBe('Frio / Ambiente');
      expect(evalProgression.suggestedDecision).toBe('MANTER_DOSE_MINIMA');
      expect(evalProgression.safeSyringeAdvice).toContain('variação de 6 UI para 8 UI');
    });

    // USUÁRIO 2: Juliana (Retatrutida 4 mg, triplo agonista com termogênese e necessidade hídrica alta)
    it('Usuário 2 (Juliana): Adapta refeições para alta termogênese e preservação de eletrólitos', () => {
      const julianaLog: Partial<MealIntakeLog> = {
        symptomTrigger: 'NENHUMA_FOME',
        volumeFeeling: 'LEVE',
      };

      const meal = generateNextMealSuggestion(julianaLog, 'Retatrutida', 4.0);

      expect(meal.title).toContain('Densidade Proteica Compacta');
      expect(meal.food).toContain('Shake proteico límpido');
      expect(meal.proteinG).toBe(25);
    });

    // USUÁRIO 3: Rodrigo (CagriSema, saciedade de via dupla, plenitude rápida)
    it('Usuário 3 (Rodrigo): Garante esvaziamento leve com alto teor proteico sem estufamento', () => {
      const rodrigoLog: Partial<MealIntakeLog> = {
        symptomTrigger: 'EMPACHADO_PESADO',
        volumeFeeling: 'MUITO_CHEIO',
      };

      const meal = generateNextMealSuggestion(rodrigoLog, 'CagriSema', 1.0);

      expect(meal.temperature).toBe('Morno Suave');
      expect(meal.title).toContain('Esvaziamento Gástrico Acelerado');
    });
  });
});
