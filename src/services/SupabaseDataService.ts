import {
  supabase,
  isUsingDemoCredentials,
  isSupabaseAvailable,
} from "@/lib/supabase";
import type {
  BudgetEntry,
  Category,
  Budget,
  UserProfile,
} from "@/contexts/UserDataContext";

// Helper to check if we should use Supabase
async function shouldUseSupabase(): Promise<boolean> {
  if (isUsingDemoCredentials) {
    return false;
  }
  return await isSupabaseAvailable();
}

export class SupabaseDataService {
  // ==================== USER PROFILES ====================

  static async createUserProfile(
    profile: Omit<UserProfile, "budgets" | "categories" | "activeBudgetId">,
  ): Promise<boolean> {
    try {
      // Check if profile already exists
      const { data: existing } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", profile.id)
        .single();

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
        console.error("Error details:", error.message, error.code);
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
        console.error("Error code:", profileError.code);
        console.error("Error message:", profileError.message);
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

  static async updateBudget(
    budgetId: string,
    updates: Partial<Budget>,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("budgets")
        .update({
          name: updates.name,
          collaborators: updates.collaborators,
          updated_at: new Date().toISOString(),
        })
        .eq("id", budgetId);

      if (error) {
        console.error("Error updating budget:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateBudget:", error);
      return false;
    }
  }

  static async deleteBudget(budgetId: string): Promise<boolean> {
    try {
      // First delete all entries in this budget
      await supabase.from("budget_entries").delete().eq("budget_id", budgetId);

      // Then delete the budget
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", budgetId);

      if (error) {
        console.error("Error deleting budget:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteBudget:", error);
      return false;
    }
  }

  static async findBudgetByCode(code: string): Promise<Budget | null> {
    try {
      const { data: budget, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("code", code)
        .single();

      if (error || !budget) {
        return null;
      }

      // Get entries for this budget
      const { data: entries } = await supabase
        .from("budget_entries")
        .select("*")
        .eq("budget_id", budget.id);

      return {
        id: budget.id,
        name: budget.name,
        code: budget.code,
        ownerId: budget.owner_id,
        collaborators: budget.collaborators || [],
        entries:
          entries?.map((entry) => ({
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
      };
    } catch (error) {
      console.error("Error in findBudgetByCode:", error);
      return null;
    }
  }

  // ==================== BUDGET ENTRIES ====================

  static async createBudgetEntry(
    entry: Omit<BudgetEntry, "id">,
  ): Promise<string | null> {
    try {
      console.log("Creating budget entry:", entry);

      const entryData = {
        id: this.generateId(),
        date: entry.date,
        description: entry.description,
        category: entry.category,
        amount: entry.amount,
        type: entry.type,
        user_id: entry.userId,
        budget_id: entry.budgetId,
      };

      console.log("Entry data to insert:", entryData);

      const { data, error } = await supabase
        .from("budget_entries")
        .insert(entryData)
        .select("id")
        .single();

      if (error) {
        console.error("Error creating budget entry:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
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

  static async updateBudgetEntry(
    entryId: string,
    updates: Partial<BudgetEntry>,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("budget_entries")
        .update({
          date: updates.date,
          description: updates.description,
          category: updates.category,
          amount: updates.amount,
          type: updates.type,
          updated_at: new Date().toISOString(),
        })
        .eq("id", entryId);

      if (error) {
        console.error("Error updating budget entry:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateBudgetEntry:", error);
      return false;
    }
  }

  static async deleteBudgetEntry(entryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("budget_entries")
        .delete()
        .eq("id", entryId);

      if (error) {
        console.error("Error deleting budget entry:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteBudgetEntry:", error);
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

  static async updateCategory(
    categoryId: string,
    updates: Partial<Category>,
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("categories")
        .update({
          name: updates.name,
          type: updates.type,
          color: updates.color,
          icon: updates.icon,
          description: updates.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", categoryId);

      if (error) {
        console.error("Error updating category:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in updateCategory:", error);
      return false;
    }
  }

  static async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId);

      if (error) {
        console.error("Error deleting category:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      return false;
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

  // ==================== UTILITIES ====================

  static generateId(): string {
    return crypto.randomUUID();
  }

  static generateBudgetCode(): string {
    return "PF" + Math.random().toString(36).substr(2, 6).toUpperCase();
  }
}
