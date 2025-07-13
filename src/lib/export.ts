import { toast } from "sonner";

export const exportData = (filteredEntries, periodOptions, selectedMonth, currentBudget) => {
  if (filteredEntries.length === 0) {
    toast.error("Nenhum dado para exportar no período selecionado");
    return;
  }

  const selectedPeriodName =
    periodOptions.find((p) => p.value === selectedMonth)?.label ||
    selectedMonth;

  const exportData = {
    planilha: currentBudget?.name,
    periodo: selectedPeriodName,
    exportadoEm: new Date().toISOString(),
    resumo: {
      receitas: filteredEntries
        .filter((e) => e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0),
      despesas: Math.abs(
        filteredEntries
          .filter((e) => e.type === "expense")
          .reduce((sum, e) => sum + e.amount, 0),
      ),
      saldo: filteredEntries
        .filter((e) => e.type === "income")
        .reduce((sum, e) => sum + e.amount, 0) - Math.abs(
        filteredEntries
          .filter((e) => e.type === "expense")
          .reduce((sum, e) => sum + e.amount, 0),
      ),
      totalLancamentos: filteredEntries.length,
    },
    lancamentos: filteredEntries.map((entry) => ({
      data: entry.date,
      descricao: entry.description,
      categoria: entry.category,
      tipo: entry.type === "income" ? "Receita" : "Despesa",
      valor: entry.amount,
    })),
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `plannerfin-${selectedPeriodName.toLowerCase().replace(/\s+/g, "-")}.json`;
  link.click();
  URL.revokeObjectURL(url);

  toast.success("Dados exportados com sucesso!");
};
