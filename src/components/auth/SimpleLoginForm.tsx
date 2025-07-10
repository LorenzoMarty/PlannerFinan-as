import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface SimpleLoginFormProps {
  onLogin: (email: string, password: string) => void;
}

export default function SimpleLoginForm({ onLogin }: SimpleLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Evitar problemas de RSL
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt with:", { email, password });

    if (!email || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Attempting Supabase login...");
      const { data, error: authError } = await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

      console.log("Supabase response:", { data, error: authError });

      if (authError) {
        console.error("Auth error:", authError);
        if (authError.message.includes("Invalid login credentials")) {
          setError("Email ou senha incorretos");
        } else {
          setError(`Erro: ${authError.message}`);
        }
        return;
      }

      if (data.user) {
        console.log("Login successful:", data.user);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta ao PlannerFin",
        });
        onLogin(email, password);
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (!mounted) return;

    setEmail("demo@plannerfin.com");
    setPassword("123456");
    setIsLoading(true);
    setError("");

    try {
      console.log("Trying demo login...");

      // First try to login
      let { data, error: authError } = await supabase.auth.signInWithPassword({
        email: "demo@plannerfin.com",
        password: "123456",
      });

      if (
        authError &&
        authError.message.includes("Invalid login credentials")
      ) {
        console.log("Demo user doesn't exist, creating...");

        // Create demo user
        const { data: signUpData, error: signUpError } =
          await supabase.auth.signUp({
            email: "demo@plannerfin.com",
            password: "123456",
            options: {
              data: {
                name: "Usuário Demo",
              },
            },
          });

        if (signUpError) {
          throw signUpError;
        }

        console.log("Demo user created, attempting login...");

        // Try to login again
        const { data: loginData, error: loginError } =
          await supabase.auth.signInWithPassword({
            email: "demo@plannerfin.com",
            password: "123456",
          });

        if (!loginError && loginData.user) {
          onLogin("demo@plannerfin.com", "123456");
          return;
        }
      } else if (!authError && data.user) {
        console.log("Demo login successful");
        onLogin("demo@plannerfin.com", "123456");
        return;
      }

      throw new Error("Failed to login with demo credentials");
    } catch (error) {
      console.error("Demo login error:", error);
      setError("Erro no login demo. Tentando fallback...");
      // Fallback to direct login
      onLogin("demo@plannerfin.com", "123456");
    } finally {
      setIsLoading(false);
    }
  };

  // Não renderizar até estar montado para evitar problemas de RSL
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            PlannerFin
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Entre na sua conta
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDemoLogin}
                disabled={isLoading}
              >
                Acesso Demo
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
