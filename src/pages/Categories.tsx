import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useUserData } from "@/contexts/UserDataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const colorOptions = [
  { name: "Vermelho", value: "#ef4444", class: "bg-red-500" },
  { name: "Laranja", value: "#f97316", class: "bg-orange-500" },
  { name: "Amarelo", value: "#eab308", class: "bg-yellow-500" },
  { name: "Verde", value: "#22c55e", class: "bg-green-500" },
  { name: "Azul", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Roxo", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Rosa", value: "#ec4899", class: "bg-pink-500" },
  { name: "Cinza", value: "#6b7280", class: "bg-gray-500" },
];

export default function Categories() {
  const { categories, entries, addCategory, updateCategory, deleteCategory } =
    useUserData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all",
  );
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#3b82f6",
    icon: "📊",
    description: "",
  });

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || category.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    const categoryData = {
      name: formData.name,
      type: formData.type,
      color: formData.color,
      icon: formData.icon,
      description: formData.description,
    };

    try {
      if (editingCategory) {
        updateCategory(editingCategory.id, categoryData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        addCategory(categoryData);
        toast.success("Categoria criada com sucesso!");
      }
      resetForm();
    } catch (error) {
      toast.error("Erro ao salvar categoria");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "expense",
      color: "#3b82f6",
      icon: "📊",
      description: "",
    });
    setEditingCategory(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color,
      icon: category.icon,
      description: category.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    try {
      deleteCategory(id);
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  // Calculate category usage stats
  const getCategoryStats = (categoryName: string) => {
    const categoryEntries = entries.filter(
      (entry) => entry.category === categoryName,
    );
    const total = categoryEntries.reduce(
      (sum, entry) => sum + Math.abs(entry.amount),
      0,
    );
    return {
      count: categoryEntries.length,
      total,
    };
  };

  const incomeCategories = filteredCategories.filter(
    (cat) => cat.type === "income",
  );
  const expenseCategories = filteredCategories.filter(
    (cat) => cat.type === "expense",
  );

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
            <p className="text-muted-foreground">
              Organize suas receitas e despesas em categorias personalizadas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingCategory(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Editar" : "Nova"} Categoria
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? "Edite as informações da categoria"
                    : "Crie uma nova categoria para organizar seus lançamentos"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Alimentação"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: "income" | "expense") =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">Receita</SelectItem>
                        <SelectItem value="expense">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Emoji/Ícone</Label>
                  <Input
                    id="icon"
                    placeholder="📊"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          formData.color === color.value
                            ? "border-primary scale-110"
                            : "border-muted hover:scale-105",
                          color.class,
                        )}
                        onClick={() =>
                          setFormData({ ...formData, color: color.value })
                        }
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição (opcional)</Label>
                  <Input
                    id="description"
                    placeholder="Descreva esta categoria..."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingCategory ? "Salvar" : "Criar"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select
            value={filterType}
            onValueChange={(value: any) => setFilterType(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Tags className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total de Categorias
                  </p>
                  <p className="font-semibold text-xl">{categories.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receitas</p>
                  <p className="font-semibold text-xl">
                    {incomeCategories.length}
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
                  <p className="text-sm text-muted-foreground">Despesas</p>
                  <p className="font-semibold text-xl">
                    {expenseCategories.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Sections */}
        <div className="space-y-8">
          {/* Income Categories */}
          {incomeCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-success" />
                <h2 className="text-xl font-semibold">Categorias de Receita</h2>
                <Badge variant="secondary">{incomeCategories.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {incomeCategories.map((category) => (
                  <Card key={category.id} className="border-success/20">
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
                            <CardTitle className="text-lg">
                              {category.name}
                            </CardTitle>
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
                      {(() => {
                        const stats = getCategoryStats(category.name);
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Total
                              </span>
                              <span className="font-medium text-success">
                                {formatCurrency(stats.total)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Lançamentos
                              </span>
                              <span className="font-medium">{stats.count}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Separator */}
          {incomeCategories.length > 0 && expenseCategories.length > 0 && (
            <Separator />
          )}

          {/* Expense Categories */}
          {expenseCategories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-destructive" />
                <h2 className="text-xl font-semibold">Categorias de Despesa</h2>
                <Badge variant="secondary">{expenseCategories.length}</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expenseCategories.map((category) => (
                  <Card key={category.id} className="border-destructive/20">
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
                            <CardTitle className="text-lg">
                              {category.name}
                            </CardTitle>
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
                      {(() => {
                        const stats = getCategoryStats(category.name);
                        return (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Total
                              </span>
                              <span className="font-medium text-destructive">
                                {formatCurrency(stats.total)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">
                                Lançamentos
                              </span>
                              <span className="font-medium">{stats.count}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Tags className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">
                  Nenhuma categoria encontrada
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm || filterType !== "all"
                    ? "Tente ajustar os filtros ou criar uma nova categoria"
                    : "Comece criando sua primeira categoria"}
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Categoria
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
