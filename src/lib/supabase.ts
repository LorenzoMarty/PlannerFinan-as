import { createClient } from "@supabase/supabase-js";

// ⚙️ Configurações vindas do .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://demo.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "demo-key";

// 🔍 Verifica se está usando credenciais de demonstração
export const isUsingDemoCredentials =
  supabaseUrl === "https://demo.supabase.co" ||
  supabaseKey === "demo-key";

// 📦 Cria cliente Supabase real
let supabaseClient: ReturnType<typeof createClient> | null = null;

try {
  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
} catch (error) {
  console.warn("Failed to initialize Supabase client:", error);
}

// ✅ Exporta cliente real ou mock (modo demo)
export const supabase = supabaseClient ?? ({
  from: () => ({
    select: () =>
      Promise.resolve({
        data: null,
        error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
      }),
    insert: () =>
      Promise.resolve({
        data: null,
        error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
      }),
    update: () =>
      Promise.resolve({
        data: null,
        error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
      }),
    delete: () =>
      Promise.resolve({
        data: null,
        error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
      }),
    upsert: () =>
      Promise.resolve({
        data: null,
        error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
      }),
  }),
  auth: {
    getSession: () =>
      Promise.resolve({
        data: { session: null },
        error: { code: "DEMO_MODE", message: "Demo mode - no auth" },
      }),
  },
  rpc: () =>
    Promise.resolve({
      data: null,
      error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
    }),
} as any);

// 🧪 Helper para verificar se Supabase está disponível
export const isSupabaseAvailable = async (): Promise<boolean> => {
  if (isUsingDemoCredentials || !supabaseClient) {
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .range(0, 0); // ⚠️ use range(0, 0) para buscar 1 registro

    return !error || error.code !== "PGRST003"; // Se a tabela não existir, ainda considera conectado
  } catch (error) {
    console.warn("Supabase connectivity test failed:", error);
    return false;
  }
};

// Database schema types
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
          owner_id: string;
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


// 🐞 Opcional: log de configuração em desenvolvimento
if (import.meta.env.DEV) {
  console.log("🔧 Supabase Configuration:");
  console.log("- URL:", supabaseUrl);
  console.log("- Using demo credentials:", isUsingDemoCredentials);
}
