import { useState } from "react";
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

// Mock data for charts
const monthlyData = [
  { name: "Jan", receitas: 8500, despesas: 6200, saldo: 2300 },
  { name: "Fev", receitas: 8800, despesas: 5900, saldo: 2900 },
  { name: "Mar", receitas: 9200, despesas: 6800, saldo: 2400 },
  { name: "Abr", receitas: 8600, despesas: 7100, saldo: 1500 },
  { name: "Mai", receitas: 9500, despesas: 6500, saldo: 3000 },
  { name: "Jun", receitas: 8900, despesas: 6300, saldo: 2600 },
];

const categoryExpensesData = [
  { name: "Alimentação", value: 1850, color: "#ef4444" },
  { name: "Transporte", value: 920, color: "#f97316" },
  { name: "Moradia", value: 2100, color: "#eab308" },
  { name: "Lazer", value: 680, color: "#22c55e" },
  { name: "Saúde", value: 420, color: "#3b82f6" },
  { name: "Educação", value: 530, color: "#8b5cf6" },
];

const weeklyTrendData = [
  { day: "Seg", valor: 120 },
  { day: "Ter", valor: 85 },
  { day: "Qua", valor: 200 },
  { day: "Thu", valor: 95 },
  { day: "Sex", valor: 150 },
  { day: "Sáb", valor: 220 },
  { day: "Dom", valor: 180 },
];

const comparisonData = [
  { periodo: "Jan 2024", atual: 8500, anterior: 7800 },
  { periodo: "Fev 2024", atual: 8800, anterior: 8200 },
  { periodo: "Mar 2024", atual: 9200, anterior: 8600 },
  { periodo: "Abr 2024", atual: 8600, anterior: 9100 },
  { periodo: "Mai 2024", atual: 9500, anterior: 8900 },
  { periodo: "Jun 2024", atual: 8900, anterior: 8400 },
];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("6months");
  const [selectedComparison, setSelectedComparison] = useState("previous-year");

  const handleExportReport = (type: string) => {
    toast.success(`Exportando relatório ${type}...`);
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
                  <p className="font-bold text-xl">{formatCurrency(53500)}</p>
                  <p className="text-xs text-success">
                    +12.5% vs período anterior
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
                  <p className="font-bold text-xl">{formatCurrency(38800)}</p>
                  <p className="text-xs text-destructive">
                    +8.2% vs período anterior
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
                  <p className="text-sm text-muted-foreground">Saldo Médio</p>
                  <p className="font-bold text-xl">{formatCurrency(2450)}</p>
                  <p className="text-xs text-primary">
                    +18.7% vs período anterior
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
                  <p className="font-bold text-xl">27.5%</p>
                  <p className="text-xs text-muted-foreground">Meta: 30%</p>
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
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
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
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Spending Pattern */}
              <Card>
                <CardHeader>
                  <CardTitle>Padrão Semanal de Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="valor"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        name="Gasto Médio"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Trend Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise de Tendências</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                    <div>
                      <p className="font-medium">Receitas</p>
                      <p className="text-sm text-muted-foreground">
                        Tendência crescente
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-success text-success-foreground"
                    >
                      +12.5%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                    <div>
                      <p className="font-medium">Despesas</p>
                      <p className="text-sm text-muted-foreground">
                        Crescimento moderado
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-warning text-warning-foreground"
                    >
                      +8.2%
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                    <div>
                      <p className="font-medium">Saldo</p>
                      <p className="text-sm text-muted-foreground">
                        Melhoria significativa
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-primary text-primary-foreground"
                    >
                      +18.7%
                    </Badge>
                  </div>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">
                      Projeção para próximo mês
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Com base nas tendências atuais, o saldo estimado para
                      julho é de{" "}
                      <span className="font-medium text-primary">
                        {formatCurrency(2800)}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
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
            <div className="mb-4">
              <Select
                value={selectedComparison}
                onValueChange={setSelectedComparison}
              >
                <SelectTrigger className="w-full sm:w-[250px]">
                  <SelectValue placeholder="Comparar com..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous-year">Ano anterior</SelectItem>
                  <SelectItem value="previous-period">
                    Período anterior
                  </SelectItem>
                  <SelectItem value="budget">Orçamento planejado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Comparação: Período Atual vs Ano Anterior</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="periodo" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="atual" fill="#3b82f6" name="Período Atual" />
                    <Bar
                      dataKey="anterior"
                      fill="#6b7280"
                      name="Ano Anterior"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Comparison Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-semibold">Variação Total</h4>
                    <p className="text-3xl font-bold text-success mt-2">
                      +15.3%
                    </p>
                    <p className="text-sm text-muted-foreground">
                      vs ano anterior
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-semibold">Melhor Mês</h4>
                    <p className="text-3xl font-bold text-primary mt-2">Mai</p>
                    <p className="text-sm text-muted-foreground">
                      +42% vs ano anterior
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="text-center">
                    <h4 className="font-semibold">Economia Adicional</h4>
                    <p className="text-3xl font-bold text-warning mt-2">
                      {formatCurrency(4200)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      vs ano anterior
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
