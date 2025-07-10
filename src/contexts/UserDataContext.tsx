import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { SupabaseDataService } from "@/services/SupabaseDataService";
import { SupabaseSetup } from "@/lib/supabase-setup";
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
  toggleStorageMode: () => void;
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
  const [useSupabase, setUseSupabase] = useState(true); // Default to Supabase
  const [mounted, setMounted] = useState(false);

  // Load user data on mount
  useEffect(() => {
    setMounted(true);

    const initializeApp = async () => {
      // Aguardar montagem do componente para evitar RSL
      if (typeof window === "undefined") return;

      // Initialize Supabase if needed
      if (useSupabase) {
        console.log("Initializing Supabase...");
        const connected = await SupabaseSetup.testConnection();
        if (connected) {
          await SupabaseSetup.ensureTablesExist();

          // Test if we can actually perform operations
          try {
            const {
              data: { session },
            } = await supabase.auth.getSession();
            if (session?.user) {
              console.log("✅ Supabase ready for operations");
            } else {
              console.log("⚠️ No active session, will test on login");
            }
          } catch (testError) {
            console.warn(
              "Supabase test failed, falling back to localStorage:",
              testError,
            );
            setUseSupabase(false);
            localStorage.setItem("plannerfinUseSupabase", "false");
          }
        } else {
          console.warn(
            "Supabase connection failed, falling back to localStorage",
          );
          setUseSupabase(false);
          localStorage.setItem("plannerfinUseSupabase", "false");
        }
      }

      // Load user preference for storage mode
      const savedMode = localStorage.getItem("plannerfinUseSupabase");
      if (savedMode !== null) {
        setUseSupabase(savedMode === "true");
      }

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

    initializeApp();

    // Listen for storage changes (when user logs in from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (typeof window === "undefined") return;

      if (e.key === "plannerfinUser") {
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
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, [useSupabase]);

  // Save user data whenever it changes with enhanced persistence
  useEffect(() => {
    if (currentUser && mounted && typeof window !== "undefined") {
      const success = DataStorage.saveUserData(currentUser.id, currentUser);
      if (!success) {
        console.warn("Failed to save user data to localStorage");
        // Could show a toast notification here
      }
    }
  }, [currentUser, mounted]);

  // Auto-backup every 10 minutes
  useEffect(() => {
    if (!currentUser || !mounted || typeof window === "undefined") return;

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
  }, [currentUser, mounted]);

  const loadUserProfile = async (authUser: any) => {
    // Get current Supabase session to ensure we have the correct user ID
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id || btoa(authUser.email); // Use Supabase user ID if available

    setIsLoading(true);

    try {
      if (useSupabase && session?.user) {
        // Try to load from Supabase first
        let supabaseData = await SupabaseDataService.getUserProfile(userId);

        if (!supabaseData) {
          // If no data in Supabase, check localStorage and migrate
          const localData = DataStorage.loadUserData(btoa(authUser.email));

          // Create user profile in Supabase
          await SupabaseDataService.createUserProfile({
            id: userId,
            email: authUser.email,
            name: authUser.name,
          });

          if (localData) {
            // Migrate data to Supabase
            await SupabaseDataService.migrateFromLocalStorage(userId);
          }

          // Load the migrated or newly created data
          supabaseData = await SupabaseDataService.getUserProfile(userId);
        }

        if (supabaseData) {
          setCurrentUser(supabaseData);
          return;
        }
      } else {
        // Use localStorage
        const existingData = DataStorage.loadUserData(btoa(authUser.email));
        if (existingData) {
          setCurrentUser(existingData);
          return;
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Fallback to localStorage on error
      const existingData = DataStorage.loadUserData(btoa(authUser.email));
      if (existingData) {
        setCurrentUser(existingData);
        return;
      }
    } finally {
      setIsLoading(false);
    }

    // Check if it's a demo user and create appropriate data
    const isDemoUser = authUser.email === "demo@plannerfin.com";
    const isAdminUser = authUser.email === "admin@plannerfin.com";
    const isJoaoUser = authUser.email === "user@exemplo.com";

    let newProfile: UserProfile;

    if (isDemoUser) {
      newProfile = createDemoUserProfile(userId, authUser);
    } else if (isAdminUser) {
      newProfile = createAdminUserProfile(userId, authUser);
    } else if (isJoaoUser) {
      newProfile = createJoaoUserProfile(userId, authUser);
    } else {
      newProfile = createDefaultUserProfile(userId, authUser);
    }

    setCurrentUser(newProfile);
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

  const createDemoUserProfile = (
    userId: string,
    authUser: any,
  ): UserProfile => {
    const budget1Id = generateId();
    const budget2Id = generateId();
    const budget3Id = generateId();

    // Generate realistic entry IDs and dates
    const generateEntryId = () => generateId();
    const generateDate = (monthsAgo: number, dayRange: number = 28) => {
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      date.setDate(Math.floor(Math.random() * dayRange) + 1);
      return date.toISOString().split("T")[0];
    };

    // Enhanced categories with more variety
    const demoCategories = [
      ...defaultCategories.map((cat) => ({ ...cat, id: generateId(), userId })),
      {
        id: generateId(),
        name: "Investimentos",
        type: "income" as const,
        color: "#10b981",
        icon: "📈",
        description: "Rendimentos e dividendos",
        userId,
      },
      {
        id: generateId(),
        name: "Vendas",
        type: "income" as const,
        color: "#3b82f6",
        icon: "💼",
        description: "Vendas online e serviços",
        userId,
      },
      {
        id: generateId(),
        name: "Educação",
        type: "expense" as const,
        color: "#8b5cf6",
        icon: "📚",
        description: "Cursos e materiais educativos",
        userId,
      },
      {
        id: generateId(),
        name: "Saúde",
        type: "expense" as const,
        color: "#ef4444",
        icon: "🏥",
        description: "Plano de saúde e medicamentos",
        userId,
      },
      {
        id: generateId(),
        name: "Tecnologia",
        type: "expense" as const,
        color: "#06b6d4",
        icon: "💻",
        description: "Eletrônicos e softwares",
        userId,
      },
      {
        id: generateId(),
        name: "Academia",
        type: "expense" as const,
        color: "#f59e0b",
        icon: "💪",
        description: "Mensalidade e suplementos",
        userId,
      },
    ];

    // Realistic demo entries for last 3 months
    const demoEntries = [
      // Current month (December 2024)
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Salário Dezembro",
        category: "Salário",
        amount: 8500,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Freelance Design",
        category: "Freelance",
        amount: 1200,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Dividendos ETF",
        category: "Investimentos",
        amount: 450,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Aluguel",
        category: "Moradia",
        amount: -2500,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Supermercado Extra",
        category: "Alimentação",
        amount: -680,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Conta de Luz",
        category: "Moradia",
        amount: -280,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Netflix",
        category: "Lazer",
        amount: -45,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Spotify",
        category: "Lazer",
        amount: -35,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Uber",
        category: "Transporte",
        amount: -125,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Curso React",
        category: "Educação",
        amount: -299,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Plano de Saúde",
        category: "Saúde",
        amount: -420,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Academia Smart Fit",
        category: "Academia",
        amount: -89,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Jantar Restaurante",
        category: "Alimentação",
        amount: -180,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(0),
        description: "Gasolina",
        category: "Transporte",
        amount: -320,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },

      // Previous month (November 2024)
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Salário Novembro",
        category: "Salário",
        amount: 8500,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Projeto WordPress",
        category: "Freelance",
        amount: 800,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Venda Notebook Antigo",
        category: "Vendas",
        amount: 1500,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Aluguel",
        category: "Moradia",
        amount: -2500,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Supermercado",
        category: "Alimentação",
        amount: -720,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Conta de Água",
        category: "Moradia",
        amount: -95,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Cinema",
        category: "Lazer",
        amount: -80,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "Farmácia",
        category: "Saúde",
        amount: -150,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "MacBook Air M2",
        category: "Tecnologia",
        amount: -8500,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(1),
        description: "99Food",
        category: "Alimentação",
        amount: -65,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },

      // Two months ago (October 2024)
      {
        id: generateEntryId(),
        date: generateDate(2),
        description: "Salário Outubro",
        category: "Salário",
        amount: 8500,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(2),
        description: "Bônus Projeto",
        category: "Freelance",
        amount: 2000,
        type: "income" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(2),
        description: "Aluguel",
        category: "Moradia",
        amount: -2500,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(2),
        description: "Supermercado",
        category: "Alimentação",
        amount: -650,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(2),
        description: "Viagem São Paulo",
        category: "Lazer",
        amount: -1200,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
      {
        id: generateEntryId(),
        date: generateDate(2),
        description: "Combustível",
        category: "Transporte",
        amount: -400,
        type: "expense" as const,
        userId,
        budgetId: budget1Id,
      },
    ];

    return {
      id: userId,
      email: authUser.email,
      name: authUser.name,
      activeBudgetId: budget1Id,
      categories: demoCategories,
      budgets: [
        {
          id: budget1Id,
          name: "Orçamento Pessoal 2024",
          code: "PFDEMO01",
          ownerId: userId,
          collaborators: [],
          entries: demoEntries,
          createdAt: new Date(2024, 0, 1).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: budget2Id,
          name: "Planejamento 2025",
          code: "PFDEMO02",
          ownerId: userId,
          collaborators: [],
          entries: [],
          createdAt: new Date(2024, 11, 1).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: budget3Id,
          name: "Família Silva",
          code: "PFFAM001",
          ownerId: userId,
          collaborators: ["fake_user_1", "fake_user_2"],
          entries: [
            {
              id: generateEntryId(),
              date: generateDate(0),
              description: "Mesada João",
              category: "Lazer",
              amount: -200,
              type: "expense" as const,
              userId: "fake_user_1",
              budgetId: budget3Id,
            },
            {
              id: generateEntryId(),
              date: generateDate(0),
              description: "Compras Casa",
              category: "Moradia",
              amount: -800,
              type: "expense" as const,
              userId: "fake_user_2",
              budgetId: budget3Id,
            },
          ],
          createdAt: new Date(2024, 9, 15).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
  };

  const createAdminUserProfile = (
    userId: string,
    authUser: any,
  ): UserProfile => {
    const budgetId = generateId();

    const adminEntries = [
      {
        id: generateId(),
        date: "2024-12-01",
        description: "Receita Sistema",
        category: "Salário",
        amount: 15000,
        type: "income" as const,
        userId,
        budgetId,
      },
      {
        id: generateId(),
        date: "2024-12-05",
        description: "Consultoria Tech",
        category: "Freelance",
        amount: 5000,
        type: "income" as const,
        userId,
        budgetId,
      },
      {
        id: generateId(),
        date: "2024-12-10",
        description: "Servidor AWS",
        category: "Tecnologia",
        amount: -450,
        type: "expense" as const,
        userId,
        budgetId,
      },
      {
        id: generateId(),
        date: "2024-12-15",
        description: "Escritório Coworking",
        category: "Moradia",
        amount: -800,
        type: "expense" as const,
        userId,
        budgetId,
      },
    ];

    return {
      id: userId,
      email: authUser.email,
      name: authUser.name,
      activeBudgetId: budgetId,
      categories: defaultCategories.map((cat) => ({
        ...cat,
        id: generateId(),
        userId,
      })),
      budgets: [
        {
          id: budgetId,
          name: "Controle Administrativo",
          code: "PFADM001",
          ownerId: userId,
          collaborators: [],
          entries: adminEntries,
          createdAt: new Date(2024, 10, 1).toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    };
  };

  const createJoaoUserProfile = (
    userId: string,
    authUser: any,
  ): UserProfile => {
    const budgetId = generateId();

    const joaoEntries = [
      {
        id: generateId(),
        date: "2024-12-01",
        description: "Salário CLT",
        category: "Salário",
        amount: 4500,
        type: "income" as const,
        userId,
        budgetId,
      },
      {
        id: generateId(),
        date: "2024-12-03",
        description: "Aluguel",
        category: "Moradia",
        amount: -1200,
        type: "expense" as const,
        userId,
        budgetId,
      },
      {
        id: generateId(),
        date: "2024-12-05",
        description: "Mercado",
        category: "Alimentação",
        amount: -350,
        type: "expense" as const,
        userId,
        budgetId,
      },
      {
        id: generateId(),
        date: "2024-12-08",
        description: "Transporte Público",
        category: "Transporte",
        amount: -180,
        type: "expense" as const,
        userId,
        budgetId,
      },
    ];

    return {
      id: userId,
      email: authUser.email,
      name: authUser.name,
      activeBudgetId: budgetId,
      categories: defaultCategories.map((cat) => ({
        ...cat,
        id: generateId(),
        userId,
      })),
      budgets: [
        {
          id: budgetId,
          name: "Orçamento João",
          code: "PFJOAO01",
          ownerId: userId,
          collaborators: [],
          entries: joaoEntries,
          createdAt: new Date(2024, 9, 1).toISOString(),
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
      if (useSupabase) {
        // Update in Supabase
        const success = await SupabaseDataService.updateUserProfile(
          currentUser.id,
          updates,
        );
        if (!success) {
          throw new Error("Failed to update profile in Supabase");
        }
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

        if (!useSupabase) {
          // Also save to user data storage for persistence
          const success = DataStorage.saveUserData(currentUser.id, updatedUser);
          if (!success) {
            console.warn("Failed to save user profile data");
          }
        }
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

  const resetDemoData = () => {
    // Clear existing demo user data to force reload with new fictional data
    const demoUserId = btoa("demo@plannerfin.com");
    localStorage.removeItem(`plannerfinUserData_${demoUserId}`);

    const adminUserId = btoa("admin@plannerfin.com");
    localStorage.removeItem(`plannerfinUserData_${adminUserId}`);

    const joaoUserId = btoa("user@exemplo.com");
    localStorage.removeItem(`plannerfinUserData_${joaoUserId}`);
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

      if (useSupabase) {
        const success = await SupabaseDataService.createBudget(newBudget);
        if (!success) {
          throw new Error("Failed to create budget in Supabase");
        }
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

  const deleteBudget = (budgetId: string): boolean => {
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

  const leaveBudgetAsCollaborator = (budgetId: string): boolean => {
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

    // Remove user from the original budget's collaborators list
    try {
      const ownerKey = `plannerfinUserData_${targetBudget.ownerId}`;
      const ownerData = JSON.parse(localStorage.getItem(ownerKey) || "{}");

      if (ownerData.budgets) {
        const updatedOwnerBudgets = ownerData.budgets.map((budget: Budget) =>
          budget.id === budgetId
            ? {
                ...budget,
                collaborators: budget.collaborators.filter(
                  (id) => id !== currentUser.id,
                ),
              }
            : budget,
        );

        localStorage.setItem(
          ownerKey,
          JSON.stringify({
            ...ownerData,
            budgets: updatedOwnerBudgets,
          }),
        );
      }
    } catch (error) {
      console.warn("Could not update original budget collaborators:", error);
    }

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

      console.log("Adding entry:", newEntry);

      let supabaseSuccess = false;
      if (useSupabase) {
        const savedEntryId =
          await SupabaseDataService.createBudgetEntry(newEntry);
        if (savedEntryId) {
          newEntry.id = savedEntryId;
          supabaseSuccess = true;
          console.log("Entry saved to Supabase successfully");
        } else {
          console.warn("Failed to save entry to Supabase, using localStorage");
          // Automatically fallback to localStorage mode for future operations
          setUseSupabase(false);
          localStorage.setItem("plannerfinUseSupabase", "false");
        }
      }

      // Always update local state regardless of Supabase success/failure
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

      console.log("Entry added successfully");
    } catch (error) {
      console.error("Error adding entry:", error);

      // On any error, ensure we fallback to localStorage mode
      if (useSupabase) {
        console.warn("Switching to localStorage mode due to error");
        setUseSupabase(false);
        localStorage.setItem("plannerfinUseSupabase", "false");
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
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

  const findBudgetByCode = (code: string): Budget | null => {
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

    const targetBudget = findBudgetByCode(code);

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

    // In a real app, we would also update the original budget's collaborators list
    // For this demo, we'll update it in the original user's data
    try {
      const ownerKey = `plannerfinUserData_${targetBudget.ownerId}`;
      const ownerData = JSON.parse(localStorage.getItem(ownerKey) || "{}");

      if (ownerData.budgets) {
        const updatedBudgets = ownerData.budgets.map((budget: Budget) =>
          budget.id === targetBudget.id
            ? {
                ...budget,
                collaborators: [...budget.collaborators, currentUser.id],
              }
            : budget,
        );

        localStorage.setItem(
          ownerKey,
          JSON.stringify({
            ...ownerData,
            budgets: updatedBudgets,
          }),
        );
      }
    } catch (error) {
      console.warn("Could not update original budget collaborators:", error);
    }

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

  const migrateToSupabase = async (): Promise<boolean> => {
    if (!currentUser) return false;
    setIsLoading(true);

    try {
      const success = await SupabaseDataService.migrateFromLocalStorage(
        currentUser.id,
      );
      if (success) {
        setUseSupabase(true);
        localStorage.setItem("plannerfinUseSupabase", "true");
        // Reload user data from Supabase
        const authUser = JSON.parse(
          localStorage.getItem("plannerfinUser") || "{}",
        );
        await loadUserProfile(authUser);
      }
      return success;
    } catch (error) {
      console.error("Error migrating to Supabase:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStorageMode = () => {
    const newMode = !useSupabase;
    setUseSupabase(newMode);
    localStorage.setItem("plannerfinUseSupabase", newMode.toString());
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
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};
