# Guia Completo do Supabase no Fusion Starter

Este documento explica como o Supabase está integrado e configurado no projeto Fusion Starter, incluindo conexão, autenticação, operações de dados e melhores práticas.

## 📋 Índice

1. [Configuração Inicial](#configuração-inicial)
2. [Conexão com Supabase](#conexão-com-supabase)
3. [Autenticação](#autenticação)
4. [Estrutura de Dados](#estrutura-de-dados)
5. [Operações CRUD](#operações-crud)
6. [Políticas RLS (Row Level Security)](#políticas-rls)
7. [Integração com React](#integração-com-react)
8. [Fallback para Armazenamento Local](#fallback-para-armazenamento-local)
9. [Migração de Dados](#migração-de-dados)
10. [Monitoramento e Status](#monitoramento-e-status)

## 🔧 Configuração Inicial

### Variáveis de Ambiente

O projeto utiliza duas variáveis de ambiente essenciais para conectar com o Supabase:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Estas variáveis devem ser configuradas no arquivo `.env` na raiz do projeto.

### Instalação de Dependências

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.50.0"
  }
}
```

## 🔌 Conexão com Supabase

### Configuração do Cliente (`src/lib/supabase.ts`)

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validação das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidos no .env",
  );
}

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Mantém sessão persistente
    autoRefreshToken: true, // Renova token automaticamente
    detectSessionInUrl: false, // Não detecta sessão na URL
  },
  db: {
    schema: "public", // Schema padrão
  },
  global: {
    headers: {
      "x-client-info": "fusion-starter@1.0.0", // Identificação do cliente
    },
  },
});
```

### Funções de Autenticação Básicas

```typescript
// Login com email e senha
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

// Registro de usuário
export const signUp = async (
  email: string,
  password: string,
  name?: string,
) => {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name || "",
      },
    },
  });
};

// Obter sessão atual
export const getSession = async () => {
  return supabase.auth.getSession();
};
```

## 🔐 Autenticação

### Processo de Login

1. **Validação no Frontend**: Campos de email e senha são validados
2. **Chamada para Supabase**: Utiliza `signInWithPassword()`
3. **Gestão de Sessão**: Session é automaticamente persistida
4. **Redirecionamento**: Usuário é redirecionado para o dashboard

### Processo de Registro

1. **Coleta de Dados**: Email, senha e nome (opcional)
2. **Criação de Conta**: Utiliza `signUp()`
3. **Dados Adicionais**: Nome é armazenado nos metadados do usuário
4. **Confirmação**: Usuário pode precisar confirmar email (dependendo da configuração)

### Verificação de Autenticação

```typescript
// Verificar se há uma sessão ativa
const checkAuthAndRedirect = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    // Usuário autenticado
    navigate("/dashboard");
  }
};
```

## 🗄️ Estrutura de Dados

### Tabelas Principais

O projeto utiliza as seguintes tabelas no Supabase:

#### 1. `user_profiles`

```sql
-- Perfis de usuário
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  bio TEXT,
  phone TEXT,
  location TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 2. `budgets`

```sql
-- Orçamentos
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES user_profiles(id),
  collaborators UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 3. `budget_entries`

```sql
-- Entradas de orçamento
CREATE TABLE budget_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  budget_id UUID NOT NULL REFERENCES budgets(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### 4. `categories`

```sql
-- Categorias
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## 📊 Operações CRUD

### Classe de Serviço (`src/services/SupabaseDataService.ts`)

A classe `SupabaseDataService` centraliza todas as operações com o banco de dados:

#### Verificação de Conectividade

```typescript
static async checkTablesAvailability(): Promise<boolean> {
  try {
    // Testa acesso à tabela user_profiles
    const { error } = await supabase
      .from("user_profiles")
      .select("id")
      .limit(1);

    return !error;
  } catch (error) {
    return false;
  }
}
```

#### Operações de Perfil de Usuário

```typescript
// Criar perfil de usuário
static async createUserProfile(profile: Omit<UserProfile, "budgets" | "categories" | "activeBudgetId">): Promise<boolean> {
  // Verificar sessão válida
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) return false;

  // Verificar se perfil já existe
  const { data: existing } = await supabase
    .from("user_profiles")
    .select("id")
    .eq("id", profile.id)
    .maybeSingle();

  if (existing) return true;

  // Criar novo perfil
  const { error } = await supabase.from("user_profiles").insert({
    id: profile.id,
    email: profile.email,
    name: profile.name,
  });

  return !error;
}

// Buscar perfil completo do usuário
static async getUserProfile(userId: string): Promise<UserProfile | null> {
  // Buscar perfil
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) return null;

  // Buscar orçamentos (proprietário ou colaborador)
  const { data: budgets } = await supabase
    .from("budgets")
    .select("*")
    .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`);

  // Buscar categorias
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId);

  // Buscar entradas de orçamento
  const budgetIds = budgets?.map((b) => b.id) || [];
  const { data: entries } = budgetIds.length > 0
    ? await supabase
        .from("budget_entries")
        .select("*")
        .in("budget_id", budgetIds)
    : { data: [] };

  // Construir objeto UserProfile completo
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    budgets: budgets?.map(budget => ({
      // ... mapeamento completo
    })) || [],
    categories: categories?.map(cat => ({
      // ... mapeamento completo
    })) || [],
    activeBudgetId: budgets?.[0]?.id || "",
  };
}
```

#### Operações de Orçamento

```typescript
// Criar orçamento
static async createBudget(budget: Omit<Budget, "entries" | "createdAt" | "updatedAt">): Promise<boolean> {
  const { error } = await supabase.from("budgets").insert({
    id: budget.id,
    name: budget.name,
    code: budget.code,
    owner_id: budget.ownerId,
    collaborators: budget.collaborators,
  });

  return !error;
}

// Criar entrada de orçamento
static async createBudgetEntry(entry: Omit<BudgetEntry, "id">): Promise<string | null> {
  // Verificar sessão
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const entryId = this.generateId();
  const { data, error } = await supabase
    .from("budget_entries")
    .insert({
      id: entryId,
      date: entry.date,
      description: entry.description,
      category: entry.category,
      amount: entry.amount,
      type: entry.type,
      user_id: entry.userId,
      budget_id: entry.budgetId,
    })
    .select("id")
    .single();

  return error ? null : data.id;
}
```

## 🔒 Políticas RLS (Row Level Security)

### Conceito

O RLS (Row Level Security) garante que usuários só acessem dados aos quais têm permissão. Cada consulta é automaticamente filtrada com base na política definida.

### Políticas Implementadas

As políticas RLS foram otimizadas para fornecer permissões granulares e específicas para cada operação (SELECT, INSERT, UPDATE, DELETE).

#### Para `user_profiles`:

```sql
-- Usuários podem gerenciar seus próprios perfis
CREATE POLICY "user_profiles_select_own" ON user_profiles
    FOR SELECT TO authenticated
    USING (auth.uid()::text = id);

CREATE POLICY "user_profiles_insert_own" ON user_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = id);

CREATE POLICY "user_profiles_update_own" ON user_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = id)
    WITH CHECK (auth.uid()::text = id);

CREATE POLICY "user_profiles_delete_own" ON user_profiles
    FOR DELETE TO authenticated
    USING (auth.uid()::text = id);
```

#### Para `budgets`:

```sql
-- Usuários podem gerenciar orçamentos que possuem ou colaboram
CREATE POLICY "budgets_select_accessible" ON budgets
    FOR SELECT TO authenticated
    USING (
        auth.uid()::text = owner_id OR
        auth.uid()::text = ANY(collaborators)
    );

CREATE POLICY "budgets_insert_own" ON budgets
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "budgets_update_own" ON budgets
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = owner_id)
    WITH CHECK (auth.uid()::text = owner_id);

CREATE POLICY "budgets_delete_own" ON budgets
    FOR DELETE TO authenticated
    USING (auth.uid()::text = owner_id);
```

#### Para `categories`:

```sql
-- Usuários podem gerenciar suas próprias categorias
CREATE POLICY "categories_select_own" ON categories
    FOR SELECT TO authenticated
    USING (auth.uid()::text = user_id);

CREATE POLICY "categories_insert_own" ON categories
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "categories_update_own" ON categories
    FOR UPDATE TO authenticated
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "categories_delete_own" ON categories
    FOR DELETE TO authenticated
    USING (auth.uid()::text = user_id);
```

#### Para `budget_entries`:

```sql
-- Usuários podem gerenciar entradas de orçamentos acessíveis
CREATE POLICY "budget_entries_select_accessible" ON budget_entries
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budgets
            WHERE budgets.id = budget_entries.budget_id
            AND (budgets.owner_id = auth.uid()::text OR auth.uid()::text = ANY(budgets.collaborators))
        )
    );

