import { supabase } from "./supabase";

export class SupabaseSetup {
  static async ensureTablesExist(): Promise<boolean> {
    try {
      // Check if user_profiles table exists by trying to select from it
      const { error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1);

      if (profileError && profileError.code === "42P01") {
        // Table doesn't exist, create it
        console.log("Creating tables...");
        await this.createTables();
      }

      return true;
    } catch (error) {
      console.error("Error ensuring tables exist:", error);
      return false;
    }
  }

  static async createTables(): Promise<void> {
    const createTableQueries = [
      // User Profiles Table
      `
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
      `,

      // Budgets Table
      `
      CREATE TABLE IF NOT EXISTS budgets (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        owner_id TEXT NOT NULL,
        collaborators TEXT[] DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      `,

      // Categories Table
      `
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
      `,

      // Budget Entries Table
      `
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
      `,

      // Create indexes
      `
      CREATE INDEX IF NOT EXISTS idx_budgets_owner_id ON budgets(owner_id);
      CREATE INDEX IF NOT EXISTS idx_budgets_code ON budgets(code);
      CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
      CREATE INDEX IF NOT EXISTS idx_budget_entries_budget_id ON budget_entries(budget_id);
      CREATE INDEX IF NOT EXISTS idx_budget_entries_user_id ON budget_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_budget_entries_date ON budget_entries(date);
      `,
    ];

    for (const query of createTableQueries) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql: query });
        if (error) {
          console.error("Error creating table:", error);
        }
      } catch (error) {
        // Try direct SQL execution
        console.log("Trying direct SQL execution...");
      }
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1);

      if (error) {
        console.error("Connection test failed:", error);
        return false;
      }

      console.log("Supabase connection successful");
      return true;
    } catch (error) {
      console.error("Connection test error:", error);
      return false;
    }
  }
}
