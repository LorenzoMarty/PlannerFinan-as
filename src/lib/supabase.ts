import { createClient } from "@supabase/supabase-js";

// 🚀 Pegando as variáveis do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🛡️ Validação simples para evitar erros se esquecer de setar no .env
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "❌ SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidos no .env",
  );
}

// 🔑 Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // ✅ mantém o usuário logado (localStorage)
    autoRefreshToken: true, // 🔄 renova token automaticamente
  },
});

// 📦 Função para login usando email + senha
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

// ✏️ Função para criar conta (signup)
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

// 🧪 Recuperar sessão atual (opcional, caso queira checar se o usuário já está logado)
export const getSession = async () => {
  return supabase.auth.getSession();
};

// 🔍 Check if we're using demo credentials (placeholder values)
export const isUsingDemoCredentials =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes("your-project") ||
  supabaseUrl.includes("placeholder") ||
  supabaseAnonKey.includes("your-anon") ||
  supabaseAnonKey.includes("placeholder");

// 🔍 Check if Supabase is available and working
export const isSupabaseAvailable = async (): Promise<boolean> => {
  try {
    if (isUsingDemoCredentials) {
      return false;
    }

    // Try a simple connection test
    const { data, error } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    // If we get a table doesn't exist error, that's still a valid connection
    // We just need to set up the tables
    if (error && error.code === "42P01") {
      return true;
    }

    return !error;
  } catch (error) {
    console.warn("Supabase availability check failed:", error);
    return false;
  }
};

// 🐞 Log de debug no desenvolvimento
if (import.meta.env.DEV) {
  console.log("✅ Supabase configurado:");
  console.log("URL:", supabaseUrl);
  console.log(
    "Chave (primeiros dígitos):",
    supabaseAnonKey?.slice(0, 8) + "...",
  );
  console.log("Using demo credentials:", isUsingDemoCredentials);
}

// 📦 Database schema types (mantenho o resto do seu schema)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          bio?: string;
          avatar?: string;
          phone?: string;
          location?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          bio?: string;
          avatar?: string;
          phone?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          bio?: string;
          avatar?: string;
          phone?: string;
          location?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          name: string;
          code: string;
          user_id: string;
          collaborators: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          owner_id: string;
          collaborators?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          code?: string;
          owner_id?: string;
          collaborators?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      budget_entries: {
        Row: {
          id: string;
          date: string;
          description: string;
          category: string;
          amount: number;
          type: "income" | "expense";
          user_id: string;
          budget_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          description: string;
          category: string;
          amount: number;
          type: "income" | "expense";
          user_id: string;
          budget_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          description?: string;
          category?: string;
          amount?: number;
          type?: "income" | "expense";
          user_id?: string;
          budget_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          description?: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: "income" | "expense";
          color: string;
          icon: string;
          description?: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: "income" | "expense";
          color?: string;
          icon?: string;
          description?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
