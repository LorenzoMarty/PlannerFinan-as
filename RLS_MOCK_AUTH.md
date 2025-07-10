# RLS Mock Authentication

Este sistema de mocks foi criado para garantir que as policies RSL (Row Level Security) do Supabase funcionem corretamente durante o desenvolvimento.

## O que foi implementado

### 1. Sistema de Mock de Autenticação (`src/lib/auth-mock.ts`)

- **Usuários mock disponíveis:**

  - `demo@plannerfin.com` (senha: 123456)
  - `admin@plannerfin.com` (senha: admin123)

- **Funcionalidades:**
  - `setupMockAuthentication()`: Configura autenticação automática
  - `ensureAuthenticated()`: Garante que há uma sessão ativa antes das operações
  - `getCurrentMockUser()`: Retorna o usuário mock atual

### 2. Integração com SupabaseDataService

- Todas as operações do banco agora verificam a autenticação antes de executar
- A função `shouldUseSupabase()` foi atualizada para incluir verificação de autenticação
- Garante que as policies RLS tenham um usuário autenticado para avaliar

### 3. Integração com UserDataContext

- Configuração automática de mock authentication durante a inicialização
- Compatibilidade mantida com o sistema existente de localStorage

### 4. Utilitários de Teste (`src/lib/test-rls.ts`)

- **`testRLSPolicies()`**: Executa testes completos das policies RLS
- **`checkRLSStatus()`**: Verifica rapidamente o status da autenticação e permissões
- Testes automáticos em modo de desenvolvimento

### 5. Componente de Status (`src/components/layout/RLSStatus.tsx`)

- Indicador visual do status das policies RLS
- Botões para testar e reconfigurar autenticação
- Integrado no cabeçalho da aplicação

## Como usar

### Automático (Recomendado)

O sistema é configurado automaticamente quando a aplicação inicia. Você verá no console:

```
🚀 Mock authentication auto-setup completed
🔒 RLS Status: { authenticated: true, canRead: true, canWrite: true }
✅ RLS is working correctly
```

### Manual

Se precisar configurar manualmente:

```typescript
import { setupMockAuthentication } from "@/lib/auth-mock";

// Configurar com usuário específico
await setupMockAuthentication("demo@plannerfin.com");

// Ou usar o usuário padrão
await setupMockAuthentication();
```

### Testando RLS

```typescript
import { testRLSPolicies } from "@/lib/test-rls";

// Executar teste completo
const success = await testRLSPolicies();
```

## Indicadores Visuais

No cabeçalho da aplicação, você verá:

- **Badge verde "RLS OK"**: Policies funcionando corretamente
- **Badge vermelho "RLS Issues"**: Problemas detectados
- **Botão de refresh**: Para re-verificar o status

## Resolução de Problemas

### ⚠️ **PROBLEMA PRINCIPAL: Usuário sem permissão de escrita**

Se você está vendo que "o usuário não tem permissão de escrever", siga estes passos:

#### 1. **Execute o SQL de correção no Supabase:**

```sql
-- Cole e execute o arquivo 'supabase-rls-write-permissions.sql' no SQL Editor do Supabase
```

#### 2. **Use as ferramentas de diagnóstico no navegador:**

- Abra o console do navegador (F12)
- Use os botões no indicador RLS no cabeçalho:
  - **"Diagnose"**: Identifica problemas específicos
  - **"Repair"**: Tenta corrigir automaticamente
  - **"Test RLS"**: Verifica se tudo está funcionando

#### 3. **Comandos manuais no console:**

```javascript
// Diagnosticar problemas
import {
  diagnoseRLSIssues,
  displayDiagnostics,
} from "./src/lib/rls-diagnostics";
const results = await diagnoseRLSIssues();
displayDiagnostics(results);

// Tentar reparar automaticamente
import { repairRLSIssues } from "./src/lib/rls-diagnostics";
await repairRLSIssues();

// Configurar autenticação manualmente
import { setupMockAuthentication } from "./src/lib/auth-mock";
await setupMockAuthentication();
```

### Mensagens comuns e soluções:

- **`❌ Profile creation failed`**: Execute o SQL de permissões RLS
- **`❌ Budget creation failed`**: Verifique se user_profiles existe
- **`⚠️ Could not establish authentication`**: Use "Setup Auth"
- **`❌ No authenticated session found`**: Verifique configuração do Supabase
- **`Permission denied`**: Execute `supabase-rls-write-permissions.sql`

## Compatibilidade

Este sistema mantém total compatibilidade com:

- Sistema existente de localStorage
- Fluxo de login/logout normal
- Usuários demo existentes
- Fallback para modo offline

## Políticas RLS Suportadas

O sistema funciona com ambos os tipos de políticas:

1. **Strict policies** (supabase-setup.sql): Usuários só acessam seus próprios dados
2. **Permissive policies** (supabase-setup-fixed.sql): Usuários autenticados acessam todos os dados

## Desenvolvimento

Para debuggar ou modificar o comportamento:

1. **Ver logs detalhados**: Abra o console do navegador
2. **Testar policies**: Use `testRLSPolicies()` no console
3. **Verificar usuário atual**: Use `getCurrentMockUser()` no console
4. **Forçar reautenticação**: Use `setupMockAuthentication()` no console

---

**Nota**: Este sistema é projetado para desenvolvimento. Em produção, use sempre autenticação real do Supabase.
