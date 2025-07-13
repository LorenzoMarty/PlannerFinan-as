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
import { useCategoryForm } from "@/hooks/useCategoryForm";
import { useCategoryData } from "@/hooks/useCategoryData";
import { CategoryForm } from "@/components/categories/CategoryForm";
import { CategoryList } from "@/components/categories/CategoryList";
import { CategoryStats } from "@/components/categories/CategoryStats";

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
  const {
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    setEditingCategory,
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    handleEdit,
  } = useCategoryForm(addCategory, updateCategory);
  const {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredCategories,
    getCategoryStats,
    incomeCategories,
    expenseCategories,
  } = useCategoryData(categories, entries);

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

          <CategoryForm
            isDialogOpen={isDialogOpen}
            setIsDialogOpen={setIsDialogOpen}
            editingCategory={editingCategory}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            resetForm={resetForm}
          />
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

        <CategoryStats
          categories={categories}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />

        <CategoryList
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
          getCategoryStats={getCategoryStats}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          formatCurrency={formatCurrency}
        />
      </div>
    </AppLayout>
  );
}
