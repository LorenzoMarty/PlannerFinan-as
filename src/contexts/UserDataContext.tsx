import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SupabaseDataService } from "@/services/SupabaseDataService";
import { supabase } from "@/lib/supabase";

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
  isLoading: boolean;
  createBudget: (name: string) => Promise<string>;
  switchBudget: (budgetId: string) => void;
  deleteBudget: (budgetId: string) => Promise<boolean>;
  addEntry: (
    entry: Omit<BudgetEntry, "id" | "userId" | "budgetId">
  ) => Promise<void>;
  updateEntry: (id: string, updates: Partial<BudgetEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "userId">) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  setUser: (user: { email: string; name: string }) => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    bio?: string;
    phone?: string;
    location?: string;
    avatar?: string;
  }) => Promise<void>;
  clearUser: () => void;
  joinBudgetByCode: (code: string) => Promise<boolean>;
  findBudgetByCode: (code: string) => Promise<Budget | null>;
  leaveBudgetAsCollaborator: (budgetId: string) => Promise<boolean>;
  exportUserData: () => string;
  importUserData: (jsonData: string) => boolean;
  createManualBackup: () => boolean;
  getStorageInfo: () => { used: number; total: number; available: number };
  reloadUserData: () => Promise<void>;
}

const UserDataContext = createContext<UserDataContextType | undefined>(
  undefined
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
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window === "undefined") return;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const authUser = {
          email: session.user.email || "",
          name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Usuário",
          authenticated: true,
        };
        await loadUserProfile(authUser);
      }
    };
    initializeApp().finally(() => setIsInitialized(true));
  }, []);

  // ... (restante dos métodos e lógica do provider, igual ao anterior)
  // Por questão de espaço, mantenha o restante do provider igual ao último estado funcional, sem JSX estranho ou duplicado.

  // Computed values
  const activeBudget = currentUser
    ? currentUser.budgets.find((b) => b.id === currentUser.activeBudgetId) || null
    : null;
  const categories = currentUser ? currentUser.categories : [];
  const entries = activeBudget ? activeBudget.entries : [];

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <UserDataContext.Provider
      value={{
        currentUser,
        activeBudget,
        categories,
        entries,
        isLoading,
        // ...demais métodos do contexto
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
