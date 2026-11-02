# Especificação de Produto e Arquitetura: App Companion GLP-1/GIP (Projeto Tirze-Life)

## 1. Visão Geral do Produto e Diferencial de Mercado

* **Objetivo:** Ser o copiloto metabólico e comportamental diário para pacientes em tratamento com medicamentos agonistas de GLP-1/GIP (como Mounjaro/tirzepatida e Ozempic/semaglutida).
* **Proposta de Valor:** Proteger o alto investimento financeiro do paciente maximizando a perda de gordura, prevenindo a perda de massa magra (sarcopenia) e minimizando efeitos colaterais gastrointestinais através do cruzamento inteligente entre farmacocinética e rotina real.
* **O Grande Diferencial ("Modo Vida Real" / Filosofia Zero Culpa):** Aplicativos tradicionais de dieta falham com usuários de tirzepatida porque focam em restrição calórica e punição visual (alertas vermelhos quando o usuário sai da dieta). Este aplicativo opera na lógica inversa:
  1. **Nutrição Reversa:** Garante o piso mínimo de proteínas e água para quem está sem apetite.
  2. **Acolhimento Inteligente:** Quando o usuário consome álcool (ex: 4 cervejas) ou bebidas gaseificadas, o app valida o controle da compulsão (parar quando saciado) e recalcula a rota hidroeletrolítica e digestiva sem julgamentos.

---

## 2. Estrutura de Telas (Fluxo de Navegação / UI)

O aplicativo é estruturado em **4 abas principais** na barra inferior (Bottom Navigation Bar), precedidas por um fluxo de configuração anatômica e clínica.

### 2.1. Fluxo de Onboarding (Primeiro Acesso)

1. **Boas-vindas e Compliance:** Aceite da LGPD e aviso legal de que o aplicativo é uma ferramenta de bem-estar e acompanhamento, não substituindo a prescrição médica.
2. **Perfil Clínico e Biotipo Anatômico:**
   * Peso atual, altura, meta de peso e sexo biológico.
   * **Mapeamento de Gordura Subcutânea:** Pergunta específica se o usuário possui baixa camada de gordura nas coxas (coxas mais firmes/musculosas). Se marcado como "Sim", o sistema desativa automaticamente as coxas do mapa de rodízio para evitar injeções intramusculares acidentais e perda do "efeito esponja".
3. **Configuração da Medicação:** Medicamento em uso, dose atual ($2,5\text{ mg}$, $5,0\text{ mg}$, $7,5\text{ mg}$, $10\text{ mg}$, $12,5\text{ mg}$ ou $15\text{ mg}$), dia da semana e horário habitual de aplicação.
4. **Cálculo Automático de Metas:**
   * **Meta de Proteína:** $1,6\text{ g}$ a $2,0\text{ g}$ por kg de peso ideal/ajustado.
   * **Meta de Hidratação Base:** $35\text{ ml}$ por kg de peso corporal.

### 2.2. Aba 1: Home (Dashboard Diário)

* **Anel de Concentração Farmacocinética:** Mostra em tempo real a estimativa de medicação ativa circulando no sangue (baseada na meia-vida de $120\text{ horas}$) e a fase atual do ciclo (ex: *"Dia 2 pós-aplicação: Pico de ação no organismo — esvaziamento gástrico lento"*).
* **Painel de Nutrição Reversa:** Dois indicadores visuais de progresso diário:
  * **Piso de Proteína:** Gramas consumidos versus meta mínima para preservar músculos.
  * **Meta de Água Dinâmica:** Volume ingerido versus meta do dia (que se ajusta automaticamente caso o usuário registre eventos no "Modo Vida Real").
* **Botão de Ação Rápida (+):** Registro com 1 toque para água, porções rápidas de proteína, sintomas ou ativação do "Modo Vida Real" (ex: cerveja, refrigerante zero, refeição livre).

### 2.3. Aba 2: Injeção e Rodízio (Mapa Corporal Inteligente)

