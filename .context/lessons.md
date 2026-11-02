# Lições Aprendidas & Regras de Ouro: Monjaro codex

> Regra Universal: Toda correção técnica ou bug resolvido por você ou pela IA deve ser registrado aqui para que NENHUMA IA repita o erro no futuro.

## Registro de Lições
- [2026-10-22 18:43] BASELINE ESTÁVEL: Os arquivos [README.md (2026-10-22), frontend.log (2026-10-22), build-brand-guide.mjs (2026-10-22)] representam o último estado funcional e validado. Qualquer modificação futura DEVE ser estritamente compatível e não-destrutiva.
- [2026-10-30] PROTOCOLO NÃO-DESTRUTIVO: Proibido reorganizar pastas ou reescrever arquivos funcionais sem pedido explícito.
- [2026-11-01] FARMACOLOGIA CLÍNICA & OSCILAÇÃO DE SERINGA: A oscilação na seringa de 100 UI (ex: 6 UI vs 8 UI) representa variação de 25% na concentração de tirzepatida. Essa quebra de estabilidade da curva de 120h desencadeia hiper-reatividade olfativa (náusea a cheiros quentes) e regurgitação mecânica em esforço físico. O app deve sugerir alimentos em temperatura ambiente (sem vapores aromáticos) e contraindicar a progressão para 5,0 mg até adaptação gástrica total de 3-4 semanas.
- [2026-11-01] TYPESCRIPT STRICT CHECKS: Em coleções indexadas (como `PROTOCOLS_DATA`), usar fallback com operador de coalescência nula `?? fallback!` para evitar erros de compilação em `tsc --noEmit`.
