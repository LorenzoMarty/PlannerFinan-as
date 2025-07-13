import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit2, Trash2, TrendingUp, TrendingDown } from "lucide-react";

const CategoryCard = ({ category, stats, handleEdit, handleDelete, formatCurrency }) => (
  <Card key={category.id} className={`border-${category.type === 'income' ? 'success' : 'destructive'}/20`}>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
            style={{ backgroundColor: category.color }}
          >
            {category.icon}
          </div>
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            {category.description && (
              <p className="text-xs text-muted-foreground">
                {category.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(category)}
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDelete(category.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className={`font-medium text-${category.type === 'income' ? 'success' : 'destructive'}`}>
            {formatCurrency(stats.total)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Lançamentos</span>
          <span className="font-medium">{stats.count}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const CategoryList = ({
  incomeCategories,
  expenseCategories,
  getCategoryStats,
  handleEdit,
  handleDelete,
  formatCurrency,
}) => (
  <div className="space-y-8">
    {incomeCategories.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-success" />
          <h2 className="text-xl font-semibold">Categorias de Receita</h2>
          <Badge variant="secondary">{incomeCategories.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {incomeCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              stats={getCategoryStats(category.name)}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </div>
    )}

    {incomeCategories.length > 0 && expenseCategories.length > 0 && (
      <Separator />
    )}

    {expenseCategories.length > 0 && (
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-5 h-5 text-destructive" />
          <h2 className="text-xl font-semibold">Categorias de Despesa</h2>
          <Badge variant="secondary">{expenseCategories.length}</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              stats={getCategoryStats(category.name)}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      </div>
    )}
  </div>
);
