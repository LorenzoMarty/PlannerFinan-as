import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import BudgetTable from "@/components/budget/BudgetTable";
import CategoryChart from "@/components/budget/CategoryChart";
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Planilha Ativa</label>
            <div className="flex gap-2">
              <Select value={selectedBudget} onValueChange={handleBudgetChange}>
                <SelectTrigger className="w-full sm:w-[280px]">
                  <SelectValue placeholder="Selecione uma planilha" />
                </SelectTrigger>
                <SelectContent>
                  {budgets.map((budget) => (
                    <SelectItem key={budget.id} value={budget.id}>
                      <div className="flex items-center gap-2">
                        <span>{budget.name}</span>
                        {budget.collaborators.length > 0 && (
                          <Users className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleCreateBudget}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Período</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full sm:w-[200px]">
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold">{currentBudget.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        Código: {currentBudget.code}
                      </Badge>
                      {currentBudget.collaborators.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          {currentBudget.collaborators.length} colaboradores
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShareBudget}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copiar Código
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
                  <p className="text-sm text-muted-foreground">Este Mês</p>
                  <p className="font-semibold">+15.2%</p>
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

            {/* Quick Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar relatório mensal
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Convidar colaborador
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver histórico completo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
