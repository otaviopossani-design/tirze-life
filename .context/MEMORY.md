# Memória do Projeto: Monjaro codex / Tirze-Life

## 1. Visão Geral
- **Nome:** Tirze-Life Companion (GLP-1/GIP)
- **Localização:** H:\Meu Drive\Projetos\Monjaro anti
- **Data da Última Atualização Válida:** 2026-11-01 18:08
- **Arquitetura:** React 19 + Expo Web + TypeScript + NativeWind + Zustand + Python FastAPI Backend

## 2. Componentes e Módulos Centrais
- **Motor Farmacocinético (`pharmacokinetics.ts`):** Meia-vida de 120h, decaimento exponencial, 4 fases do ciclo biológico e regra dos 4 dedos.
- **Motor Modo Vida Real (`real_life_engine.py`):** Suporte a eventos sociais (álcool, bebidas com gás), acréscimo de água sem telas punitivas.
- **Nutrição Reativa & Algoritmo de Doses (`reactive-nutrition.ts` e `NextMealReactiveCard.tsx`):** Sugere próxima refeição adaptada a sintomas reais (alimentos frios para combater náusea olfativa por cheiros fortes e porções compactas para evitar regurgitação mecânica em esforço). Avalia progressão de dose com contraindicação de aumento para 5,0 mg em caso de sensibilidade gástrica.
- **Base Científica & Protocolos (`DoseScienceGuide.tsx`):** Links diretos para NEJM, The Lancet e consensos internacionais, cobrindo Tirzepatida, Retatrutida, CagriSema e Glow/GHK-Cu com Disclaimer Médico obrigatório.
- **Painel da Clínica Conectado (`ClinicDashboard.web.tsx` em `/clinica`):** Filtro por medicação, histórico compartilhado e gestão de cardápios.

## 3. Estado de Verificação & Testes
- Vitest: 7 arquivos, 69 testes aprovados (100%).
- Pytest: 31 testes aprovados (100%).
- Typecheck (`tsc --noEmit`): 0 erros.
- Interface & Responsividade (320px, 390px, desktop): Aprovada sem erros de JavaScript.
