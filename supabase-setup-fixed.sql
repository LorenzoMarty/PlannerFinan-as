-- PlannerFin - Configuração Corrigida do Supabase
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Drop existing tables and policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can update their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can insert their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can delete their own budgets" ON budgets;
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;
DROP POLICY IF EXISTS "Users can view entries from accessible budgets" ON budget_entries;
DROP POLICY IF EXISTS "Users can manage entries from accessible budgets" ON budget_entries;

DROP TABLE IF EXISTS budget_entries CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 2. Create User Profiles Table
CREATE TABLE user_profiles (
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

-- 3. Create Budgets Table
CREATE TABLE budgets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    owner_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    collaborators TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Categories Table
CREATE TABLE categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name, user_id)
);

-- 5. Create Budget Entries Table
CREATE TABLE budget_entries (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    user_id TEXT NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    budget_id TEXT NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create indexes for better performance
CREATE INDEX idx_budgets_owner_id ON budgets(owner_id);
CREATE INDEX idx_budgets_code ON budgets(code);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_budget_entries_budget_id ON budget_entries(budget_id);
CREATE INDEX idx_budget_entries_user_id ON budget_entries(user_id);
CREATE INDEX idx_budget_entries_date ON budget_entries(date);

-- 7. Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies (Permissive for authenticated users)

-- User Profiles: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON user_profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Budgets: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON budgets
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Categories: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON categories
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Budget Entries: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON budget_entries
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- 9. Create function for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Create triggers to automatically update updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_entries_updated_at BEFORE UPDATE ON budget_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Grant permissions to authenticated users
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON budgets TO authenticated;
GRANT ALL ON categories TO authenticated;
GRANT ALL ON budget_entries TO authenticated;

-- 12. Allow anonymous access for the public role (if needed for signup)
GRANT SELECT, INSERT ON user_profiles TO anon;
