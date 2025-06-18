import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import BudgetTable from "@/components/budget/BudgetTable";
import CategoryChart from "@/components/budget/CategoryChart";
import CollaborationDialog from "@/components/collaboration/CollaborationDialog";
import { useUserData } from "@/contexts/UserDataContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Share2,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Copy,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState("2024-01");
  const { currentUser, activeBudget, entries, createBudget, switchBudget } =
    useUserData();

  const [selectedBudget, setSelectedBudget] = useState(activeBudget?.id || "");

  const budgets = currentUser?.budgets || [];
  const currentBudget = activeBudget;

  const handleBudgetChange = (budgetId: string) => {
    setSelectedBudget(budgetId);
    switchBudget(budgetId);
  };

  const handleCreateBudget = () => {
    const name = prompt("Nome da nova planilha:");
    if (name && name.trim()) {
      const newBudgetId = createBudget(name.trim());
      setSelectedBudget(newBudgetId);
      toast.success("Nova planilha criada!");
    }
  };

  const handleShareBudget = () => {
    if (currentBudget) {
      navigator.clipboard.writeText(currentBudget.code);
      toast.success(
        `Código ${currentBudget.code} copiado! Compartilhe com outros usuários.`,
      );
    }
  };

  const handleExportData = () => {
    if (entries.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const csvData = [
      ["Data", "Descrição", "Categoria", "Valor", "Tipo"],
      ...entries.map((entry) => [
        entry.date,
        entry.description,
        entry.category,
        entry.amount.toString(),
        entry.type === "income" ? "Receita" : "Despesa",
      ]),
    ];

    const csvContent = csvData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plannerfin-${currentBudget?.name || "dados"}-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success("Dados exportados com sucesso!");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">
              Gerencie seus orçamentos e acompanhe suas finanças
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <CollaborationDialog />
            <Button variant="outline" onClick={handleExportData}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={handleShareBudget}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="space-y-2 flex-1">
            <label className="text-sm font-medium">Planilha Ativa</label>
            <div className="flex gap-2">
              <Select value={selectedBudget} onValueChange={handleBudgetChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma planilha" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      <div className="flex items-center gap-2 w-full">
                        <span className="truncate">{budget.name}</span>
                        {budget.collaborators.length > 0 && (
                          <Users className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleCreateBudget}
                className="shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span className="sr-only">Nova planilha</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2 w-full lg:w-auto lg:min-w-[200px]">
            <label className="text-sm font-medium">Período</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024-01">Janeiro 2024</SelectItem>
                <SelectItem value="2023-12">Dezembro 2023</SelectItem>
                <SelectItem value="2023-11">Novembro 2023</SelectItem>
                <SelectItem value="2023-10">Outubro 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Budget Info Card */}
        {currentBudget && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg truncate">
                    {currentBudget.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <span className="hidden sm:inline">Código: </span>
                      {currentBudget.code}
                    </Badge>
                    {currentBudget.collaborators.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">
                          {currentBudget.collaborators.length} colaboradores
                        </span>
                        <span className="sm:hidden">
                          {currentBudget.collaborators.length}
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareBudget}
                  className="gap-2 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  <span className="hidden sm:inline">Copiar Código</span>
                  <span className="sm:hidden">Copiar</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Atual</p>
                  <p
                    className={`font-semibold ${(() => {
                      const totalIncome = entries
                        .filter((e) => e.type === "income")
                        .reduce((sum, e) => sum + e.amount, 0);
                      const totalExpenses = Math.abs(
                        entries
                          .filter((e) => e.type === "expense")
                          .reduce((sum, e) => sum + e.amount, 0),
                      );
                      return totalIncome - totalExpenses >= 0
                        ? "text-success"
                        : "text-destructive";
                    })()}`}
                  >
                    {(() => {
                      const totalIncome = entries
                        .filter((e) => e.type === "income")
                        .reduce((sum, e) => sum + e.amount, 0);
                      const totalExpenses = Math.abs(
                        entries
                          .filter((e) => e.type === "expense")
                          .reduce((sum, e) => sum + e.amount, 0),
                      );
                      const balance = totalIncome - totalExpenses;
                      return new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(balance);
                    })()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lançamentos</p>
                  <p className="font-semibold">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Colaboradores</p>
                  <p className="font-semibold">
                    {(currentBudget?.collaborators.length || 0) + 1}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Planilhas</p>
                  <p className="font-semibold">{budgets.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Budget Table - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2 space-y-6">
            <BudgetTable />
          </div>

          {/* Chart and Additional Info */}
          <div className="space-y-6">
            <CategoryChart />

            {/* Financial Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const totalIncome = entries
                    .filter((e) => e.type === "income")
                    .reduce((sum, e) => sum + e.amount, 0);
                  const totalExpenses = Math.abs(
                    entries
                      .filter((e) => e.type === "expense")
                      .reduce((sum, e) => sum + e.amount, 0),
                  );
                  const balance = totalIncome - totalExpenses;
                  const savingsRate =
                    totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

                  if (entries.length === 0) {
                    return (
                      <div className="text-center py-4">
                        <p className="text-muted-foreground text-sm">
                          Adicione seus primeiros lançamentos para ver o resumo
                          financeiro
                        </p>
                      </div>
                    );
                  }

                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total de Receitas
                        </span>
                        <span className="font-medium text-success">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(totalIncome)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Total de Despesas
                        </span>
                        <span className="font-medium text-destructive">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(totalExpenses)}
                        </span>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Saldo Final
                          </span>
                          <span
                            className={`font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}
                          >
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(balance)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-muted-foreground">
                            Taxa de Economia
                          </span>
                          <span className="text-xs font-medium">
                            {savingsRate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(savingsRate, 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {savingsRate >= 20
                            ? "Excelente controle!"
                            : savingsRate >= 10
                              ? "Bom desempenho!"
                              : savingsRate > 0
                                ? "Continue assim!"
                                : "Atenção aos gastos"}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
