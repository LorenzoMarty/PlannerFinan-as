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
    storageKey: 'plannerfinance_auth',
    storage: {
      getItem: (key) => {
        try {
          return Promise.resolve(localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key);
          return Promise.resolve();
        } catch {
          return Promise.resolve();
        }
      },
    },
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
    // Verificar se já existe uma sessão
    const { data: existingSession } = await supabase.auth.getSession();
    
    // Se existir uma sessão, fazer logout primeiro
    if (existingSession?.session) {
      await supabase.auth.signOut();
    }

    // Limpar dados locais apenas após confirmar que não há sessão ativa
    localStorage.removeItem("plannerfinUser");
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('plannerfin')) {
        localStorage.removeItem(key);
      }
    });
    
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
  try {
    // Tentar obter a sessão atual
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error getting session:', error);
      localStorage.removeItem("plannerfinUser");
      return { data: { session: null }, error };
    }
    
    // Se não houver sessão, limpar dados e retornar
    if (!data.session) {
      localStorage.removeItem("plannerfinUser");
      return { data: { session: null }, error: null };
    }
    
    // Se a sessão existe mas está próxima de expirar, tentar renovar
    const expiresAt = data.session.expires_at;
    const now = Math.floor(Date.now() / 1000); // Converter para segundos
    const timeToExpire = expiresAt - now;
    
    if (timeToExpire < 300) { // Se faltam menos de 5 minutos
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        localStorage.removeItem("plannerfinUser");
        return { data: { session: null }, error: refreshError };
      }
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error in getSession:', error);
    localStorage.removeItem("plannerfinUser");
    return { data: { session: null }, error };
  }
};
