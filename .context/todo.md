# Backlog & Tarefas: Monjaro codex

## Em Andamento / Prioridades
- [ ] Conectar chaves de API Supabase (URL + Anon Key) se for persistir em nuvem além do LocalStorage
- [x] [2026-11-02] Deploy Vercel: Configuração nativa de exportação estática (`output: static` no Expo Router) com geração de `clinica.html`, resolvendo o erro 404 da sub-rota `/clinica`.
- [x] [2026-11-02] Redesign Visual Zen e Redução de Espaçamento em Todos os Menus e Cards (Home, Tratamento, Plano Alimentar, Diário, Plano Combinado, Movimento, Evolução e Cadastro).
- [x] [2026-11-02] Implementação do Motor de Ciclo Semanal Automático com cálculo dinâmico de semanas, previsão da próxima dose (+7 dias) e consolidação instantânea no Relatório de Consulta (`DoctorReportExport.tsx`).
- [x] [2026-11-02] Atualização da skill `prompt-engineer-pro` para a versão Elite 2.0 com 11 seções obrigatórias, critérios de aceite verificáveis e checklist de entrega sem código cortado.

## Backlog Geral
- [ ] Implementar exportação de relatório médico em PDF padronizado para WhatsApp
- [ ] Integrar webhook de gateway de pagamento (Kiwify/Asaas/Stripe)
- [ ] Módulo de SEO Local Programático Multi-Cidades com JSON-LD Schema.org para clínicas parceiras

## Concluídas
- [x] [2026-10-30] Inicialização da infraestrutura de memória persistente (.context)
- [x] [2026-11-01] Implementação do módulo de Nutrição Dinâmica Reativa (`reactive-nutrition.ts` e `NextMealReactiveCard.tsx`) com proteção contra náusea olfativa e regurgitação em esforço
- [x] [2026-11-01] Módulo de Base Científica por Dose e Protocolos com links oficiais de ensaios clínicos (SURMOUNT, SURPASS, Nature Medicine) e Disclaimer de Não-Exercício Médico
- [x] [2026-11-01] Suporte multi-tratamento conectado (Tirzepatida, Retatrutida, CagriSema, Glow/GHK-Cu, Semaglutida) no painel do paciente e da clínica com filtros em tempo real
- [x] [2026-11-01] Execução da bateria completa de testes automatizados: 69 testes em Vitest + 31 testes em Pytest (100% aprovados) + verificação de interface com Playwright/node.
