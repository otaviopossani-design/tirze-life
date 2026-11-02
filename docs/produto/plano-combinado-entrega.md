# Plano combinado — entrega da demonstração
Data: 22/10/2026.

## Decisão de produto
A pesquisa pública de seis concorrentes encontrou diário, doses, planos, relatórios e vínculo profissional em diferentes ofertas. A Tirzelife incorpora capacidades úteis sem copiar marcas, textos, telas ou código. Não há evidência de exclusividade. A hipótese de diferenciação é a qualidade do percurso completo entre uma dificuldade relatada e sua resolução confirmada.

Comparação e fontes: [concorrentes e prioridades](../marketing/comparativo-concorrentes-e-prioridades.md).

## O que funciona agora
| Capacidade | Paciente | Clínica |
|---|---|---|
| Cadastro e contexto | Dados pessoais, medidas, objetivos, medicação informada | Ficha do perfil vinculado; cadastro de paciente |
| Plano alimentar | Sete dias e alternativas publicadas pela equipe | Rascunho, revisão e publicação |
| Movimento | Atividades educativas e registros da rotina | Consulta ao histórico informado |
| Diário e registros rápidos | Texto, água, check-in, momento e aplicação relatada | Histórico compartilhado da demonstração |
| Plano combinado | Consulta de orientações; relato de dificuldade com motivo | Publicação de orientações, autoria e versões |
| Revisão de orientação | Confirma se resolveu ou reabre a dificuldade | Fila, responsável, prazo opcional e resposta |
| Histórico | Filtros, origem, acontecimento e lançamento | Mesmo contexto, com dados de alimentação, medidas e movimento |
| Correção do diário | Novo registro ligado ao original, que permanece visível | Consulta de ambos os registros |
| Frequência combinada | Identifica períodos sem informação | Configura frequência, pausa ou retoma |
| Exportação | TXT e JSON do período/assunto selecionado | Exportação do histórico e resumo TXT da ficha |

O botão “Isso não funciona para mim” se refere às orientações do Plano combinado. Não altera automaticamente o cardápio, a atividade ou a prescrição. Quando a resposta exige alteração alimentar, a equipe ainda revisa e publica o plano alimentar no módulo correspondente.

## Regras do fluxo
1. Orientação publicada tem profissional informado, categoria, data e versão.
2. O pedido guarda o relato original e uma cópia da versão que o paciente viu. Mudança posterior não apaga esse contexto.
3. Um responsável assume a revisão. A resposta fica no histórico com autoria e data.
4. Após resposta, o paciente pode confirmar resolução da dificuldade ou reabrir. Isso não significa cura, eficácia clínica ou comprovação de execução.
5. Editar responsável ou prazo não apaga uma resposta aguardando confirmação.
6. Dados retroativos aparecem pela data do acontecimento; a data de lançamento continua disponível.
7. Ausência de registro só é calculada para períodos encerrados de uma frequência configurada. Não significa abandono, descumprimento ou ausência de sintomas.
8. “Não realizei” é informação explícita do paciente. Não é inferida de silêncio.
9. Correções de diário são acrescentadas e referenciam o original. Somatórios usam os registros ativos para evitar duplicação.
10. Conflitos de edição e falhas de armazenamento retornam erro e preservam o rascunho.

## Indicadores da clínica
Água mostra o percentual da referência publicada, quando há registro e referência. Refeições mostra a proporção das refeições registradas no plano publicado de hoje; não estima proteína ingerida. Check-ins contam dias distintos com registro nos últimos sete dias. Sem informação aparece como ausência de registro.

O histórico e os resumos são organização determinística de informações. Não há interpretação clínica por IA, diagnóstico, detecção automática de risco ou ajuste de dose. O antigo gráfico ilustrativo de concentração de medicamento foi substituído por aplicações relatadas. Agenda e gráfico geral de exemplo continuam identificados como ilustrativos.

## Roteiro de demonstração
Use dados fictícios no mesmo navegador.

