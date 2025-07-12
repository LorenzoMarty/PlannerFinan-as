import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserDataProvider } from "./UserDataContext";

interface AuthGateProps {
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session?.user);
      setChecking(false);
    };
    checkSession();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para a página de login ou inicial
    window.location.href = "/";
    return null;
  }

  return <UserDataProvider>{children}</UserDataProvider>;
};
