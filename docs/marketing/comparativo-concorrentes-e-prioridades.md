# Concorrentes e prioridades para a Tirzelife

Pesquisa de fontes primárias públicas em **22/10/2026**. Estado do projeto comparado: README lido antes das alterações desta rodada.

## Conclusão para decisão

Existe concorrência direta e adjacente. Diário, doses, peso, sintomas, planos alimentares, atividades, resumos, relatórios e acompanhamento profissional aparecem em várias ofertas. Histórico compartilhado e pedido de ajuste também aparecem nas páginas consultadas. Não há base para anunciar que o escopo ou o “plano combinado” são inéditos.

Nossa hipótese de vantagem é executar bem um percurso completo: **registrar → organizar com origem e data → relacionar a uma orientação → encaminhar a um responsável → responder → confirmar se a dificuldade foi resolvida**. Essa vantagem precisa ser demonstrada em uso, não inferida pela ausência de determinada palavra na página de um concorrente.

## Método e limites

- Fontes: páginas oficiais dos produtos e listagens publicadas pelos desenvolvedores nas lojas.
- Sem criação de contas, contratação, contato comercial, acesso a dados de pacientes ou teste autenticado.
- “Anunciado” significa que o fornecedor oferece publicamente o recurso. Não confirma sua execução, qualidade, cobertura ou disponibilidade para toda conta/plataforma.
- “Listagem encontrada” confirma a página pública na loja; não equivale a instalação ou teste.
- “Em breve” é reservado a recursos explicitamente apresentados como futuros.
- “Não verificado” significa falta de evidência suficiente nesta pesquisa, nunca ausência comprovada.
- Declarações comerciais de segurança, conformidade, quantidade de usuários, eficácia ou resultados não foram auditadas e não são usadas como comprovação.
- Textos, marcas, imagens, código e composição visual dos concorrentes não devem ser copiados.

## Comparativo