* **Avatar Anatômico Interativo:** Silhueta com zonas seguras de aplicação subcutânea:
  * Abdômen Superior Direito / Inferior Direito.
  * Abdômen Superior Esquerdo / Inferior Esquerdo.
  * Coxa Frontal Direita / Esquerda (ocultadas se o usuário configurou baixa gordura periférica).
  * Braço Posterior Direito / Esquerdo.
* **Guia Visual da Regra dos 4 Dedos:** Ao selecionar o abdômen, a interface exibe uma zona de exclusão central equivalente a 4 dedos ($\approx 8\text{ a } 10\text{ cm}$) ao redor do umbigo, orientando a aplicação na camada adiposa lateral mais macia e evitando tecido fibroso ou vasinhos superficiais.
* **Semáforo de Rodízio:**
  * **Vermelho (Em descanso):** Último local aplicado (bloqueado na semana atual).
  * **Amarelo (Atenção):** Penúltimo local aplicado.
  * **Verde (Recomendado):** Lado oposto livre para garantir absorção perfeita e evitar lipodistrofia.
* **Histórico da "Escadinha" de Doses:** Linha do tempo registrando as semanas em cada dosagem ($2,5\text{ mg} \rightarrow 5,0\text{ mg} \rightarrow 7,5\text{ mg}$).

### 2.4. Aba 3: Modo Vida Real, Sintomas e Gatilhos

* **Registro "Modo Vida Real" (Sem Culpa):**
  * Registro rápido de bebidas e alimentos sociais (*Cerveja/Álcool*, *Água com gás / Refrigerante Zero*, *Fritura/Gordura*, *Doces*).
  * Seletor de percepção comportamental: *"Era vontade genuína e parei quando saciei"* vs. *"Senti impulso/ansiedade"*.
* **Termômetro de Sintomas (Escala de 1 a 5):**
  * Náusea / Enjoo.
  * Azia / Refluxo.
  * Estufamento / Sensação de gás retido.
  * Trânsito Intestinal (Constipação / Diarreia).
  * Controle do "Ruído Mental" (vontade de beliscar).

### 2.5. Aba 4: Evolução e Relatório Médico (PDF)

* **Gráfico de Eficiência Clínica:** Curva de perda de peso sobreposta aos degraus de dosagem e à média de ingestão proteica.
* **Cards de Inteligência Preditiva:** Padrões identificados no mês (ex: correlação entre bebidas gaseificadas nos primeiros 2 dias pós-injeção e sensação de estufamento).
* **Exportação de Relatório para Consulta:** Gera um documento PDF formatado em padrão A4 de 1 página com resumo de adesão, curva de peso e eventos adversos para enviar ao médico via WhatsApp.

---

## 3. Escopo Detalhado e Regras de Negócio por Módulo

| Módulo | Funcionalidades Core | Regras de Negócio e Algoritmos |
| :--- | :--- | :--- |
| **M1: Gestão de Aplicação e Farmacocinética** | Mapa de rodízio com regra dos 4 dedos, bloqueio de áreas sem gordura, lembretes via push e curva de meia-vida. | Calcular decaimento exponencial ($t_{1/2} = 120\text{ h}$). Travar sugestão do mesmo quadrante anatômico na semana seguinte. |
| **M2: Nutrição Reversa** | Adição de proteínas por medidas visuais ("1 filé = $30\text{ g}$", "1 scoop whey = $24\text{ g}$") e contador inteligente de água. | Se atingir menos de $50\%$ da água até as 16h, enviar alerta suave prevenindo dor de cabeça e fadiga. |
| **M3: Motor "Modo Vida Real" e Sintomas** | Acolhimento de exceções alimentares/sociais e cruzamento com o dia do ciclo da injeção. | Para cada unidade de álcool (ex: 1 lata de cerveja), somar $+250\text{ ml}$ na meta de água do dia e emitir orientação postural/digestiva se estiver no pico da medicação. |
| **M4: Analytics e PDF Médico** | Compilação estatística de sintomas, peso e evolução de doses. | Exigir confirmação de prescrição médica ao alterar a dose no app para manter conformidade regulatória. |

