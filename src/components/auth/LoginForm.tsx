import React, { useState } from "react";
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
  AlertCircle,
  Calculator,
  TrendingUp,
  Shield,
  Users,
  BarChart3,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { signIn, signUp } from "@/lib/supabase"; // ✅ importar helpers
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: () => void; // ✅ não precisa passar email/senha pois sessão já está salva
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");

  // ✅ separar erros para cada aba
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setLoginError("Email ou senha incorretos");
        } else {
          setLoginError("Erro ao fazer login. Tente novamente.");
        }
        return;
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta ao PlannerFin",
      });
      onLogin(); // ✅ login concluído
    } catch (err) {
      console.error("Login error:", err);
      setLoginError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError("");

    if (!email || !password || !confirmPassword || !name) {
      setSignupError("Por favor, preencha todos os campos");
      return;
    }
    if (password !== confirmPassword) {
      setSignupError("As senhas não coincidem");
      return;
    }
    if (password.length < 6) {
      setSignupError("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);
    try {
      const { error, data } = await signUp(email, password);
      if (error) {
        if (error.message.includes("User already registered")) {
          setSignupError("Este email já está cadastrado. Tente fazer login.");
        } else {
          setSignupError("Erro ao criar conta. Tente novamente.");
        }
        return;
      }

      if (data?.user) {
        if (data.user.email_confirmed_at) {
          toast({
            title: "Conta criada com sucesso!",
            description: "Bem-vindo ao PlannerFin",
          });
          onLogin();
        } else {
          toast({
            title: "Conta criada!",
            description: "Verifique seu email para confirmar a conta",
          });
          setActiveTab("login");
        }
      }
    } catch (err) {
      console.error("Signup error:", err);
      setSignupError("Erro inesperado. Tente novamente.");
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
                    {loginError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{loginError}</AlertDescription>
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
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    {signupError && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{signupError}</AlertDescription>
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
