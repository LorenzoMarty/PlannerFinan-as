import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";

const demoUsers = [
  {
    email: "demo@plannerfin.com",
    password: "123456",
    name: "Usuário Demo",
  },
  {
    email: "admin@plannerfin.com",
    password: "admin123",
    name: "Administrador",
  },
  {
    email: "user@exemplo.com",
    password: "senha123",
    name: "João Silva",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUserData();

  const handleLogin = (email: string, password: string) => {
    // Check if user exists in demo users
    const user = demoUsers.find(
      (u) => u.email === email && u.password === password,
    );

    const userData = user
      ? { email: user.email, name: user.name }
      : { email, name: email.split("@")[0] };

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
    setUser(userData);

    navigate("/dashboard");
  };

  return <LoginForm onLogin={handleLogin} />;
}
