# Tirzelife — estudo de SEO, busca com IA e conteúdo
Revisão: 22/10/2026. Escopo: landing page local e plano editorial de 30 dias. Domínio, contato, perfil do Instagram e contas de medição ainda não definidos.

## Conclusão e direção
A base técnica pode ser preparada agora. Indexação, desempenho real na busca, conversões comerciais e horários de melhor resposta dependem de publicação, contas e dados reais. O objetivo é atrair duas intenções distintas: clínicas que querem organizar acompanhamento e pessoas que querem organizar a própria rotina. Não há volumes de busca, CPC, pesquisa de concorrência ou métricas da conta disponíveis; as palavras-chave e os horários abaixo são hipóteses de trabalho.

O produto revisado passou pelos 40 testes de regras e armazenamento e pelo fluxo integrado de cadastro, medidas e movimento. Isso valida a demonstração, não prontidão para produção. A landing apresenta apenas recursos disponíveis e identifica os exemplos fictícios.

## O que as fontes atuais mudam na estratégia

| Evidência verificada | Decisão para a Tirzelife |
|---|---|
| Google recomenda conteúdo que responda à necessidade da pessoa e não promete indexação ou primeira posição. | Páginas distintas para os públicos, descrição precisa do produto e guias úteis; evitar repetição de palavras-chave. [1] |
| Conteúdo confiável deve deixar claras autoria, origem e finalidade. Saúde exige especial cuidado com confiança. | Guias de produto identificados como tal, limites explícitos, fontes onde há orientação e nenhuma revisão médica fictícia. [2] |
| O Google informa que não usa llms.txt para melhorar visibilidade; não há marcação especial obrigatória para suas respostas com IA. | Reutilizar uma boa base de SEO, conteúdo acessível e links; nenhum “arquivo mágico de GEO”. [3] |
| FAQ deixou de aparecer como resultado enriquecido desde 07/05/2026. | Manter dúvidas úteis na interface, sem vender FAQ schema como benefício disponível. [4] |
| Dados estruturados devem representar o conteúdo e ter suporte adequado ao caso. | Organization, WebSite, WebPage, Article e BreadcrumbList. Sem avaliações, preços ou profissionais inventados. [5] |
| Core Web Vitals avaliam carregamento, resposta e estabilidade. Referências: LCP até 2,5 s, INP abaixo de 200 ms e CLS abaixo de 0,1. | HTML pronto, JavaScript pequeno, imagens dimensionadas e sem fontes remotas. Validar campo após publicação; testes locais não certificam esses indicadores. [6] |
| Sitemaps ajudam a apresentar URLs canônicas, sem garantir indexação. | Gerar sitemap somente com domínio confirmado; não publicar URLs de localhost no mapa. [7] |
| Perfil da Empresa depende de elegibilidade; negócios exclusivamente on-line não se qualificam da mesma forma que atendimento presencial. | Não criar uma clínica fictícia ou endereço inventado para o SaaS. Avaliar separadamente estabelecimentos reais. [8] |
| Instagram oferece orientações gerais e personalizadas no painel profissional. | Ajustar cadência e horários à capacidade de produção e aos Insights da conta. [9] |
| Trial Reels permitem testar com não seguidores, quando disponíveis. | Usar opcionalmente para comparar abordagens; não tratar como garantia de alcance. [10] |
| Meta prioriza conteúdo original frente a cópias idênticas em recomendações. | Gravar demonstrações próprias, fotos reais autorizadas e evitar repostagens sem contribuição. [11] |

SEO, AEO e GEO não são botões separados que garantem presença. A implementação cobre a base aplicável ao site. Google Ads é outra frente; não foi configurado. As sugestões de formatos e calendário são decisões editoriais para teste, não regras de classificação da Meta.

## Arquitetura e intenção de busca

