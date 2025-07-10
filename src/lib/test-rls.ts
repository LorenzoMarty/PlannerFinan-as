import { supabase } from "./supabase";
import { setupMockAuthentication } from "./auth-mock";

/**
 * Test RLS (Row Level Security) policies functionality
 */

export async function testRLSPolicies(): Promise<boolean> {
  console.log("🔒 Testing RLS Policies...");

  try {
    // Ensure we have an authenticated user
    const authSetup = await setupMockAuthentication();
    if (!authSetup) {
      console.error("❌ Could not set up authentication for RLS testing");
      return false;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      console.error("❌ No authenticated session found");
      return false;
    }

    console.log("✅ Authenticated as:", session.user.email);
    console.log("User ID:", session.user.id);
    console.log("User role:", session.user.role);

    // Test 1: Check table permissions first
    console.log("🧪 Test 1: Checking table permissions...");

    // Test basic SELECT permission
    const { data: selectTest, error: selectError } = await supabase
      .from("user_profiles")
      .select("count");

    if (selectError) {
      console.error("❌ Basic SELECT failed:", selectError);
      console.error("Error details:", {
        code: selectError.code,
        message: selectError.message,
        details: selectError.details,
        hint: selectError.hint,
      });
      return false;
    }
    console.log("✅ Basic SELECT works");

    // Test 2: Create user profile (should work with RLS)
    console.log("🧪 Test 2: Creating/updating user profile...");
    const profileData = {
      id: session.user.id,
      email: session.user.email || "test@test.com",
      name: "Test RLS User",
    };

    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .upsert(profileData, { onConflict: "id" })
      .select();

    if (profileError) {
      console.error("❌ Profile creation failed:", profileError);
      console.error("Error details:", {
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      });

      // Try INSERT instead of UPSERT
      console.log("🔄 Trying INSERT instead...");
      const { data: insertProfile, error: insertError } = await supabase
        .from("user_profiles")
        .insert(profileData)
        .select();

      if (insertError) {
        console.error("❌ Profile INSERT also failed:", insertError);
        return false;
      } else {
        console.log("✅ Profile creation via INSERT successful");
      }
    } else {
      console.log("✅ Profile creation via UPSERT successful");
    }

    // Test 3: Create a budget (should work with RLS)
    console.log("🧪 Test 3: Creating budget...");
    const budgetData = {
      id: `test-budget-${Date.now()}`,
      name: "Test RLS Budget",
      code: `RLS${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      owner_id: session.user.id,
      collaborators: [],
    };

    const { data: budget, error: budgetError } = await supabase
      .from("budgets")
      .insert(budgetData)
      .select();

    if (budgetError) {
      console.error("❌ Budget creation failed:", budgetError);
      console.error("Error details:", {
        code: budgetError.code,
        message: budgetError.message,
        details: budgetError.details,
        hint: budgetError.hint,
      });
      return false;
    }
    console.log("✅ Budget creation successful");

    // Test 4: Create a category (should work with RLS)
    console.log("🧪 Test 4: Creating category...");
    const categoryData = {
      id: `test-category-${Date.now()}`,
      name: "Test RLS Category",
      type: "expense" as const,
      color: "#FF0000",
      icon: "test",
      user_id: session.user.id,
    };

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .insert(categoryData)
      .select();

    if (categoryError) {
      console.error("❌ Category creation failed:", categoryError);
      console.error("Error details:", {
        code: categoryError.code,
        message: categoryError.message,
        details: categoryError.details,
        hint: categoryError.hint,
      });
      return false;
    }
    console.log("✅ Category creation successful");

    // Test 5: Create a budget entry (should work with RLS)
    console.log("🧪 Test 5: Creating budget entry...");
    const entryData = {
      id: `test-entry-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      description: "Test RLS Entry",
      category: "Test",
      amount: 100.0,
      type: "expense" as const,
      user_id: session.user.id,
      budget_id: budgetData.id,
    };

    const { data: entry, error: entryError } = await supabase
      .from("budget_entries")
      .insert(entryData)
      .select();

    if (entryError) {
      console.error("❌ Entry creation failed:", entryError);
      console.error("Error details:", {
        code: entryError.code,
        message: entryError.message,
        details: entryError.details,
        hint: entryError.hint,
      });
      return false;
    }
    console.log("✅ Entry creation successful");

    // Test 6: Query user data (should only return user's own data)
    console.log("🧪 Test 6: Querying user data...");

    const { data: userBudgets, error: queryError } = await supabase
      .from("budgets")
      .select("*")
      .eq("owner_id", session.user.id);

    if (queryError) {
      console.error("❌ Data query failed:", queryError.message);
      return false;
    }

    if (!userBudgets || userBudgets.length === 0) {
      console.error("❌ No data returned - RLS might be too restrictive");
      return false;
    }

    console.log(
      "✅ Data query successful, found",
      userBudgets.length,
      "budgets",
    );

    // Cleanup test data
    console.log("🧹 Cleaning up test data...");
    await supabase.from("budget_entries").delete().eq("id", entryData.id);
    await supabase.from("categories").delete().eq("id", categoryData.id);
    await supabase.from("budgets").delete().eq("id", budgetData.id);
    console.log("✅ Cleanup completed");

    console.log("🎉 All RLS tests passed!");
    return true;
  } catch (error) {
    console.error("❌ RLS test failed with error:", error);
    return false;
  }
}

/**
 * Quick RLS status check
 */
export async function checkRLSStatus(): Promise<{
  authenticated: boolean;
  canRead: boolean;
  canWrite: boolean;
}> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const authenticated = !!session?.user;

    if (!authenticated) {
      return { authenticated: false, canRead: false, canWrite: false };
    }

    // Test read capability
    const { error: readError } = await supabase
      .from("user_profiles")
      .select("count")
      .limit(1);

    const canRead = !readError;

    // Test write capability (try to upsert user profile)
    const { error: writeError } = await supabase.from("user_profiles").upsert(
      {
        id: session.user.id,
        email: session.user.email || "test@test.com",
        name: "RLS Test User",
      },
      { onConflict: "id" },
    );

    const canWrite = !writeError;

    return { authenticated, canRead, canWrite };
  } catch (error) {
    console.error("RLS status check failed:", error);
    return { authenticated: false, canRead: false, canWrite: false };
  }
}

// Auto-test RLS on import in development
if (import.meta.env.DEV) {
  setTimeout(async () => {
    const status = await checkRLSStatus();
    console.log("🔒 RLS Status:", status);

    if (status.authenticated && status.canRead && status.canWrite) {
      console.log("✅ RLS is working correctly");
    } else {
      console.warn("⚠️ RLS might have issues:", status);
    }
  }, 2000); // Delay to ensure setup is complete
}
