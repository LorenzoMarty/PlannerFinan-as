import { supabase } from "@/lib/supabase";
import type {
  BudgetEntry,
  Category,
  Budget,
  UserProfile,
} from "@/contexts/UserDataContext";

interface SupabaseSession {
  user: {
    id: string;
    email: string;
  };
}

export class SupabaseDataService {
  // State management
  private static tablesAvailable: boolean | null = null;
  private static sessionCache: { session: SupabaseSession; timestamp: number } | null = null;
  private static readonly SESSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  // Private utility methods
  private static logError(method: string, error: any, message?: string): void {
    console.error(`[SupabaseDataService.${method}] ${message || 'Error'}:`, error);
  }

  private static async checkSession(): Promise<SupabaseSession | null> {
    // Check cache first
    if (this.sessionCache) {
      const now = Date.now();
      if (now - this.sessionCache.timestamp < this.SESSION_CACHE_DURATION) {
        return this.sessionCache.session;
      }
      // Cache expired, clear it
      this.sessionCache = null;
    }
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        this.logError('checkSession', error || 'No session found');
        return null;
      }
      const sessionData = {
        user: {
          id: session.user.id,
          email: session.user.email || ''
        }
      };

      // Cache the session
      this.sessionCache = {
        session: sessionData,
        timestamp: Date.now()
      };

