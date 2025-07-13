import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import BudgetTable from "@/components/budget/BudgetTable";
import CategoryChart from "@/components/budget/CategoryChart";
import CollaborationDialog from "@/components/collaboration/CollaborationDialog";
import { useUserData } from "@/contexts/UserDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  Share2,
  Copy,
  Download,
  Users,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { useDateLogic } from "@/hooks/useDateLogic";
import { useBudgetLogic } from "@/hooks/useBudgetLogic";
import { exportData } from "@/lib/export";
import { QuickStats } from "@/components/dashboard/QuickStats";

export default function Dashboard() {
  const { selectedMonth, setSelectedMonth, periodOptions } = useDateLogic();
  const { currentUser, entries } = useUserData();
  const {
    budgets,
    currentBudget,
    selectedBudget,
    handleBudgetChange,
    handleCreateBudget,
    handleShareBudget,
  } = useBudgetLogic();

  // Filter entries by selected month
  const filteredEntries = entries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const entryMonth = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, "0")}`;
    return entryMonth === selectedMonth;
  });

  // Calculate filtered totals
  const filteredIncome = filteredEntries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = Math.abs(
    filteredEntries
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0),
  );

  const filteredBalance = filteredIncome - filteredExpenses;

  const handleExportData = () => {
    exportData(filteredEntries, periodOptions, selectedMonth, currentBudget);
  };

  if (!currentUser) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">
              Faça login para acessar seu dashboard
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
                {periodOptions.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
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
        <QuickStats
          filteredIncome={filteredIncome}
          filteredExpenses={filteredExpenses}
          filteredBalance={filteredBalance}
          filteredEntries={filteredEntries}
          currentBudget={currentBudget}
          budgets={budgets}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <BudgetTable />
          </div>
          <div>
            <CategoryChart filteredEntries={filteredEntries} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
