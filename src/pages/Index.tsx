import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { setUser } = useUserData();
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === "undefined") return;

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

  return <LoginForm />;
};

export default Index;
