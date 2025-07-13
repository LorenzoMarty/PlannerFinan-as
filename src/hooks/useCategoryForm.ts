import { useState } from "react";
import { toast } from "sonner";

export const useCategoryForm = (addCategory, updateCategory) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "expense" as "income" | "expense",
    color: "#3b82f6",
    icon: "📊",
    description: "",
  });

  const handleSubmit = (e) => {
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

  const handleEdit = (category) => {
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

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingCategory,
    setEditingCategory,
    formData,
    setFormData,
    handleSubmit,
    resetForm,
    handleEdit,
  };
};
