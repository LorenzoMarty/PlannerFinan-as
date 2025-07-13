import SimpleLoginForm from "@/components/auth/SimpleLoginForm";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

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

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session?.user) {
        const userData = {
          email: data.session.user.email || email,
          name: data.session.user.user_metadata?.name || email.split("@")[0],
        };

        // Initialize user data context - the session will be handled by App.tsx
        await setUser(userData);

        // Navigation will be handled automatically by the ProtectedRoute in App.tsx
        // when the auth state changes
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error; // Let the form handle the error display
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