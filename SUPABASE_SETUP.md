# Configuração do Supabase para PlannerFin

## Passo 0: Configurar Variáveis de Ambiente

1. Crie um arquivo `.env` na raiz do projeto (copie o `.env.example`):

```bash
cp .env.example .env
```

2. Abra o arquivo `.env` e configure suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima
```

Para encontrar essas informações:

- Acesse [supabase.com/dashboard](https://supabase.com/dashboard)
- Selecione seu projeto
- Vá em Settings > API
- Copie a "Project URL" e "anon public" key

## Passo 1: Criar as tabelas no Supabase

Execute os seguintes comandos SQL no Editor SQL do Supabase (https://supabase.com/dashboard/project/YOUR_PROJECT/sql):

```sql
-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    avatar TEXT,
    phone TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Budgets Table
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL,
    collaborators TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Budget Entries Table
CREATE TABLE IF NOT EXISTS budget_entries (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    user_id TEXT NOT NULL,
    budget_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_budgets_owner_id ON budgets(owner_id);
CREATE INDEX IF NOT EXISTS idx_budgets_code ON budgets(code);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_budget_id ON budget_entries(budget_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_entries_date ON budget_entries(date);
```

## Passo 2: Configurar políticas RLS (Opcional - Para produção)

Se você quiser habilitar Row Level Security para maior segurança:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- Create policies (apenas se você estiver usando autenticação do Supabase)
-- Por enquanto, mantemos desabilitado para simplicidade
```

## Passo 3: Testar a conexão

1. Abra o PlannerFin
2. Procure pelo ícone "Cloud" no cabeçalho
3. Clique no ícone para abrir as configurações de armazenamento
4. Clique em "Testar Conexão" para verificar se está funcionando
5. Clique em "Testar Criação" para verificar se consegue criar dados

## Passo 4: Migrar dados existentes

Se você já tem dados no localStorage:

1. Vá nas configurações de armazenamento (ícone Cloud)
2. Clique em "Migrar para Supabase"
3. Aguarde a confirmação de sucesso

## Troubleshooting

### Erro "relation does not exist"

- Verifique se as tabelas foram criadas corretamente
- Execute os comandos SQL novamente

### Erro de conexão

- Verifique se a URL e API Key estão corretas
- Verifique se o projeto Supabase está ativo

### Erro de permissão

- Por enquanto, as políticas RLS estão desabilitadas
- Se habilitou RLS, desabilite temporariamente para testar

## Informações Técnicas

- **URL do projeto**: https://hzqidfqjysjclksqqvqj.supabase.co
- **Modo de fallback**: Se Supabase falhar, a aplicação usa localStorage automaticamente
- **Sincronização**: Dados são salvos em tempo real no Supabase
- **Backup local**: localStorage continua sendo usado para backup

## Status da implementação

✅ Conexão com Supabase configurada
✅ Tabelas e estrutura definidas
✅ CRUD completo de usuários, orçamentos, categorias e lançamentos
✅ Migração automática de localStorage
✅ Interface de monitoramento e testes
✅ Fallback para localStorage em caso de erro
✅ Logs detalhados para debug
