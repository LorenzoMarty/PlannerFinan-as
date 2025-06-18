import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useUserData } from "@/contexts/UserDataContext";

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  viewBox,
}: any) => {
  // Don't show label for slices smaller than 8%
  if (percent < 0.08) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Adjust font size based on chart size
  const isMobile = viewBox?.width < 300;
  const fontSize = isMobile ? "10px" : "12px";

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="font-medium drop-shadow-sm"
      style={{ fontSize }}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(data.value)}
        </p>
      </div>
    );
  }
  return null;
};

interface CategoryChartProps {
  filteredEntries?: any[];
}

export default function CategoryChart({ filteredEntries }: CategoryChartProps) {
  const { entries, categories } = useUserData();

  // Use filtered entries if provided, otherwise use all entries
  const chartEntries = filteredEntries || entries;

  // Calculate category data from entries
  const categoryData = categories
    .filter((cat) => cat.type === "expense")
    .map((category) => {
      const categoryEntries = chartEntries.filter(
        (entry) => entry.category === category.name && entry.type === "expense",
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
    .filter((item) => item.value > 0) // Only show categories with expenses
    .sort((a, b) => b.value - a.value); // Sort by value descending

  const total = categoryData.reduce((sum, item) => sum + item.value, 0);

  if (categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Despesas por Categoria
            <span className="text-sm font-normal text-muted-foreground">
              {new Date().toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
            <div className="text-center space-y-2">
              <p className="text-sm sm:text-base">
                Nenhuma despesa registrada ainda
              </p>
              <p className="text-xs text-muted-foreground/70">
                Adicione lançamentos para visualizar o gráfico
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Despesas por Categoria
          <span className="text-sm font-normal text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Chart */}
          <div className="flex-1 flex justify-center">
            <ResponsiveContainer width="100%" height={300} minWidth={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  innerRadius="0%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="xl:min-w-[200px] xl:max-w-[250px]">
            <h4 className="font-medium text-sm mb-3">Categorias</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
              {categoryData.map((item) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm truncate font-medium">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
