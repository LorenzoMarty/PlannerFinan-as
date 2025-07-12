import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

      // Create backup before saving new data
      this.createBackup(userId);

      // Save main data
      localStorage.setItem(`${this.prefix}${userId}`, serialized);

      // Update metadata
      this.updateStorageMetadata();

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

      // Version migration (if needed in the future)
      const migrated = this.migrateDataIfNeeded(parsed);

      // Remove version metadata from returned data
      const { __version, __lastSaved, ...userData } = migrated;

      return userData as UserProfile;
    } catch (error) {
      console.error("Error loading user data:", error);
      // Try to recover from backup
      return this.recoverFromBackup(userId);
    }
  }

  static createBackup(userId: string): boolean {
    if (typeof window === "undefined") return false;

    try {
      const existing = localStorage.getItem(`${this.prefix}${userId}`);
      if (!existing) return false;

      const backupKey = `${this.backupPrefix}${userId}_${Date.now()}`;
      localStorage.setItem(backupKey, existing);

      // Keep only last 5 backups per user
      this.cleanupOldBackups(userId);

      return true;
    } catch (error) {
      console.error("Error creating backup:", error);
      return false;
    }
  }

  static recoverFromBackup(userId: string): UserProfile | null {
    if (typeof window === "undefined") return null;

    try {
      const backupKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith(`${this.backupPrefix}${userId}_`))
        .sort()
        .reverse(); // Most recent first

      for (const key of backupKeys) {
        try {
          const backup = localStorage.getItem(key);
          if (backup) {
            const parsed = JSON.parse(backup);
            const { __version, __lastSaved, ...userData } = parsed;
            console.log(`Recovered data from backup: ${key}`);
            return userData as UserProfile;
          }
        } catch (backupError) {
          continue; // Try next backup
        }
      }

      return null;
    } catch (error) {
      console.error("Error recovering from backup:", error);
      return null;
    }
  }

  static cleanupOldBackups(userId: string): void {
    try {
      const backupKeys = Object.keys(localStorage)
        .filter((key) => key.startsWith(`${this.backupPrefix}${userId}_`))
        .sort()
        .reverse();

      // Keep only last 5 backups
      const toDelete = backupKeys.slice(5);
      toDelete.forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error cleaning up backups:", error);
    }
  }

  static updateStorageMetadata(): void {
    try {
      const metadata = {
        lastUpdated: new Date().toISOString(),
        dataVersion: CURRENT_DATA_VERSION,
        userCount: Object.keys(localStorage).filter((key) =>
          key.startsWith(this.prefix),
        ).length,
      };

      localStorage.setItem("plannerfinMetadata", JSON.stringify(metadata));
    } catch (error) {
      console.error("Error updating metadata:", error);
    }
  }

  static migrateDataIfNeeded(data: any): any {
    if (!data.__version) {
      // Migrate from version 0 (no version) to current
      return {
        ...data,
        __version: CURRENT_DATA_VERSION,
      };
    }

    // Future migrations would go here
    return data;
  }

  static exportAllData(): string {
    try {
      const allData: any = {};

      // Export all user data
      Object.keys(localStorage).forEach((key) => {
        if (
          key.startsWith(this.prefix) ||
          key === this.settingsPrefix ||
          key === "plannerfinMetadata"
        ) {
          allData[key] = JSON.parse(localStorage.getItem(key) || "{}");
        }
      });

      return JSON.stringify(
        {
          exportDate: new Date().toISOString(),
          version: CURRENT_DATA_VERSION,
          data: allData,
        },
        null,
        2,
      );
    } catch (error) {
      console.error("Error exporting data:", error);
      return "";
    }
  }

  static importAllData(jsonData: string): boolean {
    try {
      const parsed = JSON.parse(jsonData);

      if (!parsed.data || !parsed.version) {
        throw new Error("Invalid export format");
      }

      // Create backup before import
      const timestamp = Date.now();
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.prefix) || key === this.settingsPrefix) {
          const backupKey = `import_backup_${timestamp}_${key}`;
          localStorage.setItem(backupKey, localStorage.getItem(key) || "");
        }
      });

      // Import data
      Object.entries(parsed.data).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }

  static getStorageInfo(): { used: number; total: number; available: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)!.length + key.length;
        }
      }

      // localStorage limit is typically 5-10MB
      const estimated = 5 * 1024 * 1024; // 5MB

      return {
        used,
        total: estimated,
        available: Math.max(0, estimated - used),
      };
    } catch (error) {
      return { used: 0, total: 0, available: 0 };
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

  // Load user data on mount and setup auth state listener
  useEffect(() => {
    const initializeApp = async () => {
      if (typeof window === "undefined") return;

      // Sempre usar Supabase, não há mais modo local
      setIsInitialized(true);

      const authUser = localStorage.getItem("plannerfinUser");
      if (authUser) {
        try {
          const user = JSON.parse(authUser);
          if (user.authenticated) {
            await loadUserProfile(user);
          }
        } catch (error) {
          console.error("Error loading user:", error);
          localStorage.removeItem("plannerfinUser");
        }
      }
    };

    initializeApp().finally(() => {
      setIsInitialized(true);
    });

    // Listen for Supabase auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);

      if (event === "SIGNED_OUT") {
        // User signed out, clear session data
        console.log("User signed out, clearing data");
        setCurrentUser(null);
        localStorage.removeItem("plannerfinUser");
      } else if (event === "SIGNED_IN" && session?.user) {
        // User signed in, load their profile data
        console.log(
          "User signed in, loading profile data for:",
          session.user.id,
        );

        // Check if localStorage has user data for this session
        const authUser = localStorage.getItem("plannerfinUser");
        if (authUser) {
          try {
            const user = JSON.parse(authUser);
            if (user.authenticated) {
              console.log("Loading user profile from auth state change");
              await loadUserProfile(user);
            }
          } catch (error) {
            console.error("Error loading user after sign in:", error);
          }
        } else {
          // No localStorage data, create minimal user data to trigger loading
          const userData = {
            email: session.user.email || "",
            name:
              session.user.user_metadata?.name ||
              session.user.email?.split("@")[0] ||
              "Usuário",
            authenticated: true,
          };

          localStorage.setItem("plannerfinUser", JSON.stringify(userData));
          console.log("Loading user profile for new authenticated user");
          await loadUserProfile(userData);
        }
      } else if (event === "TOKEN_REFRESHED" && session) {
        // Token refreshed successfully, reload user data if needed
        const authUser = localStorage.getItem("plannerfinUser");
        if (authUser) {
          try {
            const user = JSON.parse(authUser);
            if (user.authenticated && currentUser) {
              // Reload user profile to sync with latest data
              console.log("Reloading user profile after token refresh");
              await loadUserProfile(user);
            }
          } catch (error) {
            console.error("Error reloading user after token refresh:", error);
          }
        }
      }
    });

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = async (e: StorageEvent) => {
      if (typeof window === "undefined") return;

      if (e.key === "plannerfinUser") {
        const authUser = localStorage.getItem("plannerfinUser");
        if (authUser) {
          try {
            const user = JSON.parse(authUser);
            if (user.authenticated) {
              await loadUserProfile(user);
            }
          } catch (error) {
            console.error("Error loading user:", error);
          }
        }
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
    }

    // Cleanup
    return () => {
      subscription?.unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, []);

  // Save user data whenever it changes with enhanced persistence
  useEffect(() => {
    if (currentUser && typeof window !== "undefined") {
      const success = DataStorage.saveUserData(currentUser.id, currentUser);
      if (!success) {
        console.warn("Failed to save user data to localStorage");
      }
    }
  }, [currentUser]);

  // Auto-backup every 10 minutes
  useEffect(() => {
    if (!currentUser || typeof window === "undefined") return;

    const interval = setInterval(
      () => {
        const success = DataStorage.createBackup(currentUser.id);
        if (success) {
          console.log("📦 Backup automático criado com sucesso");
        }
      },
      10 * 60 * 1000,
    ); // 10 minutes

    return () => clearInterval(interval);
  }, [currentUser]);

  // Listen for session changes to reload data when user changes
  useEffect(() => {
  const checkSessionChanges = async () => {
  const {
  data: { session },
  } = await supabase.auth.getSession();
  const authUser = localStorage.getItem("plannerfinUser");
  
  if (session?.user && authUser) {
  try {
  const storedUser = JSON.parse(authUser);
  // If the session user ID doesn't match stored user, reload data
  if (session.user.id !== currentUser?.id && storedUser.authenticated) {
  console.log("Session user changed, reloading data");
  await loadUserProfile(storedUser);
  }
  } catch (error) {
  console.error("Error checking session changes:", error);
  }
  }
  };
  
  // Check periodically for session changes
  const sessionInterval = setInterval(checkSessionChanges, 5000);
  
  return () => clearInterval(sessionInterval);
  }, [currentUser?.id]);

  const loadUserProfile = async (authUser: any) => {
    setIsLoading(true);

    try {
      // Get current Supabase session to ensure we have the correct user ID
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        // Clear invalid session and fall back to localStorage
        await supabase.auth.signOut();
      }

      const userId = session?.user?.id || btoa(authUser.email);

      if (session?.user && !sessionError) {
        // Check if Supabase tables are available first
        const tablesAvailable =
          await SupabaseDataService.checkTablesAvailability();

        if (!tablesAvailable) {
          throw new Error("Tables not available");
        }

        // Try to load existing user data from Supabase
        console.log("Loading user profile from Supabase for:", userId);
        let supabaseData = await SupabaseDataService.getUserProfile(userId);

        if (!supabaseData) {
          throw new Error(
            "User profile not found - please contatar o suporte ou registrar novamente",
          );
        }

        if (supabaseData) {
          console.log(
            "Successfully loaded user profile from Supabase:",
            supabaseData.email,
          );
          setCurrentUser(supabaseData);
          return;
        }
      }

      // Se não autenticado, não carrega perfil
      setCurrentUser(null);
    } catch (error) {
      console.error("Error loading user profile:", error);

      // Always fallback to localStorage on any error
      try {
        const existingData = DataStorage.loadUserData(btoa(authUser.email));
        if (existingData) {
          setCurrentUser(existingData);
          return;
        }

        // Create default user profile as last resort
        const newProfile = createDefaultUserProfile(
          btoa(authUser.email),
          authUser,
        );
        setCurrentUser(newProfile);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  const generateId = () => Math.random().toString(36).substr(2, 9);
  const generateBudgetCode = () =>
    "PF" + Math.random().toString(36).substr(2, 6).toUpperCase();

  const setUser = async (user: { email: string; name: string }) => {
    await loadUserProfile(user);
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
      // Update in Supabase
      const success = await SupabaseDataService.updateUserProfile(
        currentUser.id,
        updates,
      );
      if (!success) {
        throw new Error("Failed to update profile in Supabase");
      }

      // Update current user profile in UserDataContext
      const updatedUser = {
        ...currentUser,
        name: updates.name ?? currentUser.name,
      };

      // Update localStorage auth data
      const authUser = localStorage.getItem("plannerfinUser");
      if (authUser) {
        const parsed = JSON.parse(authUser);
        const updatedAuth = {
          ...parsed,
          name: updates.name ?? parsed.name,
          bio: updates.bio ?? parsed.bio,
          phone: updates.phone ?? parsed.phone,
          location: updates.location ?? parsed.location,
          avatar: updates.avatar ?? parsed.avatar,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("plannerfinUser", JSON.stringify(updatedAuth));
      }

      setCurrentUser(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearUser = () => {
    setCurrentUser(null);
  };

  const createBudget = async (name: string): Promise<string> => {
    if (!currentUser) return "";
    setIsLoading(true);

    try {
      const newBudgetId = SupabaseDataService.generateId();
      const newBudget: Budget = {
        id: newBudgetId,
        name,
        code: SupabaseDataService.generateBudgetCode(),
        ownerId: currentUser.id,
        collaborators: [],
        entries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const success = await SupabaseDataService.createBudget(newBudget);
      if (!success) {
        throw new Error("Failed to create budget in Supabase");
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

    // Can't delete if it's the only budget
    if (currentUser.budgets.length <= 1) {
      return false;
    }

    // Can't delete the currently active budget
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
      const newEntryId = SupabaseDataService.generateId();
      const newEntry: BudgetEntry = {
        ...entryData,
        id: newEntryId,
        userId: currentUser.id,
        budgetId: currentUser.activeBudgetId,
      };

      // First, ensure the active budget exists in Supabase
      const activeBudget = currentUser.budgets.find(
        (b) => b.id === currentUser.activeBudgetId,
      );

      if (activeBudget) {
        // Try to create budget in Supabase if it doesn't exist there
        await SupabaseDataService.createBudget(activeBudget);
      }

      const savedEntryId =
        await SupabaseDataService.createBudgetEntry(newEntry);
      if (savedEntryId) {
        newEntry.id = savedEntryId;
      }

      // Always update local state
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

  const findBudgetByCode = async (code: string): Promise<Budget | null> => {
    // Search through all users' data in localStorage to find budget by code
    const allKeys = Object.keys(localStorage);
    const userDataKeys = allKeys.filter((key) =>
      key.startsWith("plannerfinUserData_"),
    );

    for (const key of userDataKeys) {
      try {
        const userData = JSON.parse(localStorage.getItem(key) || "{}");
        if (userData.budgets) {
          const budget = userData.budgets.find((b: Budget) => b.code === code);
          if (budget) {
            return budget;
          }
        }
      } catch (error) {
        continue;
      }
    }

    return null;
  };

  const joinBudgetByCode = async (code: string): Promise<boolean> => {
    if (!currentUser) return false;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const targetBudget = await findBudgetByCode(code);

    if (!targetBudget) {
      return false;
    }

    // Check if user already has access to this budget
    const alreadyHasBudget = currentUser.budgets.some(
      (budget) => budget.code === code,
    );

    if (alreadyHasBudget) {
      return true; // Already has access
    }

    // Create a collaboration reference to the budget
    const collaborativeBudget: Budget = {
      ...targetBudget,
      collaborators: [...targetBudget.collaborators, currentUser.id],
    };

    // Add the budget to current user's budget list
    setCurrentUser({
      ...currentUser,
      budgets: [...currentUser.budgets, collaborativeBudget],
      activeBudgetId: collaborativeBudget.id,
    });

    return true;
  };

  const leaveBudgetAsCollaborator = async (
    budgetId: string,
  ): Promise<boolean> => {
    if (!currentUser) return false;

    const targetBudget = currentUser.budgets.find((b) => b.id === budgetId);
    if (!targetBudget) return false;

    // Check if user is not the owner (i.e., is a collaborator)
    if (targetBudget.ownerId === currentUser.id) {
      return false; // Owners can't "leave", they can only delete
    }

    // Remove budget from current user's list
    const updatedBudgets = currentUser.budgets.filter(
      (budget) => budget.id !== budgetId,
    );

    // If the leaving budget is the active one, switch to another
    let newActiveBudgetId = currentUser.activeBudgetId;
    if (budgetId === currentUser.activeBudgetId && updatedBudgets.length > 0) {
      newActiveBudgetId = updatedBudgets[0].id;
    }

    setCurrentUser({
      ...currentUser,
      budgets: updatedBudgets,
      activeBudgetId: newActiveBudgetId,
    });

    return true;
  };

  // Data management methods
  const exportUserData = (): string => {
    return DataStorage.exportAllData();
  };

  const importUserData = (jsonData: string): boolean => {
    const success = DataStorage.importAllData(jsonData);
    if (success && currentUser) {
      // Reload current user data after import
      const reloadedData = DataStorage.loadUserData(currentUser.id);
      if (reloadedData) {
        setCurrentUser(reloadedData);
      }
    }
    return success;
  };

  const createManualBackup = (): boolean => {
    if (!currentUser) return false;
    return DataStorage.createBackup(currentUser.id);
  };

  const getStorageInfo = () => {
    return DataStorage.getStorageInfo();
  };

  
  const reloadUserData = async (): Promise<void> => {
    const authUser = localStorage.getItem("plannerfinUser");
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.authenticated) {
          console.log("Manually reloading user data");
          await loadUserProfile(user);
        }
      } catch (error) {
        console.error("Error in manual reload:", error);
      }
    }
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
        reloadUserData,
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
