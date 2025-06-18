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
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col items-center justify-center h-[250px] sm:h-[300px] text-muted-foreground">
            <div className="text-center space-y-3 max-w-sm">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-muted-foreground/30"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-medium">
                  Nenhuma despesa registrada
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground/70 leading-relaxed">
                  Adicione lançamentos de despesas para visualizar o gráfico de
                  categorias
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground/50">
                  💡 Dica: Use a aba "Dashboard" para adicionar novos
                  lançamentos
                </p>
              </div>
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
      <CardContent className="p-3 sm:p-6">
        {/* Mobile-first responsive layout */}
        <div className="space-y-4 lg:space-y-6">
          {/* Chart Container */}
          <div className="w-full">
            <div className="relative">
              <ResponsiveContainer
                width="100%"
                height={250}
                className="sm:!h-[300px] lg:!h-[350px]"
              >
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius="75%"
                    innerRadius="0%"
                    fill="#8884d8"
                    dataKey="value"
                    className="drop-shadow-sm"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Chart center info - only on larger screens */}
              <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(total)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Legend - Fully responsive */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h4 className="font-semibold text-sm sm:text-base">Categorias</h4>
              <div className="text-xs text-muted-foreground">
                Total:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(total)}
              </div>
            </div>

            {/* Responsive grid for category items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-2 sm:gap-3">
              {categoryData.map((item) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div
                    key={item.name}
                    className="group relative flex items-center justify-between gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
                        style={{ backgroundColor: item.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs sm:text-sm truncate font-medium block">
                          {item.name}
                        </span>
                        <div className="sm:hidden text-xs text-muted-foreground">
                          {percentage}%
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xs sm:text-sm font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(item.value)}
                      </div>
                      <div className="hidden sm:block text-xs text-muted-foreground">
                        {percentage}%
                      </div>
                    </div>

                    {/* Progress bar for mobile */}
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-current opacity-20 transition-all group-hover:opacity-40"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Maior Gasto</p>
                  <p className="text-sm font-semibold text-destructive">
                    {categoryData.length > 0 && categoryData[0].name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Categorias</p>
                  <p className="text-sm font-semibold">{categoryData.length}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">
                    Média por Categoria
                  </p>
                  <p className="text-sm font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(
                      categoryData.length > 0 ? total / categoryData.length : 0,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
