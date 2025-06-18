import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Calculator className="w-8 h-8 text-primary" />
          </div>

          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>

          <h2 className="text-xl font-semibold mb-2">Página não encontrada</h2>

          <p className="text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>

          <div className="space-y-3">
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="w-full"
            >
              Ir para Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
