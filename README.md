# Tirze-Life

Etapas 1 e 2: estado mobile, farmacocinética e motor Modo Vida Real, sem banco de dados.

## Abrir localmente no Windows

Na raiz do projeto:

```powershell
powershell -File .\scripts\start-local.ps1
```

O script copia o código para `%TEMP%\tirze-life-runtime`, instala dependências se necessário e abre [o app](http://localhost:8081). Essa cópia de execução evita falhas de gravação de `node_modules` no Google Drive. O código-fonte oficial continua nesta pasta. Execute novamente o script após editar os arquivos para sincronizar a cópia.

- App: http://localhost:8081
- API/Swagger: http://localhost:8010/docs
- Saúde: http://localhost:8010/health
- Logs locais: `.local/`
- A prévia web usa memória e perde os registros ao recarregar. Use dados fictícios.

O script não encerra serviços de outros projetos. Se uma porta estiver ocupada por outro aplicativo, ele informa o conflito.

## Arquivos principais

- `apps/mobile/src/utils/pharmacokinetics.ts`
- `apps/mobile/src/store/useAppStore.ts`
- `apps/mobile/src/components/RealLifeModeModal.tsx`
- `apps/mobile/src/storage/privateStorage.native.ts`
- `apps/api-engine/services/real_life_engine.py`
- `apps/api-engine/main.py`

Veja [as decisões, limites e revisão do schema](docs/etapas-1-2.md).

## Verificações

```powershell
# Backend, na pasta apps/api-engine:
.\.venv\Scripts\python.exe -m pytest -q

# Mobile, na cópia local %TEMP%\tirze-life-runtime\apps\mobile:
npm run typecheck
npm test
npm run export:web

# Com app e API em execução, usando Microsoft Edge:
node tests/preview-check.cjs
```

Node 24 e Python 3.14 foram usados neste ambiente. As versões ficam em `package-lock.json` e `requirements.lock.txt`.

Para um dispositivo físico, configure `EXPO_PUBLIC_API_URL` com um endereço acessível pelo dispositivo. `localhost` aponta para o próprio aparelho. A execução entregue aqui está limitada ao computador local; autenticação e acesso remoto ficam para uma etapa futura.

## Prévia visual do front-end — 19/10/2026

Execute `powershell -File .\scripts\start-frontend.ps1` para abrir a nova tela em http://localhost:8081, sem iniciar a API.

- Seletor fixo dos temas Dark Precision, Clinical Clean e Warm Zero-Guilt.
- Painel responsivo com ciclo ilustrativo, água, proteína, refeições, Modo enjoo e check-in.
- Navegação por tratamento, plano alimentar, diário e evolução.
- Água, refeições, relatos, momentos e aplicações são interativos e usam apenas a memória da sessão. Recarregar restaura os dados fictícios; somente o tema escolhido é salvo no navegador.
- A tela funcional anterior continua em `/registros`, com as dependências de API originais.
- Sem autenticação, integração clínica, cálculo farmacocinético real na nova tela, voz/IA ou emissão de PDF nesta etapa visual.
- Os planos de exemplo são ilustrativos; alternativas de refeições não têm equivalência clínica validada. A curva ilustrativa foi substituída pelo histórico factual de aplicações relatadas.

Código: `apps/mobile/src/components/Dashboard.web.tsx` e `dashboard.css`. A versão nativa mantém a tela anterior por meio de `Dashboard.tsx`.

Verificação na cópia temporária: `npm run typecheck`, `npm test`, `node tests/dashboard-check.cjs`. O último cobre temas, refeições reversíveis, água, Modo enjoo, diário, momentos, aplicação e navegação responsiva em 320/390px.

## Painel da clínica — prévia visual

Abra http://localhost:8081/clinica após executar `scripts/start-frontend.ps1`. Os dois painéis possuem links para alternar entre clínica e paciente.

- Visão geral com pacientes, pendências de rotina, frequência de check-ins e agenda ilustrativa.
- Busca por nome/identificador (insensível a acentos), filtros de status e exportação CSV da lista filtrada.
- Ficha individual em painel lateral com resumo, plano alimentar e diário.
- Edição persistente de plano e alternativa do Modo enjoo, com proteção contra descarte involuntário de rascunhos.
- Cadastro fictício sem convites; registros iniciais vazios para novos pacientes.
- Revisão de pendências, consulta a relatos e download de resumo demonstrativo TXT.
- Três temas, tabela com rolagem horizontal no celular e navegação móvel.

Os módulos de cadastro, medidas, movimento e alimentação compartilham dados locais entre clínica e paciente. Agenda e gráfico de exemplo continuam ilustrativos. Diário e revisões do plano agora são persistentes; consulte a entrega de acompanhamento abaixo. Sem prontuário, autenticação, calendário externo, análise de IA/SOAP ou prescrição nesta etapa.

Código: `apps/mobile/src/components/ClinicDashboard.web.tsx` e `clinic.css`. Testes de interface: `node tests/clinic-check.cjs`, executado na cópia temporária do projeto.


## Cardápio conectado entre clínica e paciente - 22/10/2026

- Clínica: http://localhost:8081/clinica?view=plans
- Paciente de demonstração (Marina): http://localhost:8081/?view=nutrition
- Outros pacientes: links individuais nos cartões e no editor da clínica.

A clínica edita sete dias, horários, alimentos e porções. Existem modelos para rotina habitual,
enjoo/pouca fome, constipação e diarreia; as adaptações ficam desabilitadas até revisão.
Salvar rascunho não altera a versão do paciente. Publicar exige responsável, confirmação de
revisão e campos completos nos sete dias e nos perfis liberados. O paciente escolhe uma opção
liberada e registra a refeição; não há cálculo automático de proteína consumida ou dieta por dose.
Metas opcionais são inseridas pela equipe, sem cálculo de necessidade nutricional.

Os planos, rascunhos e registros de refeições agora persistem em localStorage e sincronizam entre
abas na mesma origem/navegador. Cadastro, medidas e atividades também persistem localmente, conforme a seção abaixo. Diário, hidratação e aplicações agora persistem conforme a entrega de acompanhamento abaixo. A agenda permanece ilustrativa.
Esta é uma prévia local com dados fictícios: não há autenticação, validação de identidade
profissional, isolamento de contas no servidor ou prontuário. O identificador na URL não é
controle de acesso. Não usar dados reais. Integração em produção requer backend autenticado,
permissões por clínica/paciente, auditoria, armazenamento apropriado e revisão clínica do conteúdo.

Fontes e data da revisão estão disponíveis na interface. O app não verifica alergênicos nem
equivalência entre opções. Alterações em rascunhos não apagam a publicação anterior.
Uma publicação nova inicia uma versão de acompanhamento distinta; registros anteriores
permanecem no armazenamento e agora podem ser consultados no histórico do Plano combinado.

Verificações na cópia de execução:

```powershell
npm run typecheck
npm test
node tests/nutrition-check.cjs
node tests/dashboard-check.cjs
node tests/clinic-check.cjs
npm run export:web
```

 
### Demonstração pronta para apresentação

Os oito pacientes fictícios agora começam com planos semanais completos, metas fictícias e
três adaptações disponíveis. Esses dados são fixtures de apresentação, identificadas na interface,
e só são usados quando não há registro local salvo. Alterações existentes são preservadas.

Selecionar enjoo, constipação ou diarreia mostra imediatamente as opções daquele perfil.
O perfil continua selecionado ao navegar entre o resumo e o plano completo. É possível voltar
à opção habitual por refeição. Refeições já registradas preservam o conteúdo salvo.
Se a clínica desabilitar um perfil e publicar, o paciente vê orientações e o aviso de que a
adaptação está indisponível, sem trocar o plano. Pacientes novos continuam exigindo publicação.


## Cadastro B2B/B2C e movimento - 22/10/2026

- Cadastro individual novo: http://localhost:8081/?cadastro=1
- Cadastro da Marina: http://localhost:8081/?view=profile
- Movimento do paciente: http://localhost:8081/?view=activity
- Acompanhamento pela clínica: http://localhost:8081/clinica?view=activity

O formulário compartilhado coleta nome, nascimento (adultos), altura em cm, peso em kg,
objetivo, rotina de atividade e medicação informada. Contatos, limitações e condições são
opcionais. Novos cadastros da clínica permanecem na lista após recarregar. Cadastros
individuais não entram automaticamente na base da clínica. Vínculo, convites e migração
B2C para B2B ficam fora desta demonstração.

O cadastro usa validação de unidades e datas. O histórico mantém uma medida de peso por
dia, substitui correções no mesmo dia e não cria pesagens ao editar outros campos.
A evolução agora usa essas medidas, sem inferir perda de músculo, calorias ou prescrição.
Edições desatualizadas são recusadas para evitar sobrescrever alterações de outra aba.

Movimento inclui caminhada, sentar/levantar, apoio na parede e mobilidade sentada,
com instruções educativas, registro de data/minutos/esforço/observações e remoção com
confirmação. O resumo soma minutos informados, dias ativos e dias distintos com força
na semana corrente. Não converte minutos leves ou de mobilidade em meta aeróbica.
A clínica consulta o mesmo histórico na ficha e na página Movimento.
Não há monitoramento em tempo real por profissionais ou emissão automática de alertas.

Os oito perfis de apresentação têm medidas fictícias; quatro têm atividades de exemplo.
Cadastros novos começam sem atividades. Armazenamento: chave por pessoa em
tirzelife-care-demo-v1:, com atualização entre abas do mesmo navegador/origem.
Essa separação é lógica para a demonstração; não é controle de acesso.
Não inserir dados reais. Não há conta autenticada, backend, pagamento, exportação de
prontuário ou sincronização entre dispositivos. As telas nativas não foram modificadas.

Fontes consultadas: OMS (atividade física), NIDDK (Staying Active at Any Size),
NHS (Strength exercises e Sitting exercises), com links na interface.
Referências gerais não definem treino por medicamento ou dose.

Validação: npm run typecheck; npm test (40 testes); node tests/care-check.cjs;
testes existentes de dashboard, clínica e nutrição; npm run export:web.
O teste care-check verifica criação B2B/B2C, persistência, separação de registros,
medidas, conflito entre editores, registro/remoção de atividades, sincronização,
três temas e telas de 320/390px.

Roteiro para apresentar:
1. No app do paciente, abra Meu cadastro e atualize uma medida.
2. Em Movimento, explore Como fazer com cuidado e registre uma atividade.
3. Na clínica, abra Movimento e a ficha de Marina: o registro já aparece.
4. Use Novo paciente para demonstrar o mesmo cadastro pela clínica.
5. Use o link de cadastro individual para uma jornada B2C independente.


## Landing page e planejamento de conteúdo — 22/10/2026

- Landing local: http://localhost:8082
- Iniciar: powershell -ExecutionPolicy Bypass -File .\scripts\start-landing.ps1
- Implementação e configuração: apps/landing/README.md
- Estudo: docs/marketing/estudo-seo-google-e-instagram.md
- Estratégia de Instagram: docs/marketing/estrategia-instagram-30-dias.md
- Calendário visual com filtros e legendas: docs/marketing/calendario-instagram-30-dias.html
- Calendário em texto e dados: arquivos .md e .json no mesmo diretório.

A landing tem nove páginas HTML, caminhos para clínicas e pacientes, conteúdo original,
metadados, dados estruturados e imagem de compartilhamento. Domínio e contato ainda não
foram escolhidos. Indexação está desativada na prévia; nenhum site público, postagem,
agendamento, conta de análise ou pagamento foi criado. O calendário de 30 dias propõe
18 posts de feed e Stories de apoio, com roteiros, legendas, formatos, horários de teste e métricas.

## Identidade visual e canais
A demonstração web usa a mesma paleta azul e a fonte Inter local na landing, paciente e clínica. Os temas Claro, Escuro e Suave preservam a marca. A licença da fonte está em design/Inter-LICENSE.txt.

- [Guia visual e modelos sociais](docs/brand/index.html)
- [Critérios de identidade e experiência](docs/brand/identidade-e-experiencia.md)
- [Plano Google, Instagram, Facebook e TikTok](docs/marketing/plano-google-instagram-facebook-tiktok.md)
- [Calendário multicanal de 30 dias](docs/marketing/calendario-multicanal-30-dias.md)

A fonte de cores é design/brand-tokens.json. Execute node scripts/build-brand.mjs após alterá-la; os scripts de início já fazem isso. O guia é gerado por node scripts/build-brand-guide.mjs. Com a prévia do app em execução, node scripts/check-brand.cjs verifica os pares de contraste selecionados, fonte e navegação e atualiza as capturas demonstrativas e os PNGs sociais. Depois execute node apps/landing/build.mjs.

O calendário multicanal deriva do calendário de Instagram: node scripts/build-multichannel-calendar.mjs. Os modelos são rascunhos; não são publicações, vídeos prontos ou contas conectadas. Os campos instagramUrl, facebookUrl e tiktokUrl permanecem vazios até haver perfis reais. Somente URLs configuradas aparecem no rodapé e nos dados estruturados. A verificação local não é certificação integral de acessibilidade ou medição de Core Web Vitals de campo.

## Acompanhamento conectado e pesquisa de mercado — 22/10/2026

- [Comparação de seis produtos e prioridades](docs/marketing/comparativo-concorrentes-e-prioridades.md).
- [Escopo entregue e roteiro de demonstração](docs/produto/plano-combinado-entrega.md).
- Paciente: http://localhost:8081/?view=care&paciente=TL-001
- Fila da clínica: http://localhost:8081/clinica?view=coordination

O Plano combinado preserva versões de orientações, vincula dificuldades ao contexto original,
permite atribuição e resposta da equipe e pede ao paciente confirmação de resolução ou reabertura.
Diário, água, check-ins, momentos e aplicações persistem por pessoa; o histórico reúne também
medidas, atividades, refeições e respostas. Correções de diário acrescentam um registro e mantêm
o original. Expectativas configuradas distinguem ausência de informação de não realização relatada.
Exportações TXT/JSON preservam fonte e datas; o resumo é uma contagem determinística, sem IA clínica.

Tudo funciona na demonstração web local, com sincronização entre abas da mesma origem.
Perfis individuais não entram na fila da clínica. Essa separação lógica não é autorização de acesso:
login, servidor, vínculo consentido e permissões por organização ainda são requisitos de produção.
A versão nativa não recebeu estes novos componentes. Nenhuma conta, serviço clínico, cobrança,
notificação externa ou publicação foi ativada.
