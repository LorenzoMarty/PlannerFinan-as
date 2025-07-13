import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Protected Route wrapper - uses Supabase session for auth state
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      // Re-check auth when back online
      checkSession();
    };

    const handleOffline = () => {
      // Force logout and clear local data when offline
      localStorage.removeItem("plannerfinUser");
      setIsAuthenticated(false);
      toast.error("Você está offline. A sessão foi encerrada.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!session) {
          // No valid session
          localStorage.removeItem("plannerfinUser");
          setIsAuthenticated(false);
          return;
        }

        // Verify session is still valid
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          throw refreshError;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error checking session:", error);
        localStorage.removeItem("plannerfinUser");
        setIsAuthenticated(false);
        // Redirect to login on session error
        window.location.href = "/";
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (event === "SIGNED_OUT") {
          localStorage.removeItem("plannerfinUser");
        }
      },
    );

    return () => {
      authListener.subscription?.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isAuthenticated === null) {
    // Loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