CREATE POLICY "budget_entries_insert_accessible" ON budget_entries
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM budgets
            WHERE budgets.id = budget_entries.budget_id
            AND (budgets.owner_id = auth.uid()::text OR auth.uid()::text = ANY(budgets.collaborators))
        )
    );

CREATE POLICY "budget_entries_update_accessible" ON budget_entries
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budgets
            WHERE budgets.id = budget_entries.budget_id
            AND (budgets.owner_id = auth.uid()::text OR auth.uid()::text = ANY(budgets.collaborators))
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM budgets
            WHERE budgets.id = budget_entries.budget_id
            AND (budgets.owner_id = auth.uid()::text OR auth.uid()::text = ANY(budgets.collaborators))
        )
    );

CREATE POLICY "budget_entries_delete_accessible" ON budget_entries
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM budgets
            WHERE budgets.id = budget_entries.budget_id
            AND (budgets.owner_id = auth.uid()::text OR auth.uid()::text = ANY(budgets.collaborators))
        )
    );
```

## ⚛️ Integração com React

### Context de Dados (`src/contexts/UserDataContext.tsx`)

O projeto utiliza React Context para gerenciar o estado global dos dados:

```typescript
// Modo de armazenamento (Supabase ou Local)
const [useSupabase, setUseSupabase] = useState(false);

