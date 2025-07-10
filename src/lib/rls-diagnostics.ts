import { supabase } from "./supabase";
import { setupMockAuthentication } from "./auth-mock";

/**
 * Diagnose and repair RLS permission issues
 */

export interface RLSDiagnostic {
  test: string;
  success: boolean;
  error?: string;
  details?: any;
}

export async function diagnoseRLSIssues(): Promise<RLSDiagnostic[]> {
  const results: RLSDiagnostic[] = [];

  console.log("🔍 Starting RLS diagnostics...");

  // Test 1: Check authentication
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    results.push({
      test: "Authentication Check",
      success: !!session?.user,
      details: session?.user
        ? {
            userId: session.user.id,
            email: session.user.email,
            role: session.user.role,
          }
        : "No active session",
    });
  } catch (error) {
    results.push({
      test: "Authentication Check",
      success: false,
      error: String(error),
    });
  }

  // Test 2: Check if RLS is enabled
  try {
    const { data: rlsStatus, error } = await supabase.rpc("exec_sql", {
      sql: `
        SELECT 
          schemaname,
          tablename,
          rowsecurity as rls_enabled
        FROM pg_tables 
        WHERE tablename IN ('user_profiles', 'budgets', 'categories', 'budget_entries')
        AND schemaname = 'public';
      `,
    });

    results.push({
      test: "RLS Status Check",
      success: !error,
      error: error?.message,
      details: rlsStatus,
    });
  } catch (error) {
    results.push({
      test: "RLS Status Check",
      success: false,
      error: String(error),
    });
  }

  // Test 3: Check table permissions
  const tables = ["user_profiles", "budgets", "categories", "budget_entries"];
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select("count")
        .limit(1);

      results.push({
        test: `Table Access: ${table}`,
        success: !error,
        error: error?.message,
        details: error
          ? {
              code: error.code,
              hint: error.hint,
              details: error.details,
            }
          : "Access granted",
      });
    } catch (error) {
      results.push({
        test: `Table Access: ${table}`,
        success: false,
        error: String(error),
      });
    }
  }

  // Test 4: Check write permissions on each table
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const testData = {
      user_profiles: {
        id: session.user.id,
        email: session.user.email || "test@example.com",
        name: "RLS Test User",
      },
      budgets: {
        id: `rls-test-budget-${Date.now()}`,
        name: "RLS Test Budget",
        code: `TEST${Math.random().toString(36).substr(2, 4)}`,
        owner_id: session.user.id,
        collaborators: [],
      },
      categories: {
        id: `rls-test-category-${Date.now()}`,
        name: "RLS Test Category",
        type: "expense" as const,
        color: "#FF0000",
        icon: "test",
        user_id: session.user.id,
      },
      budget_entries: {
        id: `rls-test-entry-${Date.now()}`,
        date: new Date().toISOString().split("T")[0],
        description: "RLS Test Entry",
        category: "Test",
        amount: 100.0,
        type: "expense" as const,
        user_id: session.user.id,
        budget_id: "dummy-budget-id", // This will fail but we can see the error
      },
    };

    for (const [table, data] of Object.entries(testData)) {
      try {
        const { error } = await supabase.from(table).insert(data).select();

        results.push({
          test: `Write Permission: ${table}`,
          success: !error,
          error: error?.message,
          details: error
            ? {
                code: error.code,
                hint: error.hint,
                details: error.details,
              }
            : "Write access granted",
        });

        // Cleanup if successful
        if (!error && table !== "user_profiles") {
          await supabase
            .from(table)
            .delete()
            .eq("id", (data as any).id);
        }
      } catch (error) {
        results.push({
          test: `Write Permission: ${table}`,
          success: false,
          error: String(error),
        });
      }
    }
  }

  console.log("🔍 Diagnostics complete");
  return results;
}

/**
 * Attempt to repair common RLS issues
 */
export async function repairRLSIssues(): Promise<boolean> {
  console.log("🔧 Attempting to repair RLS issues...");

  try {
    // Step 1: Ensure authentication
    const authSuccess = await setupMockAuthentication();
    if (!authSuccess) {
      console.error("❌ Could not establish authentication");
      return false;
    }

    // Step 2: Check and create user profile if needed
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (profileError && profileError.code === "PGRST116") {
        // Profile doesn't exist, create it
        console.log("🔧 Creating user profile...");
        const { error: createError } = await supabase
          .from("user_profiles")
          .insert({
            id: session.user.id,
            email: session.user.email || "repair@test.com",
            name: "Repaired User",
          });

        if (createError) {
          console.error("❌ Failed to create user profile:", createError);
          return false;
        } else {
          console.log("✅ User profile created");
        }
      }
    }

    // Step 3: Test write permissions
    const testSuccess = await testWritePermissions();
    if (!testSuccess) {
      console.log("⚠️ Write permissions still failing after repair");
      return false;
    }

    console.log("✅ RLS repair completed successfully");
    return true;
  } catch (error) {
    console.error("❌ RLS repair failed:", error);
    return false;
  }
}

/**
 * Test basic write permissions
 */
async function testWritePermissions(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return false;
  }

  try {
    // Test user profile write
    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: session.user.id,
        email: session.user.email || "test@test.com",
        name: "Test User",
      },
      { onConflict: "id" },
    );

    if (profileError) {
      console.error("❌ Profile write failed:", profileError);
      return false;
    }

    // Test budget write
    const testBudgetId = `test-budget-${Date.now()}`;
    const { error: budgetError } = await supabase.from("budgets").insert({
      id: testBudgetId,
      name: "Test Budget",
      code: `TEST${Math.random().toString(36).substr(2, 4)}`,
      owner_id: session.user.id,
      collaborators: [],
    });

    if (budgetError) {
      console.error("❌ Budget write failed:", budgetError);
      return false;
    }

    // Cleanup
    await supabase.from("budgets").delete().eq("id", testBudgetId);

    console.log("✅ Write permissions working");
    return true;
  } catch (error) {
    console.error("❌ Write permission test failed:", error);
    return false;
  }
}

/**
 * Display diagnostics in a readable format
 */
export function displayDiagnostics(results: RLSDiagnostic[]): void {
  console.log("\n📊 RLS Diagnostics Report:");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r.success).length;
  const total = results.length;

  console.log(`Overall: ${passed}/${total} tests passed\n`);

  results.forEach((result, index) => {
    const icon = result.success ? "✅" : "❌";
    console.log(`${icon} ${result.test}`);

    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }

    if (result.details) {
      console.log(`   Details:`, result.details);
    }

    console.log("");
  });

  if (passed < total) {
    console.log("💡 Suggestions:");
    console.log("1. Run 'repairRLSIssues()' to attempt automatic repair");
    console.log("2. Check if RLS policies are properly configured in Supabase");
    console.log("3. Verify user authentication is working");
    console.log("4. Execute the SQL in 'supabase-rls-write-permissions.sql'");
  }
}