---

## 4. Como os Módulos Interagem (Cenários Reais do Sistema)

### Cenário 1: O Usuário Bebe Cerveja no Dia $D+4$ (Meio de Ciclo)
1. **Entrada (M3):** O usuário registra 4 cervejas na quinta-feira (4 dias após a injeção de domingo) e marca que parou porque a vontade passou.
2. **Processamento (M1 + M3):** O motor verifica que no $D+4$ a concentração da dose de $2,5\text{ mg}$ já começou a cair, explicando o retorno natural do desejo.
3. **Saída de Acolhimento e Ajuste (M2):**
   * Exibe mensagem positiva destacando o funcionamento do freio químico cerebral (parar na 4ª cerveja mesmo tendo mais na geladeira).
   * Adiciona automaticamente $+1000\text{ ml}$ ($4 \times 250\text{ ml}$) à meta de hidratação da noite no Módulo 2 para proteger os rins e evitar ressaca ou hipoglicemia noturna.

### Cenário 2: Uso de Água com Gás / Refrigerante Zero para Saciedade no Pico ($D+1$)
1. **Entrada (M2/M3):** O usuário registra consumo de bebida gaseificada 24h após a aplicação da tirzepatida.
2. **Processamento (M1 + M3):** O sistema detecta que o esvaziamento gástrico está na velocidade mínima (pico sérico).
3. **Saída Preventiva:** O app valida que o gás ajuda na saciedade mecânica, mas recomenda beber em goles pequenos e monitorar caso surja estufamento excessivo ou refluxo.

---

## 5. Arquitetura Tecnológica e Hospedagem

* **Frontend Mobile (iOS e Android):**
  * *React Native (com Expo)* + *TypeScript* + *NativeWind (Tailwind CSS)*.
  * Gerenciamento de Estado: *Zustand* com persistência local criptografada.
* **Backend, Banco de Dados e Autenticação:**
  * *Supabase (PostgreSQL)* com *Row Level Security (RLS)* ativado por usuário, ou *Google Cloud Platform (Firebase + Cloud Run)*.
* **Motor Analítico e Relatórios:**
  * Microsserviço em *Python (FastAPI + Pandas)* para cruzamento de séries temporais (sintomas vs. curva da droga) e geração de PDFs limpos.

---

## 6. Modelo de Negócios e Precificação (SaaS / Freemium)

* **Plano Gratuito (Atração e Retenção Base):**
  * Lembrete semanal de aplicação, Mapa Corporal com Regra dos 4 Dedos e registro simples de peso.
* **Plano PRO (Assinatura):**
  * Motor "Modo Vida Real" com ajuste dinâmico de hidratação, Curva Farmacocinética hora a hora, Rastreador de Nutrição Reversa (Proteína/Água), Cruzamento de Gatilhos e Exportação de PDF para o Médico.
* **Preços Sugeridos:**
  * **Mensal:** R\$ 29,90 / mês.
  * **Trimestral:** R\$ 69,90 (focado nos 3 primeiros meses de adaptação de doses).
  * **Anual:** R\$ 149,90 / ano ($\approx$ R\$ 12,49 / mês).

---

## 7. Conformidade Legal (Anvisa e LGPD)

1. **Isenção de SaMD (Software como Dispositivo Médico - Anvisa):** O aplicativo atua exclusivamente no registro de rotina, suporte comportamental e organização de dados. Ele não realiza diagnósticos e exige uma caixa de confirmação (*"Esta dosagem foi prescrita pelo meu médico"*) sempre que o usuário altera os miligramas da caneta.
2. **Privacidade e LGPD:** Criptografia em trânsito e em repouso para dados sensíveis de saúde, com função nativa de exportação e exclusão total e imediata da conta (*Right to be Forgotten*) exigida pela Apple App Store e Google Play.