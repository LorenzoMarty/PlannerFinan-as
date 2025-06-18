import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface BudgetEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  userId: string;
  budgetId: string;
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
  icon: string;
  description?: string;
  userId: string;
}

export interface Budget {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  collaborators: string[];
  entries: BudgetEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  budgets: Budget[];
  categories: Category[];
  activeBudgetId: string;
}

interface UserDataContextType {
  currentUser: UserProfile | null;
  activeBudget: Budget | null;
  categories: Category[];
  entries: BudgetEntry[];

  // Budget operations
  createBudget: (name: string) => string;
  switchBudget: (budgetId: string) => void;

  // Entry operations
  addEntry: (entry: Omit<BudgetEntry, "id" | "userId" | "budgetId">) => void;
  updateEntry: (id: string, updates: Partial<BudgetEntry>) => void;
  deleteEntry: (id: string) => void;

  // Category operations
  addCategory: (category: Omit<Category, "id" | "userId">) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // User operations
  setUser: (user: { email: string; name: string }) => void;
  clearUser: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined,
);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};

const defaultCategories: Omit<Category, "id" | "userId">[] = [
  {
    name: "Salário",
    type: "income",
    color: "#22c55e",
    icon: "💰",
    description: "Salário principal",
  },
  {
    name: "Freelance",
    type: "income",
    color: "#3b82f6",
    icon: "💼",
    description: "Trabalhos extras e consultorias",
  },
  {
    name: "Alimentação",
    type: "expense",
    color: "#ef4444",
    icon: "🍽️",
    description: "Gastos com comida e restaurantes",
  },
  {
    name: "Transporte",
    type: "expense",
    color: "#f97316",
    icon: "🚗",
    description: "Combustível, transporte público, etc.",
  },
  {
    name: "Moradia",
    type: "expense",
    color: "#eab308",
    icon: "🏠",
    description: "Aluguel, condomínio, IPTU",
  },
  {
    name: "Lazer",
    type: "expense",
    color: "#8b5cf6",
    icon: "🎮",
    description: "Entretenimento e diversão",
  },
];

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Load user data on mount
  useEffect(() => {
    const authUser = localStorage.getItem("plannerfinUser");
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.authenticated) {
          loadUserProfile(user);
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
  }, []);

  // Save user data whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `plannerfinUserData_${currentUser.id}`,
        JSON.stringify(currentUser),
      );
    }
  }, [currentUser]);

  const loadUserProfile = (authUser: any) => {
    const userId = btoa(authUser.email); // Simple ID generation
    const existingData = localStorage.getItem(`plannerfinUserData_${userId}`);

    if (existingData) {
      try {
        const userData = JSON.parse(existingData);
        setCurrentUser(userData);
        return;
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    }

    // Create new user profile
    const newBudgetId = generateId();
    const newProfile: UserProfile = {
      id: userId,
      email: authUser.email,
      name: authUser.name,
      activeBudgetId: newBudgetId,
      categories: defaultCategories.map((cat) => ({
        ...cat,
        id: generateId(),
        userId,
      })),
      budgets: [
        {
          id: newBudgetId,
          name: "Orçamento Principal",
          code: generateBudgetCode(),
          ownerId: userId,
          collaborators: [],
          entries: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    setCurrentUser(newProfile);
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateBudgetCode = () =>
    "PF" + Math.random().toString(36).substr(2, 6).toUpperCase();

  const setUser = (user: { email: string; name: string }) => {
    loadUserProfile(user);
  };

  const clearUser = () => {
    setCurrentUser(null);
  };

  const createBudget = (name: string): string => {
    if (!currentUser) return "";

    const newBudgetId = generateId();
    const newBudget: Budget = {
      id: newBudgetId,
      name,
      code: generateBudgetCode(),
      ownerId: currentUser.id,
      collaborators: [],
      entries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser({
      ...currentUser,
      budgets: [...currentUser.budgets, newBudget],
      activeBudgetId: newBudgetId,
    });

    return newBudgetId;
  };

  const switchBudget = (budgetId: string) => {
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      activeBudgetId: budgetId,
    });
  };

  const addEntry = (
    entryData: Omit<BudgetEntry, "id" | "userId" | "budgetId">,
  ) => {
    if (!currentUser) return;

    const newEntry: BudgetEntry = {
      ...entryData,
      id: generateId(),
      userId: currentUser.id,
      budgetId: currentUser.activeBudgetId,
    };

    const updatedBudgets = currentUser.budgets.map((budget) =>
      budget.id === currentUser.activeBudgetId
        ? {
            ...budget,
            entries: [...budget.entries, newEntry],
            updatedAt: new Date().toISOString(),
          }
        : budget,
    );

    setCurrentUser({
      ...currentUser,
      budgets: updatedBudgets,
    });
  };

  const updateEntry = (id: string, updates: Partial<BudgetEntry>) => {
    if (!currentUser) return;

    const updatedBudgets = currentUser.budgets.map((budget) =>
      budget.id === currentUser.activeBudgetId
        ? {
            ...budget,
            entries: budget.entries.map((entry) =>
              entry.id === id ? { ...entry, ...updates } : entry,
            ),
            updatedAt: new Date().toISOString(),
          }
        : budget,
    );

    setCurrentUser({
      ...currentUser,
      budgets: updatedBudgets,
    });
  };

  const deleteEntry = (id: string) => {
    if (!currentUser) return;

    const updatedBudgets = currentUser.budgets.map((budget) =>
      budget.id === currentUser.activeBudgetId
        ? {
            ...budget,
            entries: budget.entries.filter((entry) => entry.id !== id),
            updatedAt: new Date().toISOString(),
          }
        : budget,
    );

    setCurrentUser({
      ...currentUser,
      budgets: updatedBudgets,
    });
  };

  const addCategory = (categoryData: Omit<Category, "id" | "userId">) => {
    if (!currentUser) return;

    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
      userId: currentUser.id,
    };

    setCurrentUser({
      ...currentUser,
      categories: [...currentUser.categories, newCategory],
    });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      categories: currentUser.categories.map((category) =>
        category.id === id ? { ...category, ...updates } : category,
      ),
    });
  };

  const deleteCategory = (id: string) => {
    if (!currentUser) return;

    // Check if category is used in any entries
    const activeBudget = currentUser.budgets.find(
      (b) => b.id === currentUser.activeBudgetId,
    );
    const categoryInUse = activeBudget?.entries.some(
      (entry) =>
        entry.category ===
        currentUser.categories.find((c) => c.id === id)?.name,
    );

    if (categoryInUse) {
      throw new Error("Não é possível excluir categoria em uso");
    }

    setCurrentUser({
      ...currentUser,
      categories: currentUser.categories.filter(
        (category) => category.id !== id,
      ),
    });
  };

  // Computed values
  const activeBudget = currentUser
    ? currentUser.budgets.find((b) => b.id === currentUser.activeBudgetId) ||
      null
    : null;

  const categories = currentUser ? currentUser.categories : [];
  const entries = activeBudget ? activeBudget.entries : [];

  return (
    <UserDataContext.Provider
      value={{
        currentUser,
        activeBudget,
        categories,
        entries,
        createBudget,
        switchBudget,
        addEntry,
        updateEntry,
        deleteEntry,
        addCategory,
        updateCategory,
        deleteCategory,
        setUser,
        clearUser,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
