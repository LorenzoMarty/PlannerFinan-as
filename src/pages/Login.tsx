import SimpleLoginForm from "@/components/auth/SimpleLoginForm";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUserData();
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          setIsCheckingSession(false);
          return;
        }

        if (session?.user) {
          // User is already logged in, redirect to dashboard
          console.log("User already logged in, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsCheckingSession(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogin = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // The onAuthStateChange listener in ProtectedRoute will handle the redirect and user context update.
    } catch (error) {
      toast.error(error.message || "Erro ao fazer login");
    }
  };

  // Show loading while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <SimpleLoginForm onLogin={handleLogin} />;
}