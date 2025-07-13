import { useState } from "react";
import { useUserData } from "@/contexts/UserDataContext";
import { toast } from "sonner";

export const useBudgetLogic = () => {
  const { currentUser, activeBudget, entries, createBudget, switchBudget } =
    useUserData();

  const [selectedBudget, setSelectedBudget] = useState(activeBudget?.id || "");

  const budgets = currentUser?.budgets || [];
  const currentBudget = activeBudget;

  const handleBudgetChange = (budgetId: string) => {
    setSelectedBudget(budgetId);
    switchBudget(budgetId);
  };

  const handleCreateBudget = () => {
    const name = prompt("Nome da nova planilha:");
    if (name && name.trim()) {
      const newBudgetId = createBudget(name.trim());
      setSelectedBudget(newBudgetId);
      toast.success("Nova planilha criada!");
    }
  };

  const handleShareBudget = () => {
    if (currentBudget) {
      navigator.clipboard.writeText(currentBudget.code);
      toast.success(
        `Código ${currentBudget.code} copiado! Compartilhe com outros usuários.`,
      );
    }
  };

  return {
    budgets,
    currentBudget,
    selectedBudget,
    handleBudgetChange,
    handleCreateBudget,
    handleShareBudget,
  };
};
