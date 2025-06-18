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
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label for slices smaller than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-xs font-medium"
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

export default function CategoryChart() {
  const { entries, categories } = useUserData();

  // Calculate category data from entries
  const categoryData = categories
    .filter((cat) => cat.type === "expense")
    .map((category) => {
      const categoryEntries = entries.filter(
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
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>Nenhuma despesa registrada ainda</p>
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
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Chart */}
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
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
          <div className="space-y-3 lg:min-w-[200px]">
            <h4 className="font-medium text-sm">Categorias</h4>
            {categoryData.map((item) => {
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium">
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
      </CardContent>
    </Card>
  );
}
