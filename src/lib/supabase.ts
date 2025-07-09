import { createClient } from "@supabase/supabase-js";

// Get Supabase configuration from environment variables or use defaults
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  (typeof window !== "undefined" && (window as any).ENV?.VITE_SUPABASE_URL) ||
  "https://demo.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  (typeof window !== "undefined" &&
    (window as any).ENV?.VITE_SUPABASE_ANON_KEY) ||
  "demo-key";

// Track if we're using demo credentials
export const isUsingDemoCredentials =
  supabaseUrl === "https://demo.supabase.co" ||
  supabaseKey === "demo-key" ||
  (!import.meta.env.VITE_SUPABASE_URL &&
    !(
      typeof window !== "undefined" && (window as any).ENV?.VITE_SUPABASE_URL
    )) ||
  (!import.meta.env.VITE_SUPABASE_ANON_KEY &&
    !(
      typeof window !== "undefined" &&
      (window as any).ENV?.VITE_SUPABASE_ANON_KEY
    ));

// Log current configuration for debugging
if (import.meta.env.DEV) {
  console.log("🔧 Supabase Configuration:");
  console.log("- URL:", supabaseUrl);
  console.log("- Using demo credentials:", isUsingDemoCredentials);
  console.log("- Environment URL set:", !!import.meta.env.VITE_SUPABASE_URL);
  console.log(
    "- Environment Key set:",
    !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
}

// Create Supabase client with error handling
let supabaseClient: ReturnType<typeof createClient> | null = null;

try {
  if (!isUsingDemoCredentials) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false, // We don't use Supabase auth, just storage
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          apikey: supabaseKey,
        },
      },
      db: {
        schema: "public",
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
} catch (error) {
  console.warn("Failed to initialize Supabase client:", error);
  supabaseClient = null;
}

// Export a safe client that handles demo mode
export const supabase =
  supabaseClient ||
  ({
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
    rpc: () =>
      Promise.resolve({
        data: null,
        error: { code: "DEMO_MODE", message: "Demo mode - no real database" },
      }),
  } as any);

// Helper function to check if Supabase is available
export const isSupabaseAvailable = async (): Promise<boolean> => {
  if (isUsingDemoCredentials || !supabaseClient) {
    return false;
  }

  try {
    // Simple connectivity test
    const { error } = await supabaseClient
      .from("user_profiles")
      .select("id")
      .limit(1);

    return !error || error.code !== "PGRST003"; // Table doesn't exist is ok, connection error is not
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
