# Regras para Agentes de IA (Antigravity, OpenCode & VS Code GPT)

## Protocolo Não-Destrutivo
- Preserve 100% da lógica e nomes de variáveis existentes.
- Não faça refatorações não solicitadas.
## Protocolo de Memória Persistente (.context/)
Antes de iniciar qualquer análise ou codificação neste projeto:
1. **Consulte a memória:** Leia .context/MEMORY.md para entender a stack e o estado atual.
2. **Consulte as lições:** Leia .context/lessons.md para não repetir bugs ou erros passados.
3. **Consulte as tarefas:** Leia .context/todo.md para saber exatamente o que está pendente.

## Fechamento de Sessão (/save)
Ao finalizar qualquer tarefa ou quando o usuário disser "/save" ou "salva":
- Atualize .context/todo.md marcando o que foi feito.
- Registre em .context/lessons.md qualquer correção ou detalhe técnico aprendido.
- Atualize .context/MEMORY.md com as novas decisões ou endpoints criados.