| Produto e natureza | Capacidades anunciadas | Evidência de disponibilidade e limites | Implicação para Tirzelife |
|---|---|---|---|
| **meuMON**, app individual + plataforma para clínicas | Doses, peso, medidas, alimentação, hidratação, movimento, sintomas; sincronização após vínculo; equipe, agenda e acompanhamento de ausência de registros. | Site oferece acesso individual e planos de clínica. Informa que novos preços/teste do iPhone aguardam aprovação, embora o aplicativo seja anunciado para iOS e Android. Não testado. | Separar cadastro individual de vínculo clínico e diferenciar disponibilidade do registro de leitura profissional. [Fonte](https://www.meumon.com.br/) |
| **Corpo+**, app + profissionais | Doses, bem-estar, medidas, atividades, planos alimentares, resumos e exportação; vínculo com nutrição, atividade física e endocrinologia; recursos de IA. | Site comercial ativo e listagem de loja encontrada. Execução de IA, verificação profissional e compartilhamento não auditados. | Oferecer contexto entre módulos e acesso aos dados originais; não pressupor precisão de geração automática. [Site](https://www.corpomais.com.br/) · [Google Play](https://play.google.com/store/apps/details?id=com.corpomais.app) |
| **Liti**, serviço assistencial com aplicativo | Equipe médica/nutricional, plano alimentar, medidas, hábitos, histórico de ajustes, pedido de revisão do tratamento e painel usado pelos profissionais. | Oferta de serviço e telas anunciadas. Não é apenas software vendido à clínica; acesso e nível de serviço não foram contratados/testados. | Benchmark de continuidade do cuidado, preservando a diferença entre fornecer software e prestar assistência. [Fonte](https://equipe.liti.com.br/) |
| **DoseCerta**, acompanhamento individual e profissional | Histórico de doses, peso, sintomas, lembretes, água/proteína e conexão opcional ao profissional. | Listagem App Store encontrada. Site indexado anuncia vínculo por convite; abertura direta do site apresentou timeout nesta rodada. Funcionalidades internas não verificadas. | Manter distinção entre uso individual e acompanhamento profissional; registrar uso relatado sem recomendar doses. [App Store](https://apps.apple.com/br/app/dosecerta-glp-1/id6792959377) · [Site](https://dosecerta.app/) |
| **Injecta**, app + portal profissional | Linha do tempo, doses, sintomas, peso, medidas, alimentação, atividades, exames, relatórios, convites e orientações; integrações de saúde anunciadas. | Página comercial com links para lojas; recursos não testados. **Telemedicina integrada explicitamente “Em breve”** na consulta. | Priorizar histórico coerente e preparação da consulta. Integrações e telemedicina exigem trabalho próprio; não são automaticamente parte de um MVP. [Fonte](https://www.injecta.app/) |
| **Clinik Control**, plataforma em espanhol para médicos e pacientes | Planos alimentares e de exercícios, evolução, expediente, agenda, portal de pacientes e busca de especialistas. | Oferta Premium e fluxo de teste anunciados; telas identificadas como ilustrativas. Não testado. Localização/operação brasileira não verificadas. | Acompanhar trabalho da clínica e do paciente no mesmo percurso; agenda e diretório de profissionais não são nossa primeira prioridade. [Fonte](https://www.clinikcontrol.com/) |

## O que a Tirzelife já tinha no início desta rodada

Conforme o README local:

- Cadastro B2B e individual; altura, peso, objetivos, rotina e medicação informada.
- Medidas e movimento com armazenamento local por pessoa.
- Plano alimentar de sete dias, rascunho/publicação, alternativas revisadas e registro de refeições.
- Área da clínica e área do paciente, três temas e identidade compartilhada com a landing.
- Parte dos registros ainda temporária ou ilustrativa: diário, água, aplicações, agenda e revisão de pendências.
- Sincronização restrita a abas da mesma origem/navegador; sem conta autenticada, servidor clínico, isolamento entre organizações, verificação profissional ou sincronização entre dispositivos.
- Sem IA de interpretação implementada, voz, prontuário real, cobrança ou notificações externas.

Esses limites são o ponto de partida, não uma descrição automática do que será entregue ao final desta rodada. Consulte a documentação da entrega e os testes para confirmar o estado posterior.

## Doze oportunidades priorizadas

As prioridades abaixo são decisões de produto para a Tirzelife, não alegações de funções ausentes nos concorrentes.

| Prioridade | Oportunidade | Construção proposta e aceite verificável |
|---|---|---|
| **P0 — 1** | Histórico único | Reunir relatos, alimentação, medidas, atividade e orientações numa linha do tempo, sem duplicar a fonte. Um registro retroativo aparece na data do acontecimento; a data de lançamento permanece consultável. |
| **P0 — 2** | Registro simples com origem preservada | Texto livre e formulários; categoria escolhida/corrigida pelo usuário. O texto original fica acessível e nunca é substituído silenciosamente por um resumo. Não apresentar categorização manual ou regra simples como IA. |
| **P0 — 3** | Ausência de informação explícita | Separar realizado, não realizado por relato, sem registro, incompleto e não aplicável. Só marcar ausência em relação a uma expectativa configurada. Não transformar silêncio em zero, abandono ou falta de adesão. |
| **P0 — 4** | Dificuldade vinculada à orientação | Botão para informar horário, entendimento, acesso, desconforto ou outra dificuldade. Preservar qual orientação/versão motivou o pedido; alterar a orientação depois não apaga o contexto. |
| **P0 — 5** | Fila de revisão com responsável | Pendência com autor, responsável e estados claros. A clínica responde e o paciente consegue ver a resposta; recebimento pela plataforma não é confirmação de leitura. |
| **P0 — 6** | Confirmação de resolução | Depois da resposta, paciente informa se ajudou, se ainda há dificuldade ou se quer esclarecer. Caso não resolvido volta à fila; ninguém conclui automaticamente que houve melhora clínica. |
| **P0 — 7** | Resumo para consulta rastreável | Período selecionável, fatos informados, perguntas e lacunas; cada item liga à fonte. Resumo determinístico pode ser útil antes de IA. Não gerar avaliação clínica, causalidade ou mudança de dose. |
| **P0 — 8** | Persistência e consistência | Na demonstração, armazenar registros e revisões por pessoa, sincronizar abas e impedir sobrescrita silenciosa. Antes de produção, backend autenticado, isolamento por clínica, auditoria e sincronização entre dispositivos. |
| **P1 — 9** | Plano compartilhado com versões | Mostrar orientações vigentes, autor, data e revisões; permitir equipe conciliar pedidos. Paciente confirma entendimento sem que isso seja interpretado como execução. |
| **P1 — 10** | Vínculo e compartilhamento compreensíveis | B2C não aparece automaticamente em uma clínica. Convite, aceite, profissionais autorizados, permissões e encerramento de vínculo precisam de fluxo próprio e validação no servidor antes de dados reais. |
| **P1 — 11** | Portabilidade do contexto | Preparar exportação do período com origem, data de geração, dados informados e lacunas. Primeiro formato simples e legível; PDF posterior com revisão visual. Exportação não vira prontuário certificado por mudar de formato. |
| **P2 — 12** | Registro multimodal e integrações | Áudio com transcrição corrigível, imagem com descrição confirmada e importações de dispositivos. Só adicionar com infraestrutura, autorização e avaliação de qualidade; estimativas ficam identificadas. |

P0: próxima demonstração funcional. P1: piloto planejado; requisitos de segurança de produção são obrigatórios antes de dados reais, mesmo quando uma linha contém também melhorias futuras de experiência. P2: após validar valor e capacidade operacional.

## Hipótese de diferenciação a testar

**Plano que pode ser discutido e revisado com contexto.**

O paciente recebe uma orientação, sinaliza uma barreira, a equipe responde com autoria e o paciente confirma se o encaminhamento ajudou. O produto organiza a responsabilidade e a continuidade desse percurso.

Exemplo fictício: uma refeição do plano exige preparo incompatível com o plantão. O paciente solicita revisão por horário; a pendência vai à nutrição; a resposta aparece vinculada à versão daquela refeição; o paciente confirma se a alternativa cabe na rotina. Nenhuma decisão clínica é tomada automaticamente.

Essa experiência combina capacidades comuns com uma proposta de execução que deverá ser comparada em testes reais. O estudo público não prova exclusividade.

## O que não incorporar automaticamente

- Cálculo de dose, escalonamento ou conversão de canetas.
- Curva ilustrativa apresentada como concentração medida no organismo.
- Diagnóstico, classificação clínica automática ou promessa de detectar complicações.
- Massa muscular estimada como fato a partir de peso, foto ou frequência de atividade.
- Calorias/macros obtidos por foto apresentados como medição exata.
- Escore único que transforme falta de registros em “mau paciente”.
- Alegações de resultados clínicos, conformidade ou segurança copiadas de fornecedores.
- Integrações, pagamentos, WhatsApp, lojas e notificações apresentadas como conectadas quando forem somente demonstrações.

A escolha de não implementar esses recursos agora é de escopo e validação; não é uma avaliação de irregularidade de qualquer concorrente.

## Como decidir se a melhoria funciona

Testar primeiro com tarefas e dados fictícios; depois, quando houver estrutura adequada, piloto com clínica parceira.

1. Paciente consegue registrar uma dificuldade e localizar a resposta?
2. Profissional consegue entender a origem do pedido sem perguntar tudo novamente?
3. Uma pendência tem responsável e próximo passo claros?
4. Resumo preserva incertezas, negativas e datas?
5. Correções e mudanças de plano preservam a sequência?
6. Quanto tempo é gasto por solicitação e quantas ficam sem retorno?
7. Paciente considera o encaminhamento compreensível e viável?
8. Clínica identifica valor suficiente para continuar pagando?

Comparar tempo e erros em tarefas equivalentes, não apenas número de funcionalidades. A demonstração valida navegação e fluxo; não demonstra eficácia clínica ou prontidão para produção.

## Próxima pesquisa

Avaliação autenticada exige acesso autorizado às contas de teste; não foi realizada. Quando disponível, executar o mesmo roteiro nos concorrentes: cadastro, registro, correção, ausência de dado, pedido de revisão, resposta, exportação e encerramento de vínculo. Registrar data, plano, plataforma e limitações observadas. Até lá, conservar as marcações “anunciado” e “não verificado”.

## Resultado incorporado nesta rodada
A demonstração passou a reunir diário persistente, histórico entre módulos, orientação versionada, pedido vinculado à versão original, responsável, resposta e confirmação de resolução. Foram adicionadas correções que preservam o original, frequências com pausa, exportação filtrada e indicadores da clínica derivados dos registros disponíveis.

O B2C continua independente e o compartilhamento é restrito à simulação local. Autenticação, vínculo consentido, backend e acesso por organização permanecem necessários antes de um piloto com dados reais. Não foi demonstrada exclusividade de mercado nem eficácia clínica.

[Escopo entregue, limites, validação e roteiro de apresentação](../produto/plano-combinado-entrega.md).
