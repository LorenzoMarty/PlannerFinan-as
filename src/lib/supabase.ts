import { createClient } from "@supabase/supabase-js";

// 🚀 Pegando as variáveis do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🛡️ Validação simples para evitar erros se esquecer de setar no .env
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidos no .env");
}

// 🔑 Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // ✅ mantém o usuário logado (localStorage)
    autoRefreshToken: true,     // 🔄 renova token automaticamente
  },
});

// 📦 Função para login usando email + senha
export const signIn = async (email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password });
};

// ✏️ Função para criar conta (signup)
export const signUp = async (email: string, password: string, name?: string) => {
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

// 🐞 Log de debug no desenvolvimento
if (import.meta.env.DEV) {
  console.log("✅ Supabase configurado:");
  console.log("URL:", supabaseUrl);
  console.log("Chave (primeiros dígitos):", supabaseAnonKey?.slice(0, 8) + "...");
}


// 📦 Database schema types (mantenho o resto do seu schema)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: { id: string; email: string; name: string; bio?: string; avatar?: string; phone?: string; location?: string; created_at: string; updated_at: string; };
        Insert: { id?: string; email: string; name: string; bio?: string; avatar?: string; phone?: string; location?: string; created_at?: string; updated_at?: string; };
        Update: { id?: string; email?: string; name?: string; bio?: string; avatar?: string; phone?: string; location?: string; created_at?: string; updated_at?: string; };
      };
      budgets: {
        Row: { id: string; name: string; code: string; owner_id: string; collaborators: string[]; created_at: string; updated_at: string; };
        Insert: { id?: string; name: string; code: string; owner_id: string; collaborators?: string[]; created_at?: string; updated_at?: string; };
        Update: { id?: string; name?: string; code?: string; owner_id?: string; collaborators?: string[]; created_at?: string; updated_at?: string; };
      };
      budget_entries: {
        Row: { id: string; date: string; description: string; category: string; amount: number; type: "income" | "expense"; user_id: string; budget_id: string; created_at: string; updated_at: string; };
        Insert: { id?: string; date: string; description: string; category: string; amount: number; type: "income" | "expense"; user_id: string; budget_id: string; created_at?: string; updated_at?: string; };
        Update: { id?: string; date?: string; description?: string; category?: string; amount?: number; type?: "income" | "expense"; user_id?: string; budget_id?: string; created_at?: string; updated_at?: string; };
      };
      categories: {
        Row: { id: string; name: string; type: "income" | "expense"; color: string; icon: string; description?: string; user_id: string; created_at: string; updated_at: string; };
        Insert: { id?: string; name: string; type: "income" | "expense"; color: string; icon: string; description?: string; user_id: string; created_at?: string; updated_at?: string; };
        Update: { id?: string; name?: string; type?: "income" | "expense"; color?: string; icon?: string; description?: string; user_id?: string; created_at?: string; updated_at?: string; };
      };
    };
  };
}
