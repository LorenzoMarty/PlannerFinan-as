import { supabase } from "@/lib/supabase";
import type {
  BudgetEntry,
  Category,
  Budget,
  UserProfile,
} from "@/contexts/UserDataContext";

export class SupabaseDataService {
  // ==================== CONNECTIVITY CHECK ====================

  private static tablesAvailable: boolean | null = null;

  static async checkTablesAvailability(): Promise<boolean> {
    if (this.tablesAvailable !== null) {
      return this.tablesAvailable;
    }

    try {
      // Test if we can access the user_profiles table
      const { error } = await supabase
        .from("user_profiles")
        .select("id")
        .limit(1);

      if (error) {
        console.log("Supabase tables not available:", error.message);
        this.tablesAvailable = false;
        return false;
      }

      this.tablesAvailable = true;
      return true;
    } catch (error) {
      console.log("Supabase connectivity check failed:", error);
      this.tablesAvailable = false;
      return false;
    }
  }

  // ==================== USER PROFILES ====================

  static async createUserProfile(
    profile: Omit<UserProfile, "budgets" | "categories" | "activeBudgetId">,
  ): Promise<boolean> {
    try {
      console.log("Creating user profile:", profile);

      // Ensure we have a valid session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error(
          "No valid session for user profile creation:",
          sessionError,
        );
        return false;
      }

