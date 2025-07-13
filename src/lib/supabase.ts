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
  try {
    // First clear any existing session data and perform thorough cleanup
    localStorage.removeItem("plannerfinUser");
    sessionStorage.clear();
    await Promise.all([
      supabase.auth.signOut(),
      new Promise(resolve => {
        // Clear any cached data
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('plannerfin')) {
            localStorage.removeItem(key);
          }
        });
        resolve(true);
      })
    ]);
    
    // Then attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) throw error;
    if (!data.session) throw new Error('No session created after login');
    
    // Store minimal session data
    localStorage.setItem('plannerfinUser', JSON.stringify({
      email: data.user?.email,
      name: data.user?.user_metadata?.name || data.user?.email?.split('@')[0] || 'Usuário',
      lastLogin: new Date().toISOString()
    }));
    
    return { data, error: null };
  } catch (error) {
    console.error('SignIn error:', error);
    return { data: { session: null, user: null }, error };
  }
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
