# Tirze-Life — entrega das etapas 1 e 2

Implementação baseada nos arquivos `escopo_completo_e_arquitetura_do_app (1).md` e `prompt_mestre_antigravity_e_nemotron.md`. Os exemplos originais foram preservados na raiz. Não havia AGENTS.md na pasta ou nas pastas ancestrais consultadas.

## Entregue

- Expo SDK 54, Expo Router, TypeScript estrito, NativeWind e Zustand.
- Perfil vazio no primeiro acesso, configuração de tirzepatida e confirmação explícita de prescrição.
- Histórico de aplicações, eventos sociais, água, proteína, azia e estufamento.
- Módulo farmacocinético com absorção gradual, meia-vida de 120h e soma de todo o histórico.
- Recomendações de rodízio que incluem braços, excluem coxas conforme o perfil e bloqueiam o último local nas sugestões. O histórico permite registrar o que de fato ocorreu.
- API FastAPI sem banco, com validação Pydantic, contrato camelCase, Swagger e endpoint de saúde.
- Modal React Native integrado à API e tela de verificação local.
- Persistência nativa cifrada com AES-256-GCM, nonce aleatório de 12 bytes por escrita, chave em Expo SecureStore e escritas serializadas. AsyncStorage contém somente o envelope cifrado.
- Prévia web com estado em memória. Recarregar a página apaga os registros dessa sessão.
- Exportação JSON e exclusão local. Não existe conta remota nem sincronização.
- Testes de fórmula compartilhados entre TypeScript e Python, regras de eventos, store, criptografia com adaptadores simulados e fluxo real no navegador.

## Fórmula e decisões de implementação

`C(t) = Σ D_i × (1 − exp(−0,08 × Δt_i)) × 0,5^(Δt_i / 120)`, para `Δt_i ≥ 0`.

Não arredondamos valores intermediários. A interface arredonda apenas para exibição. Injeções futuras não contribuem nem definem a fase. Todas as doses anteriores entram na soma, inclusive após 720h; o corte presente no exemplo contradizia a fórmula do documento mestre.

As fases usam horas exatas desde a aplicação passada mais recente: absorção antes de 24h; pico de 24h até 72h inclusive; estabilidade após 72h até 120h inclusive; cauda depois de 120h. Sem aplicações, a fase é `NO_DATA`.

O motor avalia a farmacocinética na data do evento, e não na hora da requisição. Sintomas são considerados no intervalo fechado das 48h anteriores ao evento; sintomas posteriores não entram na análise.

O ajuste de água é `250 × quantidade` exclusivamente para `ALCOOL_CERVEJA`. Os demais eventos não acrescentam água. As latas/copos são a unidade operacional do projeto, não uma medida padronizada de álcool.

A meta diária é derivada do peso atual (35 ml/kg) mais a soma dos eventos daquela data no fuso IANA do perfil. A meta base não é modificada pelo registro. Excluir eventos recalcula a referência automaticamente. Proteína usa 1,6 g/kg do peso de referência/meta informado, sem presumir que ele seja um peso ideal clinicamente validado.

Com restrição de líquidos informada no perfil, a meta automática é suspensa. A resposta preserva o ajuste teórico para auditoria e devolve `dynamicWaterGoalMl: null`.

Repetir um evento já enviado com o mesmo ID e conteúdo não duplica a soma. IDs duplicados no histórico ou reutilizados com conteúdo diferente são rejeitados. A API é determinística e não salva registros; o cliente envia o histórico necessário.

## Limites clínicos do modelo

Mantivemos a matemática e as janelas pedidas como regras do projeto. O resultado em mg é uma quantidade modelada; não é concentração sérica medida, percentual de efeito, diagnóstico ou indicação de ajuste de dose. O modelo de 120h foi limitado à tirzepatida e não é aplicado à semaglutida.

A informação oficial descreve meia-vida de aproximadamente 5 dias e tempo de concentração máxima de 8–72h; a janela operacional de 24–72h é específica deste projeto. A fórmula de absorção não foi validada clinicamente por esta implementação. Referência: [informações de prescrição da Lilly](https://pi.lilly.com/us/mounjaro-uspi.pdf).

A linguagem foi ajustada para não prometer prevenção de ressaca, hipoglicemia ou proteção renal pelo consumo de água, nem atribuir saciedade relatada a uma vitória clínica comprovada. O relato é acolhido sem celebrar quantidade de álcool ou incentivar compensações. As regras do projeto não estabelecem classificação regulatória automática.

## Revisão do schema de referência

Nenhum banco ou tabela foi criado. Antes da futura integração Supabase, o schema precisa de:

- RLS habilitado e políticas por `auth.uid() = user_id` nas tabelas dependentes.
- Confirmação de prescrição explícita, sem `DEFAULT TRUE`.
- Restrições de dose, quantidade positiva e metas coerentes; fuso e medicamento no perfil.
- Padrão consistente de nomes para os locais e tipos de evento entre os exemplos divergentes.
- Nutrição por data e IDs estáveis para sincronização/idempotência.
- Fluxo de exportação e exclusão que contemple também dados remotos.

## Fora destas etapas

Mapa corporal visual completo, dashboard definitivo, push, autenticação/Supabase, assinatura PRO, análise de séries com Pandas e PDF. A tela atual serve para verificar o estado e o motor. Sem publicação ou servidor externo.

O armazenamento seguro foi testado com adaptadores simulados; ainda é necessária validação em dispositivo iOS/Android. A API local não tem autenticação e deve permanecer vinculada a 127.0.0.1. A prévia não representa uma liberação para produção.
