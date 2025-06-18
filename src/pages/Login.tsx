import LoginForm from "@/components/auth/LoginForm";
import { useNavigate } from "react-router-dom";
import { useUserData } from "@/contexts/UserDataContext";

const demoUsers = [
  {
    email: "demo@plannerfin.com",
    password: "123456",
    name: "Maria Santos",
    bio: "Desenvolvedora Full Stack apaixonada por tecnologia e finanças pessoais",
    phone: "(11) 99876-5432",
    location: "São Paulo, SP",
    avatar: "",
  },
  {
    email: "admin@plannerfin.com",
    password: "admin123",
    name: "Carlos Admin",
    bio: "Administrador do sistema PlannerFin",
    phone: "(21) 98765-4321",
    location: "Rio de Janeiro, RJ",
    avatar: "",
  },
  {
    email: "user@exemplo.com",
    password: "senha123",
    name: "João Silva",
    bio: "Analista de sistemas em transição para Product Manager",
    phone: "(11) 91234-5678",
    location: "Campinas, SP",
    avatar: "",
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
      ? {
          email: user.email,
          name: user.name,
          bio: user.bio,
          phone: user.phone,
          location: user.location,
          avatar: user.avatar,
          joinedAt: new Date(2024, 0, 15).toISOString(), // January 15, 2024
          lastLogin: new Date().toISOString(),
        }
      : {
          email,
          name: email.split("@")[0],
          bio: "",
          phone: "",
          location: "",
          avatar: "",
          joinedAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
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
    setUser(userData);

    navigate("/dashboard");
  };

  return <LoginForm onLogin={handleLogin} />;
}