      // Check if profile already exists
      const { data: existing, error: checkError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", profile.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing profile:", checkError);
        return false;
      }

      if (existing) {
        console.log("User profile already exists");
        return true;
      }

      const { data, error } = await supabase.from("user_profiles").insert({
        id: profile.id,
        email: profile.email,
        name: profile.name,
      });

      if (error) {
        console.error("Error creating user profile:", error);
        return false;
      }

      console.log("User profile created successfully:", data);
      return true;
    } catch (error) {
      console.error("Error in createUserProfile:", error);
      return false;
    }
  }

  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      console.log("Getting user profile for:", userId);

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error getting user profile:", profileError);
        // Check if it's a table not found error (404) or permission error
        if (
          profileError.code === "PGRST106" ||
          profileError.code === "42P01" ||
          profileError.message?.includes("404")
        ) {
          console.warn(
            "Supabase tables not found or not accessible, this is expected for demo mode",
          );
        }
        return null;
      }

      if (!profile) {
        console.log("No profile found for user:", userId);
        return null;
      }

      console.log("Profile found:", profile);

      // Get user budgets
      const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .or(`owner_id.eq.${userId},collaborators.cs.{${userId}}`);

      if (budgetsError) {
        console.error("Error getting budgets:", budgetsError);
        return null;
      }

      // Get user categories
      const { data: categories, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId);

      if (categoriesError) {
        console.error("Error getting categories:", categoriesError);
        return null;
      }

      // Get budget entries for all user budgets
      const budgetIds = budgets?.map((b) => b.id) || [];
      const { data: entries, error: entriesError } =
        budgetIds.length > 0
          ? await supabase
              .from("budget_entries")
              .select("*")
              .in("budget_id", budgetIds)
          : { data: [], error: null };

      if (entriesError) {
        console.error("Error getting entries:", entriesError);
        return null;
      }

      // Build budget objects with entries
      const budgetsWithEntries =
        budgets?.map((budget) => ({
          id: budget.id,
          name: budget.name,
          code: budget.code,
          ownerId: budget.owner_id,
          collaborators: budget.collaborators || [],
          entries:
            entries
              ?.filter((entry) => entry.budget_id === budget.id)
              .map((entry) => ({
                id: entry.id,
                date: entry.date,
                description: entry.description,
                category: entry.category,
                amount: entry.amount,
                type: entry.type as "income" | "expense",
                userId: entry.user_id,
                budgetId: entry.budget_id,
              })) || [],
          createdAt: budget.created_at,
          updatedAt: budget.updated_at,
        })) || [];

      // Build user profile object
      const userProfile: UserProfile = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        budgets: budgetsWithEntries,
        categories:
          categories?.map((cat) => ({
            id: cat.id,
            name: cat.name,
            type: cat.type as "income" | "expense",
            color: cat.color,
            icon: cat.icon,
            description: cat.description,
            userId: cat.user_id,
          })) || [],
        activeBudgetId: budgetsWithEntries[0]?.id || "",
      };

      return userProfile;
    } catch (error) {
      console.error("Error in getUserProfile:", error);
      return null;
    }
  }

  static async updateUserProfile(
    userId: string,
    updates: {
      name?: string;
      bio?: string;
      phone?: string;
      location?: string;
      avatar?: string;
    },
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user profile:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return false;
    }
  }

  // ==================== BUDGETS ====================

  static async createBudget(
    budget: Omit<Budget, "entries" | "createdAt" | "updatedAt">,
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("budgets").insert({
        id: budget.id,
        name: budget.name,
        code: budget.code,
        owner_id: budget.ownerId,
        collaborators: budget.collaborators,
      });

      if (error) {
        console.error("Error creating budget:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in createBudget:", error);
      return false;
    }
  }

  // ==================== BUDGET ENTRIES ====================

  static async createBudgetEntry(
    entry: Omit<BudgetEntry, "id">,
  ): Promise<string | null> {
    try {
      console.log("Creating budget entry:", entry);

      // Ensure we have a valid session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error(
          "No valid session for budget entry creation:",
          sessionError,
        );
        return null;
      }

      const entryId = this.generateId();
      const entryData = {
        id: entryId,
        date: entry.date,
        description: entry.description,
        category: entry.category,
        amount: entry.amount,
        type: entry.type,
        user_id: entry.userId,
        budget_id: entry.budgetId,
      };

      const { data, error } = await supabase
        .from("budget_entries")
        .insert(entryData)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating budget entry:", error);
        // Check if it's a permissions/RLS error
        if (error.code === "42501" || error.code === "PGRST301") {
          console.error("Permission denied - check RLS policies");
        }
        return null;
      }

      if (!data) {
        console.error("No data returned from insert");
        return null;
      }

      console.log("Budget entry created successfully:", data);
      return data.id;
    } catch (error) {
      console.error("Error in createBudgetEntry:", error);
      return null;
    }
  }

  // ==================== MIGRATION ====================

  static async migrateFromLocalStorage(userId: string): Promise<boolean> {
    try {
      const localUserData = localStorage.getItem(
        `plannerfinUserData_${userId}`,
      );
      if (!localUserData) return true;

      const userData = JSON.parse(localUserData);

      // Create/update user profile
      await this.updateUserProfile(userId, {
        name: userData.name,
      });

      // Create categories
      for (const category of userData.categories || []) {
        await this.createCategory({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          description: category.description,
          userId,
        });
      }

      // Create budgets and entries
      for (const budget of userData.budgets || []) {
        await this.createBudget({
          id: budget.id,
          name: budget.name,
          code: budget.code,
          ownerId: budget.ownerId,
          collaborators: budget.collaborators,
        });

        // Create entries for this budget
        for (const entry of budget.entries || []) {
          await this.createBudgetEntry({
            date: entry.date,
            description: entry.description,
            category: entry.category,
            amount: entry.amount,
            type: entry.type,
            userId: entry.userId,
            budgetId: entry.budgetId,
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error in migrateFromLocalStorage:", error);
      return false;
    }
  }

  // ==================== CATEGORIES ====================

  static async createCategory(
    category: Omit<Category, "id">,
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from("categories")
        .insert({
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          description: category.description,
          user_id: category.userId,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("Error creating category:", error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error("Error in createCategory:", error);
      return null;
    }
  }

  // ==================== UTILITIES ====================

  static generateId(): string {
    return crypto.randomUUID();
  }

  static generateBudgetCode(): string {
    return "PF" + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
}