// Alternar entre modos
const toggleStorageMode = () => {
  setUseSupabase(!useSupabase);
  // Lógica de migração entre modos
};

// Hook personalizado
export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider");
  }
  return context;
};
```

### Componente de Status (`src/components/layout/SupabaseStatus.tsx`)

```typescript
export const SupabaseStatus: React.FC = () => {
  const { useSupabase } = useUserData();

  return (
    <Badge variant={useSupabase ? "default" : "outline"}>
      {useSupabase ? <Cloud className="h-3 w-3" /> : <CloudOff className="h-3 w-3" />}
      <span>{useSupabase ? "Cloud" : "Local"}</span>
    </Badge>
  );
};
```

### Configuração de Dados (`src/components/layout/SupabaseConfig.tsx`)

Permite ao usuário alternar entre armazenamento local e na nuvem:

```typescript
export function SupabaseConfig() {
  const { useSupabase, toggleStorageMode } = useUserData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Dados</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={toggleStorageMode} variant="outline">
          {useSupabase ? "Usar Armazenamento Local" : "Usar Armazenamento na Nuvem"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

## 💾 Fallback para Armazenamento Local

### Estratégia Híbrida

O projeto implementa uma estratégia híbrida que permite funcionar tanto com Supabase quanto com localStorage:

#### Classe DataStorage

```typescript
class DataStorage {
  private static prefix = "plannerfinUserData_";

  // Salvar dados localmente
  static saveUserData(userId: string, data: UserProfile): boolean {
    try {
      const dataWithVersion = {
        ...data,
        __version: CURRENT_DATA_VERSION,
        __lastSaved: new Date().toISOString(),
      };

      // Criar backup antes de salvar
      this.createBackup(userId);

      // Salvar dados principais
      localStorage.setItem(
        `${this.prefix}${userId}`,
        JSON.stringify(dataWithVersion),
      );

      return true;
    } catch (error) {
      return false;
    }
  }

  // Carregar dados locais
  static loadUserData(userId: string): UserProfile | null {
    try {
      const stored = localStorage.getItem(`${this.prefix}${userId}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const migrated = this.migrateDataIfNeeded(parsed);

      return migrated;
    } catch (error) {
      // Tentar recuperar do backup
      return this.recoverFromBackup(userId);
    }
  }
}
```

### Verificação de Disponibilidade

```typescript
// Verificar se Supabase está disponível
const checkSupabaseAvailability = async () => {
  const available = await SupabaseDataService.checkTablesAvailability();

  if (!available) {
    // Fallback para localStorage
    setUseSupabase(false);
    console.log("Supabase não disponível, usando armazenamento local");
  }
};
```

## 🔄 Migração de Dados

### Migração do localStorage para Supabase

```typescript
static async migrateFromLocalStorage(userId: string): Promise<boolean> {
  try {
    // Buscar dados do localStorage
    const localUserData = localStorage.getItem(`plannerfinUserData_${userId}`);
    if (!localUserData) return true;

    const userData = JSON.parse(localUserData);

    // Migrar perfil de usuário
    await this.updateUserProfile(userId, {
      name: userData.name,
    });

    // Migrar categorias
    for (const category of userData.categories || []) {
      await this.createCategory({
        name: category.name,
        type: category.type,
        color: category.color,
        icon: category.icon,
        description: category.description,
        userId,
      });
    }

    // Migrar orçamentos e entradas
    for (const budget of userData.budgets || []) {
      await this.createBudget({
        id: budget.id,
        name: budget.name,
        code: budget.code,
        ownerId: budget.ownerId,
        collaborators: budget.collaborators,
      });

      // Migrar entradas do orçamento
      for (const entry of budget.entries || []) {
        await this.createBudgetEntry({
          date: entry.date,
          description: entry.description,
          category: entry.category,
          amount: entry.amount,
          type: entry.type,
          userId: entry.userId,
          budgetId: entry.budgetId,
        });
      }
    }

    return true;
  } catch (error) {
    console.error("Erro na migração:", error);
    return false;
  }
}
```

## 📊 Monitoramento e Status

### Componentes de Monitoramento

#### 1. Status de Conectividade

- **SupabaseStatus**: Mostra se está usando nuvem ou armazenamento local
- **Badge visual**: Ícone de nuvem ou disco rígido

#### 2. Configuração de Dados

- **SupabaseConfig**: Permite alternar entre modos
- **Toggle visual**: Botão para mudança de modo

#### 3. Backup e Recuperação

- **Backup automático**: Criado antes de cada salvamento
- **Recuperação**: Sistema de fallback para backups
- **Limpeza**: Mantém apenas os 5 backups mais recentes

### Tratamento de Erros

```typescript
// Verificação de permissões RLS
if (error.code === "42501" || error.code === "PGRST301") {
  console.error("Permission denied - check RLS policies");
}

