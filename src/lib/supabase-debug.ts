import { supabase } from "./supabase";

export class SupabaseDebug {
  static async testConnection(): Promise<void> {
    console.log("=== SUPABASE DEBUG TEST ===");

    try {
      // Test 1: Check connection
      console.log("1. Testing connection...");
      const { data: connectionTest, error: connectionError } = await supabase
        .from("user_profiles")
        .select("count")
        .limit(1);

      if (connectionError) {
        console.error("❌ Connection failed:", connectionError);
        return;
      }
      console.log("✅ Connection successful");

      // Test 2: Check current session
      console.log("2. Checking current session...");
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Session error:", sessionError);
        return;
      }

      if (!session) {
        console.log("⚠️ No active session");
        return;
      }

      console.log("✅ Active session found:");
      console.log("   User ID:", session.user.id);
      console.log("   Email:", session.user.email);

      // Test 3: Try to create a test user profile
      console.log("3. Testing user profile creation...");
      const testProfile = {
        id: session.user.id,
        email: session.user.email || "test@test.com",
        name: "Test User",
      };

      const { data: insertData, error: insertError } = await supabase
        .from("user_profiles")
        .upsert(testProfile, { onConflict: "id" })
        .select();

      if (insertError) {
        console.error("❌ Profile creation failed:", {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        return;
      }
      console.log("✅ Profile creation successful:", insertData);

      // Test 4: Try to create a test budget
      console.log("4. Testing budget creation...");
      const testBudget = {
        id: `test-budget-${Date.now()}`,
        name: "Test Budget",
        code: `TEST${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        owner_id: session.user.id,
        collaborators: [],
      };

      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .insert(testBudget)
        .select();

      if (budgetError) {
        console.error("❌ Budget creation failed:", {
          code: budgetError.code,
          message: budgetError.message,
          details: budgetError.details,
          hint: budgetError.hint,
        });
        return;
      }
      console.log("✅ Budget creation successful:", budgetData);

      // Test 5: Try to create a test budget entry
      console.log("5. Testing budget entry creation...");
      const testEntry = {
        id: `test-entry-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        description: "Test Entry",
        category: "Test",
        amount: 100.0,
        type: "income",
        user_id: session.user.id,
        budget_id: testBudget.id,
      };

      const { data: entryData, error: entryError } = await supabase
        .from("budget_entries")
        .insert(testEntry)
        .select();

      if (entryError) {
        console.error("❌ Entry creation failed:", {
          code: entryError.code,
          message: entryError.message,
          details: entryError.details,
          hint: entryError.hint,
        });
        return;
      }
      console.log("✅ Entry creation successful:", entryData);

      // Cleanup test data
      console.log("6. Cleaning up test data...");
      await supabase.from("budget_entries").delete().eq("id", testEntry.id);
      await supabase.from("budgets").delete().eq("id", testBudget.id);
      console.log("✅ Cleanup completed");

      console.log("=== ALL TESTS PASSED ===");
    } catch (error) {
      console.error("❌ Unexpected error:", error);
    }
  }

  static async checkRLSPolicies(): Promise<void> {
    console.log("=== CHECKING RLS POLICIES ===");

    try {
      const { data, error } = await supabase.rpc("pg_policies");

      if (error) {
        console.error("❌ Could not fetch policies:", error);
        return;
      }

      console.log("📋 RLS Policies:", data);
    } catch (error) {
      console.log(
        "⚠️ Could not check RLS policies (this is normal if you don't have admin access)",
      );
    }
  }
}
