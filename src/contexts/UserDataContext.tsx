import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { SupabaseDataService } from "@/services/SupabaseDataService";
import { supabase } from "@/lib/supabase";

// Data versioning for migrations
const CURRENT_DATA_VERSION = "1.0.0";

// Storage utilities for robust data persistence
class DataStorage {
  private static prefix = "plannerfinUserData_";
  private static settingsPrefix = "plannerfinSettings";
  private static backupPrefix = "plannerfinBackup_";

  static saveUserData(userId: string, data: UserProfile): boolean {
    if (typeof window === "undefined") return false;

    try {
      const dataWithVersion = {
        ...data,
        __version: CURRENT_DATA_VERSION,
        __lastSaved: new Date().toISOString(),
      };

      const serialized = JSON.stringify(dataWithVersion);
      localStorage.setItem(`${this.prefix}${userId}`, serialized);
      return true;
    } catch (error) {
      console.error("Error saving user data:", error);
      return false;
    }
  }

  static loadUserData(userId: string): UserProfile | null {
    if (typeof window === "undefined") return null;

    try {
      const stored = localStorage.getItem(`${this.prefix}${userId}`);
      if (!stored) return null;

      const parsed = JSON.parse(stored);
      const { __version, __lastSaved, ...userData } = parsed;
      return userData as UserProfile;
    } catch (error) {
      console.error("Error loading user data:", error);
      return null;
    }
  }
}

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
  useSupabase: boolean;

  // Budget operations
  createBudget: (name: string) => Promise<string>;
  switchBudget: (budgetId: string) => void;
  deleteBudget: (budgetId: string) => Promise<boolean>;

  // Entry operations
  addEntry: (
    entry: Omit<BudgetEntry, "id" | "userId" | "budgetId">,
  ) => Promise<void>;
  updateEntry: (id: string, updates: Partial<BudgetEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;

  // Category operations
  addCategory: (category: Omit<Category, "id" | "userId">) => Promise<void>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // User operations
  setUser: (user: { email: string; name: string }) => Promise<void>;
  updateProfile: (updates: {
    name?: string;
    bio?: string;
    phone?: string;
    location?: string;
    avatar?: string;
  }) => Promise<void>;
  clearUser: () => void;

  // Collaboration operations
  joinBudgetByCode: (code: string) => Promise<boolean>;
  findBudgetByCode: (code: string) => Promise<Budget | null>;
  leaveBudgetAsCollaborator: (budgetId: string) => Promise<boolean>;

  // Data management operations
  exportUserData: () => string;
  importUserData: (jsonData: string) => boolean;
  createManualBackup: () => boolean;
  getStorageInfo: () => { used: number; total: number; available: number };

  // Migration operations
  migrateToSupabase: () => Promise<boolean>;
  toggleStorageMode: () => Promise<void>;
  reloadUserData: () => Promise<void>;
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
    icon: "��️",
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
  const [useSupabase, setUseSupabase] = useState(true); // Default to Supabase
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize context and setup cleanup
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Verificar disponibilidade do Supabase de forma assíncrona
        const isAvailable = await SupabaseDataService.checkTablesAvailability();
        if (mounted) {
          setUseSupabase(isAvailable);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Error checking Supabase availability:", error);
        if (mounted) {
          setUseSupabase(false);
          setIsInitialized(true);
        }
      }
    };

    // Subscribe to auth state changes for session cleanup
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && mounted) {
        clearUser();
      }
    });

    initialize();

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
      // Clear state on unmount
      setCurrentUser(null);
      setIsLoading(false);
      setUseSupabase(true);
      setIsInitialized(false);
    };
  }, []);

  // Save user data whenever it changes
  useEffect(() => {
    if (currentUser && typeof window !== "undefined") {
      DataStorage.saveUserData(currentUser.id, currentUser);
    }
  }, [currentUser]);

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateBudgetCode = () =>
    "PF" + Math.random().toString(36).substr(2, 6).toUpperCase();

  const createDefaultUserProfile = (
    userId: string,
    authUser: any,
  ): UserProfile => {
    const newBudgetId = generateId();
    return {
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
  };

  const loadUserProfile = async (authUser: any) => {
    if (!authUser?.email) {
      console.error("Invalid user data");
      return;
    }

    try {
      let userId = '';
      
      // Tentar obter o ID do usuário de forma mais eficiente
      if (useSupabase) {
        const { data: { session } } = await supabase.auth.getSession();
        userId = session?.user?.id || '';
      }

      // Se não tiver ID do Supabase, gerar um baseado no email
      if (!userId) {
        userId = btoa(authUser.email);
      }

      // Se estivermos usando Supabase, tentar carregar o perfil
      if (useSupabase) {
        try {
          console.log("Loading user profile from Supabase for:", userId);
          const supabaseData = await SupabaseDataService.getUserProfile(userId);

          if (supabaseData) {
            console.log("Successfully loaded user profile from Supabase");
            setCurrentUser(supabaseData);
            return;
          }
        } catch (error) {
          console.warn(
            "Failed to load from Supabase, falling back to localStorage",
          );
          setUseSupabase(false);
        }
      }

      // Fallback to localStorage
      const existingData = DataStorage.loadUserData(userId);
      if (existingData) {
        setCurrentUser(existingData);
        return;
      }

      // Create default user profile
      const newProfile = createDefaultUserProfile(userId, authUser);
      setCurrentUser(newProfile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Create default user profile as fallback
      const newProfile = createDefaultUserProfile(
        btoa(authUser.email),
        authUser,
      );
      setCurrentUser(newProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (user: { email: string; name: string }) => {
    setIsLoading(true);
    try {
      // Primeiro, verificar se o Supabase está disponível
      const isAvailable = await SupabaseDataService.checkTablesAvailability();
      if (!isAvailable) {
        console.warn("Supabase não está disponível, usando localStorage");
        setUseSupabase(false);
      }

      await loadUserProfile(user);
    } catch (error) {
      console.error("Error setting user:", error);
      setUseSupabase(false);
      await loadUserProfile(user);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: {
    name?: string;
    bio?: string;
    phone?: string;
    location?: string;
    avatar?: string;
  }) => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      if (useSupabase) {
        await SupabaseDataService.updateUserProfile(currentUser.id, updates);
      }

      const updatedUser = {
        ...currentUser,
        name: updates.name ?? currentUser.name,
      };

      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearUser = useCallback(async () => {
    try {
      // Clear Supabase session if available
      if (useSupabase) {
        await supabase.auth.signOut();
      }

      // Clear all storage
      if (typeof window !== "undefined") {
        // Clear localStorage
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith("plannerfin")) {
            localStorage.removeItem(key);
          }
        });
        
        // Clear sessionStorage data
        Object.keys(sessionStorage).forEach(key => {
          if (key.startsWith("plannerfin")) {
            sessionStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error("Error during cleanup:", error);
    } finally {
      // Always reset state
      setCurrentUser(null);
      setIsLoading(false);
      setUseSupabase(true);
      setIsInitialized(false);
    }
  }, [useSupabase]);

  const createBudget = async (name: string): Promise<string> => {
    if (!currentUser) return "";
    setIsLoading(true);

    try {
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

      if (useSupabase) {
        await SupabaseDataService.createBudget(newBudget);
      }

      setCurrentUser({
        ...currentUser,
        budgets: [...currentUser.budgets, newBudget],
        activeBudgetId: newBudgetId,
      });

      return newBudgetId;
    } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchBudget = (budgetId: string) => {
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      activeBudgetId: budgetId,
    });
  };

  const deleteBudget = async (budgetId: string): Promise<boolean> => {
    if (!currentUser) return false;

    if (currentUser.budgets.length <= 1) {
      return false;
    }

    if (budgetId === currentUser.activeBudgetId) {
      return false;
    }

    const updatedBudgets = currentUser.budgets.filter(
      (budget) => budget.id !== budgetId,
    );

    setCurrentUser({
      ...currentUser,
      budgets: updatedBudgets,
    });

    return true;
  };

  const addEntry = async (
    entryData: Omit<BudgetEntry, "id" | "userId" | "budgetId">,
  ): Promise<void> => {
    if (!currentUser) return;
    setIsLoading(true);

    try {
      const newEntryId = generateId();
      const newEntry: BudgetEntry = {
        ...entryData,
        id: newEntryId,
        userId: currentUser.id,
        budgetId: currentUser.activeBudgetId,
      };

      if (useSupabase) {
        try {
          const savedEntryId =
            await SupabaseDataService.createBudgetEntry(newEntry);
          if (savedEntryId) {
            newEntry.id = savedEntryId;
          }
        } catch (error) {
          console.warn("Failed to save entry to Supabase");
          setUseSupabase(false);
        }
      }

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
    } catch (error) {
      console.error("Error adding entry:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEntry = async (
    id: string,
    updates: Partial<BudgetEntry>,
  ): Promise<void> => {
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

  const deleteEntry = async (id: string): Promise<void> => {
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

  const addCategory = async (
    categoryData: Omit<Category, "id" | "userId">,
  ): Promise<void> => {
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

  const updateCategory = async (
    id: string,
    updates: Partial<Category>,
  ): Promise<void> => {
    if (!currentUser) return;

    setCurrentUser({
      ...currentUser,
      categories: currentUser.categories.map((category) =>
        category.id === id ? { ...category, ...updates } : category,
      ),
    });
  };

  const deleteCategory = async (id: string): Promise<void> => {
    if (!currentUser) return;

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

  const findBudgetByCode = async (code: string): Promise<Budget | null> => {
    return null; // Simplified for now
  };

  const joinBudgetByCode = async (code: string): Promise<boolean> => {
    return false; // Simplified for now
  };

  const leaveBudgetAsCollaborator = async (
    budgetId: string,
  ): Promise<boolean> => {
    return false; // Simplified for now
  };

  // Data management methods - simplified
  const exportUserData = (): string => {
    return JSON.stringify(currentUser, null, 2);
  };

  const importUserData = (jsonData: string): boolean => {
    try {
      const userData = JSON.parse(jsonData);
      setCurrentUser(userData);
      return true;
    } catch {
      return false;
    }
  };

  const createManualBackup = (): boolean => {
    return true; // Simplified
  };

  const getStorageInfo = () => {
    return { used: 0, total: 0, available: 0 }; // Simplified
  };

  const migrateToSupabase = async (): Promise<boolean> => {
    return false; // Simplified for now
  };

  const toggleStorageMode = async () => {
    setUseSupabase(!useSupabase);
  };

  const reloadUserData = async (): Promise<void> => {
    // Simplified
  };

  // Computed values
  const activeBudget = currentUser
    ? currentUser.budgets.find((b) => b.id === currentUser.activeBudgetId) ||
      null
    : null;

  const categories = currentUser ? currentUser.categories : [];
  const entries = activeBudget ? activeBudget.entries : [];

  // Don't render children until context is initialized
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
        useSupabase,
        createBudget,
        switchBudget,
        deleteBudget,
        addEntry,
        updateEntry,
        deleteEntry,
        addCategory,
        updateCategory,
        deleteCategory,
        setUser,
        updateProfile,
        clearUser,
        joinBudgetByCode,
        findBudgetByCode,
        leaveBudgetAsCollaborator,
        exportUserData,
        importUserData,
        createManualBackup,
        getStorageInfo,
        migrateToSupabase,
        toggleStorageMode,
        reloadUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};