import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    // In a real app, this would authenticate with a backend
    // For now, we'll simulate successful login and redirect to dashboard
    console.log("Login attempt:", { email, password });

    // Store user info in localStorage (in production, use proper auth state management)
    localStorage.setItem(
      "plannerfinUser",
      JSON.stringify({
        email,
        name: email.split("@")[0],
        authenticated: true,
        loginTime: new Date().toISOString(),
      }),
    );

    navigate("/dashboard");
  };

  return <LoginForm onLogin={handleLogin} />;
}
