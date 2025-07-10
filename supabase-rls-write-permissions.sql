-- PlannerFin - RLS com Permissões de Escrita Corrigidas
-- Execute no SQL Editor do Supabase para corrigir permissões

-- 1. Primeiro, vamos garantir que RLS está habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- 2. Drop políticas existentes que podem estar muito restritivas
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;

DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
DROP POLICY IF EXISTS "Users can insert their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view entries from accessible budgets" ON budget_entries;
DROP POLICY IF EXISTS "Users can manage entries from accessible budgets" ON budget_entries;
DROP POLICY IF EXISTS "Users can insert entries from accessible budgets" ON budget_entries;
DROP POLICY IF EXISTS "Users can update entries from accessible budgets" ON budget_entries;
DROP POLICY IF EXISTS "Users can delete entries from accessible budgets" ON budget_entries;

-- Também drop políticas permissivas que podem existir
DROP POLICY IF EXISTS "Allow all for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON budgets;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON categories;
DROP POLICY IF EXISTS "Allow all for authenticated users" ON budget_entries;

-- 3. Criar políticas com permissões de escrita adequadas

-- USER PROFILES - Usuários podem gerenciar seus próprios perfis
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

-- BUDGETS - Usuários podem gerenciar orçamentos que possuem ou colaboram
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

-- CATEGORIES - Usuários podem gerenciar suas próprias categorias
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

-- BUDGET ENTRIES - Usuários podem gerenciar entradas de orçamentos acessíveis
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

-- 4. Garantir permissões de tabela para usuários autenticados
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON budgets TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON budget_entries TO authenticated;

-- 5. Permitir acesso anônimo para criação de perfil (signup)
GRANT SELECT, INSERT ON user_profiles TO anon;

-- 6. Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'budgets', 'categories', 'budget_entries')
ORDER BY tablename, policyname;
