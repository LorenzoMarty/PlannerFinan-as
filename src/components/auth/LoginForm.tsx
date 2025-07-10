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
import { signIn, signUp } from "@/lib/supabase";
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
        setError("Email ou senha inválidos");
        return;
      }
      if (data.session) {
        toast({
          title: "Login realizado",
          description: "Sessão iniciada com sucesso!",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Erro inesperado ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
        setError(error.message);
        return;
      }
      toast({
        title: "Conta criada!",
        description: "Verifique seu email para confirmar",
      });
      setActiveTab("login");
    } catch (err) {
      console.error(err);
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
    <div className="min-h-screen flex">
      {/* Branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-8">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary rounded-xl flex justify-center items-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">PlannerFin</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Controle suas <span className="text-primary">Finanças</span>
          </h2>
          <p className="mb-8 text-muted-foreground">
            Simples, colaborativo e seguro.
          </p>
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-6 max-w-md mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
            <CardTitle>
              {activeTab === "login" ? "Entrar" : "Criar Conta"}
            </CardTitle>
            <CardDescription>
              {activeTab === "login"
                ? "Acesse sua conta"
                : "Cadastre-se gratuitamente"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Criar Conta</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-2"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                    />
                    <Label htmlFor="remember">Lembrar de mim</Label>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Confirmar Senha</Label>
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? "Criando..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
