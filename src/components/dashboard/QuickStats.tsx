import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  Share2,
} from "lucide-react";

const StatCard = ({ icon, label, value, colorClass }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${colorClass}/10 rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`font-semibold ${colorClass}`}>{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const QuickStats = ({
  filteredIncome,
  filteredExpenses,
  filteredBalance,
  filteredEntries,
  currentBudget,
  budgets,
}) => {
  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-success" />}
        label="Receitas"
        value={formatCurrency(filteredIncome)}
        colorClass="text-success"
      />
      <StatCard
        icon={<TrendingDown className="w-5 h-5 text-destructive" />}
        label="Despesas"
        value={formatCurrency(filteredExpenses)}
        colorClass="text-destructive"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-success" />}
        label="Saldo do Período"
        value={formatCurrency(filteredBalance)}
        colorClass={filteredBalance >= 0 ? "text-success" : "text-destructive"}
      />
      <StatCard
        icon={<Calendar className="w-5 h-5 text-primary" />}
        label="Lançamentos do Período"
        value={filteredEntries.length}
        colorClass="text-primary"
      />
      <StatCard
        icon={<Users className="w-5 h-5 text-accent" />}
        label="Colaboradores"
        value={(currentBudget?.collaborators.length || 0) + 1}
        colorClass="text-accent"
      />
      <StatCard
        icon={<Share2 className="w-5 h-5 text-warning" />}
        label="Planilhas"
        value={budgets.length}
        colorClass="text-warning"
      />
    </div>
  );
};
