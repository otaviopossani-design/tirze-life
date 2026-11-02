# Tirzelife — identidade e experiência
Revisão: 22/10/2026. Direção aplicada à demonstração web; ainda precisa de validação com clínicas e pacientes.

## Posicionamento
Uma plataforma para aproximar a rotina do paciente do acompanhamento da equipe. Clareza, acolhimento, continuidade e confiança orientam as decisões. O sistema de marca é compartilhado pela landing, paciente e clínica. A organização das telas muda conforme a tarefa.

A escolha do azul dá continuidade ao produto existente. Não é uma afirmação de que uma cor causa confiança, melhora saúde ou aumenta conversão. A adequação deve ser observada em testes.

## Paleta e funções
| Cor | Valor | Aplicação |
|---|---|---|
| Azul profundo | #172E45 | Texto e superfícies institucionais |
| Azul principal | #0369A1 | Ação principal e seleção em fundos claros |
| Azul de destaque | #38BDF8 | Ação e seleção no tema escuro |
| Fundo claro | #F8FAFC | Leitura e espaço entre componentes |
| Texto secundário | #52677E | Explicações em superfícies claras |
| Verde | #0F766E | Confirmação acompanhada de texto |
| Âmbar | #92400E | Atenção acompanhada de texto |
| Vermelho | #B91C1C | Erro acompanhado de texto |

Temas: Claro, Escuro e Suave. O tema Suave mantém o azul e altera apenas as superfícies. Guardar a preferência de cada área, sem sobrescrever uma escolha anterior. O padrão de uma nova sessão sem preferência é Claro. Não usar cores de estado como diagnóstico; ausência de registro não significa ausência de cuidado.

Fonte única de valores: [brand-tokens.json](../../design/brand-tokens.json).
Gerar os arquivos com `node scripts/build-brand.mjs`; os scripts de início já executam essa etapa. Arquivos gerados: brand.css nos dois apps, símbolo SVG, fontes e licença. Não editar as cópias geradas manualmente.

## Tipografia
Inter variável, versão 4.1, servida pelo próprio site. Pesos 400 para texto, 500 para controles e 600 para títulos; números comparáveis podem usar algarismos tabulares. Licença SIL OFL incluída. Fonte de sistema como alternativa de carregamento; font-display: swap.

Texto de leitura da landing: 16–17 px; formulários do app: 16 px; controles principais: 14–16 px. Legendas compactas não devem conter uma orientação indispensável. Títulos precisam quebrar naturalmente, com acentos preservados, sem imagens de texto no produto.

Fonte oficial: [Inter](https://rsms.me/inter/) e [licença da versão](https://github.com/rsms/inter/blob/v4.1/LICENSE.txt).

## Navegabilidade
- Landing: escolher entre clínica e paciente, entender a proposta e abrir uma demonstração real.
- Paciente: acessar plano, registrar rotina, consultar evolução e editar cadastro.
- Clínica: encontrar paciente, revisar contexto, abrir plano e acompanhar registros.
- Usar os mesmos termos em menus, títulos e materiais sociais.
- Identificar o item selecionado por texto/forma, além da cor.
- Manter foco visível e link de salto para o conteúdo; Escape fecha os controles que já oferecem essa interação.
- Preferir controles com pelo menos 44 px de altura. Essa é a meta interna de conforto; a WCAG 2.2 AA tem critério de 24 × 24 CSS px com condições e exceções.
- Preservar navegação móvel, rótulos acessíveis e proteção de alterações não salvas.
- Mostrar confirmação apenas quando a ação de fato ocorreu. Dados e recursos demonstrativos devem continuar identificados.

## Critérios de qualidade
Texto comum: contraste mínimo 4,5:1; texto grande: 3:1 conforme a definição WCAG. Não confundir contraste de pares selecionados com certificação de acessibilidade de todo o produto. Avaliar também teclado, zoom de 200%, leitor de tela, erros de formulário e conteúdo real.

Validar desktop e celulares de 320 e 390 px, inclusive telas longas e navegação inferior. Tabelas podem ter rolagem interna identificável. Não permitir perda de conteúdo ou rolagem horizontal de toda a página.

Referências: [contraste W3C](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum), [alvos W3C](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Como provar melhoria
Observar de cinco a oito pessoas representativas como rodada inicial de pesquisa qualitativa, não como amostra estatística: localizar o plano, registrar uma atividade, encontrar um paciente e identificar se algo foi salvo. Medir conclusão sem ajuda, erros, tempo e dúvidas. Comparar uma mudança de cada vez.

Metas de lançamento: nenhum bloqueio nos fluxos principais; informações de demonstração inequívocas; fonte carregada; leitura e contraste revisados; tarefas essenciais possíveis por teclado. Ainda é necessária avaliação com usuários e tecnologias assistivas.

## Materiais
[Guia visual](index.html) · [Plano para os quatro canais](../marketing/plano-google-instagram-facebook-tiktok.md).
Os modelos sociais são rascunhos de divulgação da proposta, não publicações ou anúncios. Não contêm pacientes reais, resultados clínicos ou depoimentos inventados.
