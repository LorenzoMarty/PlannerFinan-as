import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "SUPABASE_URL ou SUPABASE_ANON_KEY não estão definidos no .env",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: "public",
  },
  global: {
    headers: {
      "x-client-info": "fusion-starter@1.0.0",
      "Content-Type": "application/json",
      Accept: "application/json",
      Prefer: "return=representation",
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

export const signIn = async (email: string, password: string) => {
  // First clear any existing session data
  localStorage.removeItem("plannerfinUser");
  await supabase.auth.signOut();
  
  // Then attempt to sign in
  return supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (
  email: string,
  password: string,
  name?: string,
) => {
  // First clear any existing session data
  localStorage.removeItem("plannerfinUser");
  await supabase.auth.signOut();
  
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

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  
  if (error || !data.session) {
    localStorage.removeItem("plannerfinUser");
    return { data: { session: null }, error };
  }
  
  // Verify session is still valid
  const { error: refreshError } = await supabase.auth.refreshSession();
  if (refreshError) {
    localStorage.removeItem("plannerfinUser");
    return { data: { session: null }, error: refreshError };
  }
  
  return { data, error: null };
};
