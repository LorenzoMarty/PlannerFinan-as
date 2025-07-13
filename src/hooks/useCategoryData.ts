import { useState } from "react";

export const useCategoryData = (categories, entries) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredCategories = categories.filter((category) => {
    const matchesSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || category.type === filterType;
    return matchesSearch && matchesType;
  });

  const getCategoryStats = (categoryName) => {
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

  return {
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filteredCategories,
    getCategoryStats,
    incomeCategories,
    expenseCategories,
  };
};