// Verificação de tabelas não encontradas
if (error.code === "PGRST106" || error.code === "42P01") {
  console.warn("Supabase tables not found, using demo mode");
}
```

## 🚀 Melhores Práticas

### 1. Segurança

- **Nunca expor** `service_role_key` no frontend
- **Sempre usar** RLS policies
- **Validar dados** antes de enviar para o Supabase
- **Verificar sessões** antes de operações críticas

### 2. Performance

- **Usar select específicos** em vez de `select("*")`
- **Implementar paginação** para grandes datasets
- **Cache de dados** frequentemente acessados
- **Lazy loading** para dados não críticos

### 3. Experiência do Usuário

- **Fallback para localStorage** quando Supabase não está disponível
- **Feedback visual** do status de conexão
- **Operações otimistas** com rollback em caso de erro
- **Auto-save** para melhor experiência

### 4. Manutenibilidade

- **Centralizar operações** na classe SupabaseDataService
- **Tipagem forte** com TypeScript
- **Logs detalhados** para debugging
- **Versionamento de dados** para migrações futuras

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente de Desenvolvimento

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Scripts Úteis

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "tsc"
  }
}
```

### Comandos de Teste

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Verificação de tipos
npm run typecheck
```

---

## 📝 Resumo

Este projeto implementa uma integração robusta com Supabase que inclui:

- ✅ **Autenticação completa** (login/registro)
- ✅ **CRUD operations** para todas as entidades
- ✅ **Row Level Security** para proteção de dados
- ✅ **Fallback para localStorage** para maior confiabilidade
- ✅ **Migração automática** entre modos de armazenamento
- ✅ **Monitoramento de status** em tempo real
- ✅ **Sistema de backup** e recuperação
- ✅ **Tipagem TypeScript** completa

A arquitetura permite que a aplicação funcione tanto online (com Supabase) quanto offline (com localStorage), proporcionando uma experiência consistente independente da conectividade.
