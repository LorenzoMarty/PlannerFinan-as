import { Card, CardContent } from "@/components/ui/card";
import { Tags, TrendingUp, TrendingDown } from "lucide-react";

const StatCard = ({ icon, label, value }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="font-semibold text-xl">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CategoryStats = ({ categories, incomeCategories, expenseCategories }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <StatCard
      icon={<Tags className="w-5 h-5 text-primary" />}
      label="Total de Categorias"
      value={categories.length}
    />
    <StatCard
      icon={<TrendingUp className="w-5 h-5 text-success" />}
      label="Receitas"
      value={incomeCategories.length}
    />
    <StatCard
      icon={<TrendingDown className="w-5 h-5 text-destructive" />}
      label="Despesas"
      value={expenseCategories.length}
    />
  </div>
);