1. Abra [paciente Marina](http://localhost:8081/?view=care&paciente=TL-001) e [fila da clínica](http://localhost:8081/clinica?view=coordination).
2. No paciente, escolha “Isso não funciona para mim”, informe uma dificuldade de horário e envie.
3. Na clínica, abra a revisão, atribua responsável e responda.
4. No paciente, leia a resposta, escolha “Ainda está difícil”; depois demonstre uma nova resposta e “Resolveu minha dificuldade”.
5. Revise a orientação na clínica e consulte as versões. O pedido anterior mantém a versão original.
6. Registre um relato retroativo; consulte data do acontecimento e data de lançamento. Corrija-o e confira que o original continua acessível.
7. Filtre o histórico e exporte TXT/JSON.
8. Na visão geral do paciente, registre água, check-in e aplicação; acompanhe a atualização da clínica e recarregue as abas.
9. Demonstre cadastro individual em [B2C](http://localhost:8081/?cadastro=1): não entra automaticamente na lista da clínica.

## Limites e próximo passo
Esta entrega é uma demonstração web local. Os registros ficam no localStorage por pessoa e sincronizam entre abas da mesma origem. O identificador da URL não protege acesso. Não inserir dados reais. Não há transmissão para profissionais, autenticação, backend clínico ou sincronização entre dispositivos.

A versão nativa não recebeu esses componentes. Voz, transcrição, fotos, wearables, convites, autorização por profissional, desligamento de vínculo, prontuário, pagamento e notificações externas ainda não estão conectados.

Antes de piloto com dados reais: implementar identidade e autenticação; vínculo consentido; permissões por clínica e profissional; auditoria e correções no servidor; retenção e exportação; backup e recuperação; proteção de dados; fluxo de suporte e responsabilidade da equipe. Definir também quem responde, em qual horário e o que acontece quando um prazo vence. Prazo de revisão não é atendimento de urgência.

Depois, validar tarefas com pacientes e profissionais: tempo para registrar e responder, compreensão do contexto, pedidos sem responsável, reaberturas, satisfação com a resposta e disposição da clínica para pagar. Não usar apenas quantidade de funcionalidades como prova de vantagem.

## Validação desta entrega
Verificações executadas na cópia de runtime em 22/10/2026:

- TypeScript sem erros e 62 testes de domínio/armazenamento aprovados.
- Cadastro e movimento: criação B2B/B2C, medidas, conflitos de edição, atividades, persistência e isolamento lógico.
- Nutrição: rascunho, publicação, alternativas revisadas, registro de refeições e sincronização entre abas.
- Clínica: busca, filtros, ficha, proteção de rascunho, exportações e cadastro persistente.
- Paciente: registros rápidos, temas, cardápio, aplicações e navegação.
- Integração dos registros rápidos: água, check-in, aplicação, diário, refeição e atividade refletidos no histórico e nos indicadores da clínica, com persistência após recarregar.
- Navegação responsiva em 320 e 390 px; inspeção visual de capturas. Isso não equivale a auditoria completa de acessibilidade.
- Exportação web concluída com sucesso.

Comandos: `npm run typecheck`, `npm test`, `node tests/care-check.cjs`, `node tests/nutrition-check.cjs`, `node tests/clinic-check.cjs`, `node tests/dashboard-check.cjs`, `node tests/quick-journal-check.cjs`, `npm run export:web`.

O teste `node tests/coordination-check.cjs` também passou: pedido → atribuição → resposta → reabertura → resolução; versão original preservada; recarga e sincronização; diário retroativo; ausência distinta de não realização; pausa/retomada; exportação filtrada; correção preservando original; isolamento TL-002/B2C; falha de armazenamento com rascunho preservado e tentativa posterior; três temas em 320/390 px. Sem erros JavaScript durante o teste.

Capturas e evidências locais: `.local/previews/coordination-*.png` e `.local/previews/quick-journal-validation.json`.
