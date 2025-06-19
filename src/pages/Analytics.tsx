import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  DollarSign,
  Target,
  AlertTriangle,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import { useUserData } from "@/contexts/UserDataContext";

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedComparison, setSelectedComparison] = useState("previous-year");
  const { entries, categories } = useUserData();

  // Calculate real data from user entries
  const generateMonthlyData = () => {
    const months = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];

    const currentYear = new Date().getFullYear();
    const monthlyStats = months
      .map((month, index) => {
        const monthEntries = entries.filter((entry) => {
          // Handle YYYY-MM-DD format to avoid timezone issues
          let entryDate;
          if (entry.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = entry.date.split("-").map(Number);
            entryDate = new Date(year, month - 1, day);
          } else {
            entryDate = new Date(entry.date + "T00:00:00");
          }
          return (
            entryDate.getMonth() === index &&
            entryDate.getFullYear() === currentYear
          );
        });

        const receitas = monthEntries
          .filter((entry) => entry.type === "income")
          .reduce((sum, entry) => sum + entry.amount, 0);

        const despesas = Math.abs(
          monthEntries
            .filter((entry) => entry.type === "expense")
            .reduce((sum, entry) => sum + entry.amount, 0),
        );

        return {
          name: month,
          receitas,
          despesas,
          saldo: receitas - despesas,
        };
      })
      .filter((month) => month.receitas > 0 || month.despesas > 0);

    return monthlyStats.length > 0
      ? monthlyStats
      : [{ name: "Atual", receitas: 0, despesas: 0, saldo: 0 }];
  };

  const generateCategoryExpensesData = () => {
    const categoryStats = categories
      .filter((cat) => cat.type === "expense")
      .map((category) => {
        const categoryEntries = entries.filter(
          (entry) =>
            entry.category === category.name && entry.type === "expense",
        );
        const value = categoryEntries.reduce(
          (sum, entry) => sum + Math.abs(entry.amount),
          0,
        );
        return {
          name: category.name,
          value,
          color: category.color,
        };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return categoryStats.length > 0
      ? categoryStats
      : [{ name: "Sem dados", value: 1, color: "#6b7280" }];
  };

  const generateWeeklyTrendData = () => {
    const daysOfWeek = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const weeklyStats = daysOfWeek.map((day, index) => {
      const dayEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getDay() === index;
      });

      const valor =
        dayEntries.reduce((sum, entry) => sum + Math.abs(entry.amount), 0) /
        Math.max(dayEntries.length, 1);

      return { day, valor: Math.round(valor) };
    });

    return weeklyStats;
  };

  const monthlyData = generateMonthlyData();
  const categoryExpensesData = generateCategoryExpensesData();
  const weeklyTrendData = generateWeeklyTrendData();

  // Calculate totals from real data
  const totalIncome = entries
    .filter((entry) => entry.type === "income")
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = Math.abs(
    entries
      .filter((entry) => entry.type === "expense")
      .reduce((sum, entry) => sum + entry.amount, 0),
  );

  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

  const handleExportReport = (type: string) => {
    if (entries.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const reportData = {
      periodo: selectedPeriod,
      totalReceitas: totalIncome,
      totalDespesas: totalExpenses,
      saldo: balance,
      taxaEconomia: savingsRate,
      dadosMensais: monthlyData,
      categorias: categoryExpensesData,
      tendenciaSemanal: weeklyTrendData,
      geradoEm: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `plannerfin-relatorio-${type}-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success(`Relatório ${type} exportado com sucesso!`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
            <p className="text-muted-foreground">
              Análise detalhada do seu histórico financeiro
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">Último Mês</SelectItem>
                <SelectItem value="3months">Últimos 3 Meses</SelectItem>
                <SelectItem value="6months">Últimos 6 Meses</SelectItem>
                <SelectItem value="1year">Último Ano</SelectItem>
                <SelectItem value="all">Todo Período</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={() => handleExportReport("completo")}>
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="font-bold text-xl">
                    {formatCurrency(totalIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entries.filter((e) => e.type === "income").length}{" "}
                    lançamentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Despesa Total</p>
                  <p className="font-bold text-xl">
                    {formatCurrency(totalExpenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entries.filter((e) => e.type === "expense").length}{" "}
                    lançamentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Atual</p>
                  <p
                    className={`font-bold text-xl ${balance >= 0 ? "text-success" : "text-destructive"}`}
                  >
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {balance >= 0 ? "Superávit" : "Déficit"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Taxa de Economia
                  </p>
                  <p className="font-bold text-xl">{savingsRate.toFixed(1)}%</p>
                  <p className="text-xs text-muted-foreground">
                    {savingsRate >= 20
                      ? "Excelente!"
                      : savingsRate >= 10
                        ? "Bom"
                        : "Pode melhorar"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="trends">Tendências</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Balance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Evolução Mensal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "currentColor" }}
                        tickLine={{ stroke: "currentColor" }}
                        axisLine={{ stroke: "currentColor" }}
                      />
                      <YAxis
                        tick={{ fill: "currentColor" }}
                        tickLine={{ stroke: "currentColor" }}
                        axisLine={{ stroke: "currentColor" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="receitas" fill="#22c55e" name="Receitas" />
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Balance Trend Line */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Tendência do Saldo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="currentColor"
                        opacity={0.3}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "currentColor" }}
                        tickLine={{ stroke: "currentColor" }}
                        axisLine={{ stroke: "currentColor" }}
                      />
                      <YAxis
                        tick={{ fill: "currentColor" }}
                        tickLine={{ stroke: "currentColor" }}
                        axisLine={{ stroke: "currentColor" }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="saldo"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.1}
                        name="Saldo"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-success" />
                    <div>
                      <h4 className="font-semibold">Melhor Mês</h4>
                      <p className="text-sm text-muted-foreground">
                        Maio - {formatCurrency(3000)} de saldo
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-warning" />
                    <div>
                      <h4 className="font-semibold">Atenção</h4>
                      <p className="text-sm text-muted-foreground">
                        Gastos com alimentação +15%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">Meta de Economia</h4>
                      <p className="text-sm text-muted-foreground">
                        92% da meta mensal atingida
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Adicione alguns lançamentos para ver as tendências dos seus
                    dados
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Spending Pattern */}
                <Card>
                  <CardHeader>
                    <CardTitle>Padrão Semanal de Movimentação</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={weeklyTrendData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="currentColor"
                          opacity={0.3}
                        />
                        <XAxis
                          dataKey="day"
                          tick={{ fill: "currentColor" }}
                          tickLine={{ stroke: "currentColor" }}
                          axisLine={{ stroke: "currentColor" }}
                        />
                        <YAxis
                          tick={{ fill: "currentColor" }}
                          tickLine={{ stroke: "currentColor" }}
                          axisLine={{ stroke: "currentColor" }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="valor"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          name="Valor Médio"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Real Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo Financeiro</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div>
                        <p className="font-medium">Total de Receitas</p>
                        <p className="text-sm text-muted-foreground">
                          {entries.filter((e) => e.type === "income").length}{" "}
                          lançamentos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-success">
                          {formatCurrency(totalIncome)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                      <div>
                        <p className="font-medium">Total de Despesas</p>
                        <p className="text-sm text-muted-foreground">
                          {entries.filter((e) => e.type === "expense").length}{" "}
                          lançamentos
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-destructive">
                          {formatCurrency(totalExpenses)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                      <div>
                        <p className="font-medium">Saldo Final</p>
                        <p className="text-sm text-muted-foreground">
                          {balance >= 0
                            ? "Resultado positivo"
                            : "Resultado negativo"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}
                        >
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-muted rounded-lg">
                      <h4 className="font-semibold mb-2">Taxa de Economia</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-background rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(savingsRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {savingsRate.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {savingsRate >= 20
                          ? "Excelente controle financeiro!"
                          : savingsRate >= 10
                            ? "Bom desempenho, continue assim!"
                            : "Considere revisar seus gastos"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryExpensesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {categoryExpensesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category Ranking */}
              <Card>
                <CardHeader>
                  <CardTitle>Ranking de Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {categoryExpensesData
                      .sort((a, b) => b.value - a.value)
                      .map((category, index) => (
                        <div
                          key={category.name}
                          className="flex items-center gap-3"
                        >
                          <Badge
                            variant="outline"
                            className="w-6 h-6 p-0 justify-center"
                          >
                            {index + 1}
                          </Badge>
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <div className="flex-1">
                            <p className="font-medium">{category.name}</p>
                            <div className="w-full bg-muted rounded-full h-2 mt-1">
                              <div
                                className="h-2 rounded-full"
                                style={{
                                  backgroundColor: category.color,
                                  width: `${(category.value / Math.max(...categoryExpensesData.map((c) => c.value))) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatCurrency(category.value)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(
                                (category.value /
                                  categoryExpensesData.reduce(
                                    (sum, c) => sum + c.value,
                                    0,
                                  )) *
                                100
                              ).toFixed(1)}
                              %
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {entries.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    Adicione lançamentos para ver comparações e análises
                    detalhadas
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Receitas vs Despesas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Receitas</span>
                        <span className="text-sm text-success font-medium">
                          {formatCurrency(totalIncome)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4">
                        <div
                          className="bg-success h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              totalIncome + totalExpenses > 0
                                ? (totalIncome /
                                    (totalIncome + totalExpenses)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Despesas</span>
                        <span className="text-sm text-destructive font-medium">
                          {formatCurrency(totalExpenses)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-4">
                        <div
                          className="bg-destructive h-4 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              totalIncome + totalExpenses > 0
                                ? (totalExpenses /
                                    (totalIncome + totalExpenses)) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="font-semibold">Total de Lançamentos</h4>
                        <p className="text-3xl font-bold text-primary mt-2">
                          {entries.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          registros financeiros
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="font-semibold">Categorias Utilizadas</h4>
                        <p className="text-3xl font-bold text-warning mt-2">
                          {[...new Set(entries.map((e) => e.category))].length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          categorias ativas
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h4 className="font-semibold">Maior Movimentação</h4>
                        <p className="text-3xl font-bold text-accent mt-2">
                          {formatCurrency(
                            Math.max(
                              ...entries.map((e) => Math.abs(e.amount)),
                              0,
                            ),
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          maior valor registrado
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Period Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resumo do Período</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">
                          Receitas por Categoria
                        </h4>
                        <div className="space-y-2">
                          {[
                            ...new Set(
                              entries
                                .filter((e) => e.type === "income")
                                .map((e) => e.category),
                            ),
                          ].map((category) => {
                            const total = entries
                              .filter(
                                (e) =>
                                  e.category === category &&
                                  e.type === "income",
                              )
                              .reduce((sum, e) => sum + e.amount, 0);
                            return (
                              <div
                                key={category}
                                className="flex justify-between"
                              >
                                <span className="text-sm">{category}</span>
                                <span className="text-sm font-medium text-success">
                                  {formatCurrency(total)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-3">
                          Despesas por Categoria
                        </h4>
                        <div className="space-y-2">
                          {[
                            ...new Set(
                              entries
                                .filter((e) => e.type === "expense")
                                .map((e) => e.category),
                            ),
                          ].map((category) => {
                            const total = Math.abs(
                              entries
                                .filter(
                                  (e) =>
                                    e.category === category &&
                                    e.type === "expense",
                                )
                                .reduce((sum, e) => sum + e.amount, 0),
                            );
                            return (
                              <div
                                key={category}
                                className="flex justify-between"
                              >
                                <span className="text-sm">{category}</span>
                                <span className="text-sm font-medium text-destructive">
                                  {formatCurrency(total)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
