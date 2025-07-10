import { createClient } from "@supabase/supabase-js";

// ⚙️ Configurações vindas do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 Verifica se está usando credenciais de demonstração
export const isUsingDemoCredentials =
  supabaseUrl === "https://demo.supabase.co" ||
  supabaseKey === "demo-key";

// 📦 Cria cliente Supabase real (agora com persistSession: true)
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
});

// 🧪 Helper para verificar se Supabase está disponível
export const isSupabaseAvailable = async (): Promise<boolean> => {
  if (isUsingDemoCredentials) return false;

  try {
    const { error } = await supabase
      .from("user_profiles")
      .select("id")
      .range(0, 0);

    return !error || error.code !== "PGRST003";
  } catch (error) {
    console.warn("Supabase connectivity test failed:", error);
    return false;
  }
};

// ✅ Funções para autenticação
export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) console.error("Sign up error:", error);
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) console.error("Sign in error:", error);
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("Sign out error:", error);
};

// 🐞 Log em desenvolvimento
if (import.meta.env.DEV) {
  console.log("🔧 Supabase Configuration:");
  console.log("- URL:", supabaseUrl);
  console.log("- Using demo credentials:", isUsingDemoCredentials);
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
