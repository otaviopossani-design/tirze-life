# Landing page Tirzelife

Prévia local: http://localhost:8082
Aplicativo demonstrativo: http://localhost:8081

## Executar
Na raiz do projeto:
powershell -ExecutionPolicy Bypass -File .\scripts\start-landing.ps1

Para iniciar também o app, use scripts/start-frontend.ps1. A landing não altera seus dados nem exige novas dependências. O servidor 8082 escuta somente em 127.0.0.1.

## Arquivos
- src/content.mjs: textos, páginas e CTAs.
- src/site.css e src/site.js: aparência e interações acessíveis.
- src/assets/: imagens de telas fictícias do app, marca e imagem social.
- build.mjs: HTML estático e metadados por página.
- site.config.json: domínio, contato, links e controles de lançamento.
- dist/: saída gerada. Não editar manualmente.
- validation.json: resultado das verificações locais de navegador.
- ../../docs/marketing/: estudo, estratégia e calendário de Instagram.

## Configuração atual
publicOrigin está vazio; indexable e launchReady são false.
Os botões abrem a demonstração em localhost. Não há formulário, pedido enviado, cobrança ou rastreador.
Não foi criado site público nem perfil em rede social. Domínio e contato ainda não foram decididos.
A ausência de canonical e sitemap na prévia é intencional: não há URL pública canônica conhecida.

## Para preparar uma publicação
1. Confirmar domínio e contato comercial verdadeiros.
2. Confirmar URL pública e maturidade do aplicativo a ser oferecido.
3. Atualizar identificação da empresa, privacidade, termos, copy e responsabilidades.
4. Configurar publicOrigin com origem HTTPS, appBaseUrl público, contactEmail ou whatsapp.
5. Configurar instagramUrl e googleSiteVerification somente quando reais.
6. Após revisão, ajustar launchReady e indexable para true.
7. Rodar node build.mjs e revisar o dist resultante.
8. Publicar dist em hospedagem HTTPS de arquivos estáticos com 404 real e redirecionamentos consistentes.
9. Aplicar _headers se a hospedagem suportar; ajustar o equivalente quando não suportar.
10. Verificar domínio no Search Console, enviar sitemap e avaliar indexação e dados estruturados.
11. Medir Core Web Vitals de campo e conversões quando houver tráfego e instrumentação apropriada.

O servidor server.mjs é exclusivamente de prévia e sempre envia noindex. Não usá-lo como servidor de produção.
Não ativar indexação como substituto de publicação ou revisão. Não há garantia de ranking ou indexação.
Não há llms.txt obrigatório, FAQ rich result, avaliações fictícias ou preço inventado.

## Verificação
node --test tests/build.test.mjs
node tests/browser-check.cjs

O teste de navegador usa Playwright da cópia de execução do app no Windows, quando disponível.
Verifica nove páginas, títulos/descrições próprios, JSON-LD, dimensões/alternativas de imagens,
links, âncoras, menu, abas, teclado, 320/390px, HTML sem JavaScript, redirecionamento e 404.
Não é um teste oficial do Google nem uma nota Lighthouse. Não mede Core Web Vitals de campo.

## Imagens da demo
Com o aplicativo em execução:
node tests/capture-assets.cjs
node build.mjs

Capturas usam um contexto novo de navegador, com fixtures fictícias. A imagem social é gerada
a partir de HTML/CSS nativos em src/social-card.html. Não há fotos de clientes ou depoimentos.
