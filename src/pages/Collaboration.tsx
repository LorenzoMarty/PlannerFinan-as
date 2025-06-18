import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import CollaborationDialog from "@/components/collaboration/CollaborationDialog";
import { useUserData } from "@/contexts/UserDataContext";
import {
  Users,
  Share2,
  Copy,
  Plus,
  Calendar,
  Activity,
  Crown,
  Trash2,
  MoreVertical,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export default function Collaboration() {
  const {
    currentUser,
    activeBudget,
    entries,
    deleteBudget,
    leaveBudgetAsCollaborator,
  } = useUserData();

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado para a área de transferência!`);
  };

  const handleDeleteBudget = (budgetId: string, budgetName: string) => {
    const success = deleteBudget(budgetId);
    if (success) {
      toast.success(`Planilha "${budgetName}" excluída com sucesso!`);
    } else {
      toast.error(
        "Não é possível excluir esta planilha. Deve haver pelo menos uma planilha ou não é possível excluir a planilha ativa.",
      );
    }
  };

  const handleLeaveBudget = (budgetId: string, budgetName: string) => {
    const success = leaveBudgetAsCollaborator(budgetId);
    if (success) {
      toast.success(`Você saiu da planilha "${budgetName}" com sucesso!`);
    } else {
      toast.error("Não foi possível sair desta planilha.");
    }
  };

  if (!currentUser) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Colaboração</h1>
            <p className="text-muted-foreground">
              Faça login para gerenciar suas colaborações
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Colaboração</h1>
            <p className="text-muted-foreground">
              Gerencie suas planilhas compartilhadas e colaboradores
            </p>
          </div>

          <CollaborationDialog
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Entrar em Planilha
              </Button>
            }
          />
        </div>

        {/* Active Budget Info */}
        {activeBudget && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Planilha Ativa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{activeBudget.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Código: {activeBudget.code}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(activeBudget.code)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium">Proprietário</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    Última Atualização
                  </p>
                  <p className="font-medium">
                    {new Date(activeBudget.updatedAt).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* My Budgets */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Minhas Planilhas</h2>
            <Badge variant="secondary">{currentUser.budgets.length}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentUser.budgets.map((budget) => {
              const budgetEntries = entries.filter(
                (entry) => entry.budgetId === budget.id,
              );
              const isActive = budget.id === activeBudget?.id;
              const canDelete = currentUser.budgets.length > 1 && !isActive;

              return (
                <Card
                  key={budget.id}
                  className={
                    isActive ? "border-primary bg-primary/5" : "border-border"
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg flex items-center gap-2 flex-wrap">
                          <span className="truncate">{budget.name}</span>
                          {isActive && (
                            <Badge variant="default" className="text-xs">
                              Ativa
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {budget.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(budget.code)}
                            className="h-6 w-6 p-0 shrink-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleCopyCode(budget.code)}
                          >
                            <Share2 className="mr-2 h-4 w-4" />
                            Compartilhar
                          </DropdownMenuItem>
                          {canDelete && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Excluir Planilha
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a planilha "
                                    {budget.name}"? Esta ação não pode ser
                                    desfeita e todos os dados serão perdidos.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteBudget(budget.id, budget.name)
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">
                            Lançamentos
                          </span>
                          <span className="font-medium">
                            {budgetEntries.length}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">
                            Colaboradores
                          </span>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span className="font-medium">
                              {budget.collaborators.length + 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">
                          Criado em{" "}
                        </span>
                        <span className="font-medium">
                          {new Date(budget.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>

                      <div className="pt-2 border-t space-y-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => handleCopyCode(budget.code)}
                        >
                          <Share2 className="w-3 h-3 mr-2" />
                          <span className="hidden sm:inline">Compartilhar</span>
                          <span className="sm:hidden">Copiar</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Collaboration Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Como Funciona a Colaboração
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold">Para Compartilhar:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      1
                    </span>
                    Copie o código da sua planilha
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      2
                    </span>
                    Envie o código para seus colaboradores
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      3
                    </span>
                    Eles podem ver e editar em tempo real
                  </li>
                </ol>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Para Colaborar:</h4>
                <ol className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      1
                    </span>
                    Peça o código da planilha
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      2
                    </span>
                    Clique em "Entrar em Planilha"
                  </li>
                  <li className="flex gap-2">
                    <span className="bg-secondary text-secondary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      3
                    </span>
                    Digite o código e comece a colaborar
                  </li>
                </ol>
              </div>
            </div>

            <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm">
                <strong>Colaboração Ativa:</strong> Agora você pode compartilhar
                e colaborar em planilhas em tempo real! Use os códigos de
                planilha para convidar colaboradores e trabalhar juntos no
                controle financeiro.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
