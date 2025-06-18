import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Plus, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useUserData } from "@/contexts/UserDataContext";

interface CollaborationDialogProps {
  trigger?: React.ReactNode;
}

export default function CollaborationDialog({
  trigger,
}: CollaborationDialogProps) {
  const { joinBudgetByCode, findBudgetByCode } = useUserData();
  const [isOpen, setIsOpen] = useState(false);
  const [budgetCode, setBudgetCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleJoinBudget = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budgetCode.trim()) {
      setError("Por favor, insira um código de planilha");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // First check if budget exists
      const targetBudget = findBudgetByCode(budgetCode.toUpperCase());

      if (!targetBudget) {
        setError("Código de planilha não encontrado");
        setIsLoading(false);
        return;
      }

      // Try to join the budget
      const joined = await joinBudgetByCode(budgetCode.toUpperCase());

      if (joined) {
        setSuccess(true);
        toast.success(
          `Você agora tem acesso à planilha "${targetBudget.name}"!`,
        );
        setTimeout(() => {
          resetForm();
        }, 2000);
      } else {
        setError("Não foi possível entrar na planilha");
      }
    } catch (error) {
      setError("Erro interno. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setBudgetCode("");
    setError("");
    setSuccess(false);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Colaborar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Colaboração em Planilhas
          </DialogTitle>
          <DialogDescription>
            Digite o código de uma planilha para colaborar ou crie uma nova
            planilha colaborativa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleJoinBudget} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-success text-success">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Sucesso! Você foi adicionado à planilha.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="budgetCode">Código da Planilha</Label>
            <Input
              id="budgetCode"
              placeholder="Ex: PF123ABC"
              value={budgetCode}
              onChange={(e) => setBudgetCode(e.target.value.toUpperCase())}
              disabled={isLoading || success}
            />
            <p className="text-xs text-muted-foreground">
              Peça o código para o proprietário da planilha
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || success}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin mr-2" />
                  Buscando...
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Sucesso!
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Entrar na Planilha
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>
              {success ? "Fechar" : "Cancelar"}
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>

        <Alert>
          <Plus className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica:</strong> Qualquer planilha pode ser compartilhada! Vá
            no Dashboard, copie o código da sua planilha e compartilhe com
            outros usuários.
          </AlertDescription>
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