| Página | Necessidade atendida | Hipótese de busca principal | Próximo passo |
|---|---|---|---|
| / | Entender a proposta | Tirzelife; plataforma de acompanhamento de rotina | Escolher clínica ou paciente |
| /clinicas/ | Avaliar o fluxo de equipe | plataforma para acompanhamento de pacientes; plano alimentar e registros | Abrir demo da clínica |
| /pacientes/ | Conhecer a jornada pessoal | aplicativo de alimentação e movimento; registro de peso e atividades | Cadastro demonstrativo |
| /conteudos/ | Encontrar explicações úteis | guias de acompanhamento de rotina | Ler guia |
| /conteudos/acompanhamento-entre-consultas/ | Organizar informação entre encontros | acompanhamento entre consultas | Conhecer fluxo clínico |
| /conteudos/diario-alimentar-sem-culpa/ | Entender registro alimentar | diário alimentar; registro de refeições | Explorar plano |
| /conteudos/registro-de-peso-e-movimento/ | Interpretar registros do produto | histórico de peso; registro de atividade física | Explorar movimento |
| /sobre/ | Entender responsabilidade e maturidade | sobre Tirzelife | Conhecer limites |
| /privacidade/ | Entender a demonstração local | privacidade Tirzelife | Usar apenas dados fictícios |

Não foram criadas páginas em massa para cada dose, medicamento ou cidade. A dose não gera uma prescrição no aplicativo; uma página “dieta perfeita para dose X” seria incoerente com o produto e exigiria fundamento clínico que não existe nesta entrega. Conteúdos sobre medicamentos ou nutrição clínica deverão ser planejados separadamente com responsável real, fontes e revisão.

## Implementado na landing page

- HTML estático por URL, legível sem JavaScript; conteúdo principal não depende de hidratação.
- Títulos e descrições próprios, idioma pt-BR, hierarquia de títulos e links entre páginas.
- URLs descritivas, navegação de contexto e uma página 404 com status HTTP 404 no servidor local.
- Canonical absoluto condicionado ao domínio; preview não inventa domínio.
- Robots meta e cabeçalho noindex na prévia; robots.txt permite leitura do noindex.
- Sitemap XML gerado apenas no modo de indexação configurado.
- JSON-LD dos tipos coerentes com o conteúdo. Nenhuma nota, review ou oferta de preço fictícios.
- Open Graph e Twitter Card, imagem própria 1200 × 630 e ícone da marca.
- Capturas reais de telas com dados fictícios, descrição alternativa, dimensões corretas e carregamento adiado fora do topo.
- CSS e JavaScript locais; sem fontes remotas, biblioteca pesada, cookies de publicidade ou rastreadores.
- Layout responsivo, links de salto, foco visível, menu com Escape e abas operáveis por teclado.
- Botões reais para a demonstração. Sem formulário que finja enviar um lead.
- Eventos locais com nomes de CTA fixos, sem enviar dados. Não são Analytics ou Pixel instalados.
- Domínio, WhatsApp, e-mail, Instagram e verificação do Search Console configuráveis.
- Validação impede ativar indexação sem domínio HTTPS, contato real, endereço público do aplicativo e revisão de lançamento.

O servidor local sempre envia noindex, mesmo ao visualizar uma compilação com configuração de produção. Isso é proposital. A publicação deverá usar hospedagem HTTPS apropriada para arquivos estáticos, aplicar cabeçalhos e garantir redirecionamentos e 404 reais.

## O que depende do lançamento

