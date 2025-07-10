import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  Calculator,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signUp, supabase } from "@/lib/supabase";
import { SupabaseDataService } from "@/services/SupabaseDataService";
import { useToast } from "@/hooks/use-toast";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already authenticated and redirect
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const localUser = localStorage.getItem("plannerfinUser");

      if (session?.user && localUser) {
        navigate("/dashboard", { replace: true });
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Preencha todos os campos");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login credentials")) {
          setError("Email ou senha inválidos");
        } else if (error.message.includes("Email not confirmed")) {
          setError("Confirme seu email antes de fazer login");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.session?.user) {
        // Store user data in localStorage for ProtectedRoute compatibility
        const userData = {
          id: data.session.user.id,
          email: data.session.user.email || email,
          name: data.session.user.user_metadata?.name || name || "Usuário",
          authenticated: true,
        };

        localStorage.setItem("plannerfinUser", JSON.stringify(userData));

        // Ensure user profile exists in Supabase
        try {
          await SupabaseDataService.createUserProfile({
            id: data.session.user.id,
            email: userData.email,
            name: userData.name,
          });
        } catch (profileError) {
          console.warn("Profile creation warning:", profileError);
          // Not a critical error, continue with login
        }

        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });

        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Erro inesperado ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password || !confirmPassword || !name) {
      setError("Preencha todos os campos");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      setError("Senha deve ter no mínimo 6 caracteres");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const { data, error } = await signUp(email, password, name);

      if (error) {
        console.error("Signup error:", error);
        if (error.message.includes("User already registered")) {
          setError("Este email já está cadastrado. Tente fazer login.");
        } else if (error.message.includes("Password should be at least")) {
          setError("Senha deve ter pelo menos 6 caracteres");
        } else {
          setError(error.message);
        }
        return;
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          toast({
            title: "Conta criada!",
            description: "Verifique seu email para confirmar a conta",
          });
          setActiveTab("login");
        } else {
          // If no email confirmation required (like with demo users)
          const userData = {
            id: data.user.id,
            email: data.user.email || email,
            name: name,
            authenticated: true,
          };

          localStorage.setItem("plannerfinUser", JSON.stringify(userData));

          // Create user profile in Supabase
          try {
            await SupabaseDataService.createUserProfile({
              id: data.user.id,
              email: userData.email,
              name: userData.name,
            });
          } catch (profileError) {
            console.warn("Profile creation warning:", profileError);
          }

          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao PlannerFin!",
          });

          // Navigate to dashboard
          navigate("/dashboard", { replace: true });
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Erro inesperado ao criar conta");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: "Controle Total",
      description: "Gerencie suas finanças com precisão e simplicidade",
    },
    {
      icon: Users,
      title: "Colaborativo",
      description: "Compartilhe orçamentos e colabore em tempo real",
    },
    {
      icon: BarChart3,
      title: "Relatórios Inteligentes",
      description: "Visualizações e insights automáticos dos seus dados",
    },
    {
      icon: Shield,
      title: "Seguro & Acessível",
      description: "Proteção de dados e interface totalmente acessível",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Left Side - Branding and Features */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8 xl:px-12">
        <div className="max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">PlannerFin</h1>
              <p className="text-muted-foreground">Controle Financeiro</p>
            </div>
          </div>

          {/* Headline */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-foreground mb-4 leading-tight">
              Transforme sua{" "}
              <span className="text-primary">gestão financeira</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              A plataforma completa para controlar seus orçamentos de forma
              colaborativa e inteligente. Simples, seguro e totalmente
              personalizável.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={feature.title} className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Dados Criptografados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>100% Gratuito</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:max-w-md xl:max-w-lg">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-foreground">
                  PlannerFin
                </h1>
                <p className="text-xs text-muted-foreground">
                  Controle Financeiro
                </p>
              </div>
            </div>
          </div>

          <Card className="border-2 shadow-xl">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-primary" />
                <CardTitle className="text-xl">Bem-vindo</CardTitle>
              </div>
              <CardDescription className="text-base">
                {activeTab === "login"
                  ? "Entre na sua conta para continuar"
                  : "Crie sua conta gratuitamente"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Criar Conta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && activeTab === "login" && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={setRememberMe}
                        />
                        <Label
                          htmlFor="remember"
                          className="text-sm text-muted-foreground"
                        >
                          Lembrar de mim
                        </Label>
                      </div>
                      <Button
                        variant="link"
                        className="px-0 text-sm text-primary"
                      >
                        Esqueci a senha
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                          Entrando...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Entrar
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>

                    {/* Demo Users */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 text-center">
                        Ou use uma conta demo:
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          disabled={isLoading}
                          onClick={() => {
                            setEmail("demo@plannerfin.com");
                            setPassword("123456");
                          }}
                        >
                          Demo
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          disabled={isLoading}
                          onClick={() => {
                            setEmail("admin@plannerfin.com");
                            setPassword("admin123");
                          }}
                        >
                          Admin
                        </Button>
                      </div>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {error && activeTab === "signup" && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">
                        Nome Completo
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Seu nome completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-email"
                        className="text-sm font-medium"
                      >
                        Email
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="signup-password"
                        className="text-sm font-medium"
                      >
                        Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Mínimo 6 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-sm font-medium"
                      >
                        Confirmar Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirme sua senha"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-11 pr-10"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Ao criar uma conta, você concorda com nossos{" "}
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Termos de Uso
                      </Button>{" "}
                      e{" "}
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Política de Privacidade
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                          Criando conta...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Criar Conta
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