      return sessionData;
    } catch (error) {
      this.logError('checkSession', error);
      return null;
    }
  }

  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  private static generateBudgetCode(): string {
    return "PF" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private static async verifyBudgetAccess(budgetId: string, userId: string): Promise<boolean> {
    try {
      const { data: budget, error } = await supabase
        .from('budgets')
        .select('owner_id, collaborators')
        .eq('id', budgetId)
        .single();

      if (error) {
        this.logError('verifyBudgetAccess', error);
        return false;
      }

      return budget.owner_id === userId || 
        (Array.isArray(budget.collaborators) && budget.collaborators.includes(userId));
    } catch (error) {
      this.logError('verifyBudgetAccess', error);
      return false;
    }
  }

  // Public methods
  private static tablesAvailabilityPromise: Promise<boolean> | null = null;

  public static async checkTablesAvailability(): Promise<boolean> {
    // Se já temos um resultado, retorne-o imediatamente
    if (this.tablesAvailable !== null) {
      return this.tablesAvailable;
    }

    // Se já existe uma verificação em andamento, aguarde seu resultado
    if (this.tablesAvailabilityPromise) {
      return this.tablesAvailabilityPromise;
    }

    // Inicie uma nova verificação
    this.tablesAvailabilityPromise = (async () => {
      try {
        console.log("Checking Supabase tables availability...");
        const { error } = await supabase
          .from("user_profiles")
          .select("id")
          .limit(1);

        if (error) {
          console.error("Supabase tables not available:", error.message);
          this.tablesAvailable = false;
          return false;
        }

        this.tablesAvailable = true;
        console.log("Supabase tables are available.");
        return true;
      } catch (error) {
        console.error("Supabase connectivity check failed:", error);
        this.tablesAvailable = false;
        return false;
      } finally {
        this.tablesAvailabilityPromise = null;
      }
    })();

    return this.tablesAvailabilityPromise;
  }

  public static async createUserProfile(
    profile: Omit<UserProfile, "budgets" | "categories" | "activeBudgetId">
  ): Promise<boolean> {
    try {
      console.log("Creating user profile:", profile);

      const session = await this.checkSession();
      if (!session) {
        this.logError('createUserProfile', null, 'No valid session');
        return false;
      }

      // Check if profile exists
      const { data: existing, error: checkError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", profile.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        this.logError('createUserProfile', checkError, 'Error checking existing profile');
        return false;
      }

      // Update existing profile
      if (existing) {
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            email: profile.email,
            name: profile.name,
            updated_at: new Date().toISOString()
          })
          .eq("id", profile.id);

        if (updateError) {
          this.logError('createUserProfile', updateError, 'Error updating profile');
          return false;
        }

        return true;
      }

      // Create new profile
      const { error } = await supabase
        .from("user_profiles")
        .insert({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        this.logError('createUserProfile', error, 'Error creating profile');
        return false;
      }

      return true;
    } catch (error) {
      this.logError('createUserProfile', error);
      return false;
    }
  }

  public static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log("Getting user profile for:", userId);
      
      const session = await this.checkSession();
      if (!session) {
        console.log("No valid session found");
        return null;
      }

      // Primeiro, buscar apenas o perfil do usuário
      const { data: userProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        this.logError('getUserProfile', profileError);
        return null;
      }

      if (!userProfile) {
        console.log("No profile found for user:", userId);
        return null;
      }

      // Depois, buscar orçamentos e categorias em paralelo
      const [ownedBudgetsResult, categoriesResult] = await Promise.all([
        // Get owned budgets (incluindo entradas)
        supabase.from("budgets")
          .select("*, budget_entries(*)")
          .eq("owner_id", userId),

        // Get user categories
        supabase.from("categories")
          .select("*")
          .eq("user_id", userId)
      ]);

      if (ownedBudgetsResult.error) {
        this.logError('getUserProfile', ownedBudgetsResult.error);
        return null;
      }

      // Usar apenas os orçamentos do proprietário por enquanto para melhorar a performance
      const budgets = ownedBudgetsResult.data || [];

      // Build final user profile
      const userProfileData: UserProfile = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        budgets: budgets.map(budget => ({
          id: budget.id,
          name: budget.name,
          code: budget.code,
          ownerId: budget.owner_id,
          collaborators: budget.collaborators || [],
          entries: (budget.budget_entries || []).map(entry => ({
            id: entry.id,
            date: entry.date,
            description: entry.description,
            category: entry.category,
            amount: entry.amount,
            type: entry.type as "income" | "expense",
            userId: entry.user_id,
            budgetId: entry.budget_id
          })),
          createdAt: budget.created_at,
          updatedAt: budget.updated_at
        })),
        categories: (categoriesResult.data || []).map(cat => ({
          id: cat.id,
          name: cat.name,
          type: cat.type,
          color: cat.color,
          icon: cat.icon,
          description: cat.description,
          userId: cat.user_id
        })),
        activeBudgetId: budgets[0]?.id || ''
      };

      // Carregar orçamentos colaborativos em segundo plano se necessário
      if (budgets.length === 0) {
        this.loadCollaborativeBudgets(userId).then(collaborativeBudgets => {
          if (collaborativeBudgets && collaborativeBudgets.length > 0) {
            userProfileData.budgets = collaborativeBudgets;
            userProfileData.activeBudgetId = collaborativeBudgets[0].id;
          }
        }).catch(error => {
          this.logError('loadCollaborativeBudgets', error);
        });
      }

      return userProfileData;
    } catch (error) {
      this.logError('getUserProfile', error);
      return null;
    }
  }

  public static async updateUserProfile(
    userId: string,
    updates: Partial<Omit<UserProfile, "id" | "budgets" | "categories" | "activeBudgetId">>
  ): Promise<boolean> {
    try {
      const session = await this.checkSession();
      if (!session) return false;

      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq("id", userId);

      if (error) {
        this.logError('updateUserProfile', error);
        return false;
      }

      return true;
    } catch (error) {
      this.logError('updateUserProfile', error);
      return false;
    }
  }

  public static async createBudgetEntry(entry: Omit<BudgetEntry, "id">): Promise<string | null> {
    try {
      const session = await this.checkSession();
      if (!session) return null;

      if (!await this.verifyBudgetAccess(entry.budgetId, session.user.id)) {
        return null;
      }

      const entryId = this.generateId();
      const { error } = await supabase
        .from('budget_entries')
        .insert({
          id: entryId,
          date: entry.date,
          description: entry.description,
          category: entry.category,
          amount: entry.amount,
          type: entry.type,
          user_id: entry.userId,
          budget_id: entry.budgetId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        this.logError('createBudgetEntry', error);
        return null;
      }

      return entryId;
    } catch (error) {
      this.logError('createBudgetEntry', error);
      return null;
    }
  }

  public static async updateBudgetEntry(id: string, updates: Partial<BudgetEntry>): Promise<boolean> {
    try {
      const session = await this.checkSession();
      if (!session) return false;

      // Get budget ID for this entry
      const { data: entry, error: entryError } = await supabase
        .from('budget_entries')
        .select('budget_id')
        .eq('id', id)
        .single();

      if (entryError) {
        this.logError('updateBudgetEntry', entryError);
        return false;
      }

      if (!await this.verifyBudgetAccess(entry.budget_id, session.user.id)) {
        return false;
      }

      const { error } = await supabase
        .from('budget_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        this.logError('updateBudgetEntry', error);
        return false;
      }

      return true;
    } catch (error) {
      this.logError('updateBudgetEntry', error);
      return false;
    }
  }

  public static async deleteBudgetEntry(id: string): Promise<boolean> {
    try {
      const session = await this.checkSession();
      if (!session) return false;

      // Get budget ID for this entry
      const { data: entry, error: entryError } = await supabase
        .from('budget_entries')
        .select('budget_id')
        .eq('id', id)
        .single();

      if (entryError) {
        this.logError('deleteBudgetEntry', entryError);
        return false;
      }

      if (!await this.verifyBudgetAccess(entry.budget_id, session.user.id)) {
        return false;
      }

      const { error } = await supabase
        .from('budget_entries')
        .delete()
        .eq('id', id);

      if (error) {
        this.logError('deleteBudgetEntry', error);
        return false;
      }

      return true;
    } catch (error) {
      this.logError('deleteBudgetEntry', error);
      return false;
    }
  }

  public static async createBudget(budget: Budget): Promise<boolean> {
    try {
      const session = await this.checkSession();
      if (!session) return false;

      // Ensure owner_id matches the current user
      if (budget.ownerId !== session.user.id) {
        this.logError('createBudget', 'Owner ID mismatch');
        return false;
      }

      const { error } = await supabase
        .from('budgets')
        .insert({
          id: budget.id,
          name: budget.name,
          code: budget.code,
          owner_id: budget.ownerId,
          collaborators: budget.collaborators,
          created_at: budget.createdAt,
          updated_at: budget.updatedAt
        });

      if (error) {
        this.logError('createBudget', error);
        return false;
      }

      return true;
    } catch (error) {
      this.logError('createBudget', error);
      return false;
    }
  }

  private static async loadCollaborativeBudgets(userId: string): Promise<Budget[]> {
    try {
      const { data: collaborativeBudgets, error } = await supabase
        .from("budgets")
        .select("*, budget_entries(*)")
        .contains("collaborators", [userId]);

      if (error) {
        this.logError('loadCollaborativeBudgets', error);
        return [];
      }

      return (collaborativeBudgets || []).map(budget => ({
        id: budget.id,
        name: budget.name,
        code: budget.code,
        ownerId: budget.owner_id,
        collaborators: budget.collaborators || [],
        entries: (budget.budget_entries || []).map(entry => ({
          id: entry.id,
          date: entry.date,
          description: entry.description,
          category: entry.category,
          amount: entry.amount,
          type: entry.type as "income" | "expense",
          userId: entry.user_id,
          budgetId: entry.budget_id
        })),
        createdAt: budget.created_at,
        updatedAt: budget.updated_at
      }));
    } catch (error) {
      this.logError('loadCollaborativeBudgets', error);
      return [];
    }
  }
}
