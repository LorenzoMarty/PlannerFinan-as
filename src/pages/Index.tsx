import SimpleLoginForm from "@/components/auth/SimpleLoginForm";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { setUser } = useUserData();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = {
          email: session.user.email || "",
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "Usuário",
        };

        localStorage.setItem(
          "plannerfinUser",
          JSON.stringify({
            ...userData,
            authenticated: true,
            loginTime: new Date().toISOString(),
          }),
        );

        await setUser(userData);
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate, setUser]);

  const handleLogin = async (email: string, password: string) => {
    try {
      // Get the current session after login
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const userData = {
          email: session.user.email || email,
          name: session.user.user_metadata?.name || email.split("@")[0],
        };

        // Store user info in localStorage
        localStorage.setItem(
          "plannerfinUser",
          JSON.stringify({
            ...userData,
            authenticated: true,
            loginTime: new Date().toISOString(),
          }),
        );

        // Initialize user data context
        await setUser(userData);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login handling error:", error);
    }
  };

  return <SimpleLoginForm onLogin={handleLogin} />;
};

export default Index;