| Item | Estado | Ação necessária |
|---|---|---|
| Domínio e endereço público do app | A definir | Escolher, registrar e apontar DNS/HTTPS |
| Contato e identificação da empresa | A definir | Confirmar informações e atualizar páginas |
| Login, contas e infraestrutura do app | Fora da demo | Concluir antes de cadastrar pessoas reais |
| Privacidade e termos de produção | Pendentes | Revisar com responsáveis reais e conforme coleta efetiva |
| Captação de leads | Não instalada | Definir destino, dados mínimos, responsabilidades e confirmação de entrega |
| Search Console | Não conectado | Verificar domínio via DNS ou token; inspecionar páginas e enviar sitemap |
| Indexação | Desativada localmente | Liberar somente o site público revisado |
| Analytics/Pixel | Não instalados | Definir finalidade e implementação antes de ativar; nunca enviar dados de saúde em eventos |
| Core Web Vitals de campo | Não medidos | Avaliar PageSpeed/CrUX/Search Console quando houver tráfego |
| Resultados enriquecidos | Não garantidos | Validar marcação pública com ferramentas do Google |
| Redirecionamentos | Dependem da hospedagem | Forçar HTTPS e uma versão de domínio; preservar caminhos |
| Autoridade e menções | Contínuo | Publicar conteúdo original, fontes e colaborações legítimas |
| SEO de vídeos | Sem vídeos públicos | Só adicionar VideoObject/sitemap de vídeo quando existir vídeo real e acessível |
| SEO internacional | Não aplicável agora | Não adicionar hreflang sem versões equivalentes |
| Google Shopping/receitas/vagas | Não aplicável | Não usar marcação para recursos que o produto não oferece |
| SEO local | Condicional | Somente empresa/estabelecimento elegível com dados verdadeiros |

## Medição sugerida
Antes da publicação, usar o checklist técnico. Depois dela, avaliar separadamente clínica e paciente. Indicadores: páginas indexadas, consultas relevantes, impressões, cliques, CTR, visitas às páginas de público, cliques na demonstração e contatos efetivamente entregues. Clique em CTA não é lead, cadastro não é venda, e registro de saúde não deve ir para Analytics.

Para redes sociais, comparar medianas de conteúdos do mesmo formato e público. Acompanhar alcance, visualizações, tempo médio de exibição quando disponível, compartilhamentos, salvamentos, visitas ao perfil e cliques. Revisar em 14 e 30 dias; não tirar conclusões de um único post.

## Fontes primárias consultadas
1. [Google — SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
2. [Google — Helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
3. [Google — Optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
4. [Google — Changelog, descontinuação de FAQ em maio de 2026](https://developers.google.com/search/updates)
5. [Google — Introdução a dados estruturados](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
6. [Google — Core Web Vitals](https://developers.google.com/search/docs/appearance/core-web-vitals)
7. [Google — Criar e enviar sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
8. [Google — Qualificação para Perfil da Empresa](https://support.google.com/business/answer/13763036?hl=pt-BR)
9. [Meta — Best Practices no painel profissional](https://about.fb.com/news/2024/10/best-practices-education-hub-creators-instagram/)
10. [Meta — Trial Reels](https://about.fb.com/news/2024/12/trial-reels-try-content-non-followers-first-see-what-perfoms-best/)
11. [Meta — Conteúdo original e novas audiências](https://about.fb.com/ltam/news/2024/05/ayudando-a-los-creadores-a-encontrar-nuevas-audiencias/)

## Limites do estudo
Pesquisa documental, não auditoria de uma propriedade pública ou de uma conta conectada. Não foram acessados Search Console, Analytics ou Insights do usuário. A referência de formatos da Meta para anúncios não foi usada para afirmar desempenho orgânico. Algumas páginas de ajuda e documentos antigos redirecionaram; as conclusões usam páginas oficiais acessíveis em 22/10/2026. A documentação nova de IA pode mostrar relatórios diferentes da página geral antiga: verificar as opções efetivamente disponíveis na conta, sem prometer acesso a um relatório.


## Identidade e novos canais ? 22/10/2026

A identidade agora usa a mesma paleta azul na landing, paciente e clinica, com fonte Inter local e temas Claro, Escuro e Suave. Consulte o [guia visual](../brand/index.html), o [guia de identidade](../brand/identidade-e-experiencia.md) e o [plano atualizado para Google, Instagram, Facebook e TikTok](plano-google-instagram-facebook-tiktok.md). A extensao editorial esta no [calendario multicanal](calendario-multicanal-30-dias.md). As regras de dominio, indexacao e contas pendentes continuam aplicaveis.
