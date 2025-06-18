import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";

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

  const handleLogin = (email: string, password: string) => {
    // Check if user exists in demo users
    const user = demoUsers.find(
      (u) => u.email === email && u.password === password,
    );

    if (user) {
      // Store user info in localStorage
      localStorage.setItem(
        "plannerfinUser",
        JSON.stringify({
          email: user.email,
          name: user.name,
          authenticated: true,
          loginTime: new Date().toISOString(),
        }),
      );

      navigate("/dashboard");
    } else {
      // For any other email/password, still allow login (for demo purposes)
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
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}
