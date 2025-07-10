import {
  supabase,
  isUsingDemoCredentials,
  isSupabaseAvailable,
} from "./supabase";

export async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  if (isUsingDemoCredentials) {
    console.warn("⚠️ Supabase is running in DEMO MODE");
    console.warn("To connect to a real Supabase database:");
    console.warn("1. Create a new project at https://supabase.com");
    console.warn("2. Set environment variables:");
    console.warn("   VITE_SUPABASE_URL=your_project_url");
    console.warn("   VITE_SUPABASE_ANON_KEY=your_anon_key");
    console.warn("3. Create the required tables (see SUPABASE_SETUP.md)");
    return false;
  }

  try {
    const isAvailable = await isSupabaseAvailable();

    if (!isAvailable) {
      console.error("❌ Supabase connection failed");
      console.error("Possible causes:");
      console.error("- Incorrect URL or API key");
      console.error("- Network connectivity issues");
      console.error("- Project doesn't exist or is paused");
      return false;
    }

    // Test basic connection
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .range(0, 0);

    if (error) {
      if (error.code === "42P01") {
        console.error("❌ Database tables not found");
        console.error(
          "Please run the SQL commands from SUPABASE_SETUP.md to create the required tables",
        );
        return false;
      }

      console.error("Supabase connection test failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      return false;
    }

    console.log("✅ Supabase connection successful!");
    console.log("Test data:", data);
    return true;
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
    return false;
  }
}

export async function createTestUserProfile() {
  console.log("Creating test user profile...");

  if (isUsingDemoCredentials) {
    console.warn("⚠️ Cannot test user creation in demo mode");
    console.warn("Please configure real Supabase credentials first");
    return false;
  }

  try {
    const isAvailable = await isSupabaseAvailable();

    if (!isAvailable) {
      console.error("❌ Supabase not available for testing");
      return false;
    }

    const testUser = {
      id: "test-user-" + Date.now(),
      email: "test@example.com",
      name: "Test User",
    };

    const { data, error } = await supabase
      .from("user_profiles")
      .insert(testUser)
      .select()
      .single();

    if (error) {
      if (error.code === "42P01") {
        console.error(
          "❌ Tables not found. Please create them first using SUPABASE_SETUP.md",
        );
        return false;
      }
      console.error("Test user creation failed:", error);
      return false;
    }

    console.log("✅ Test user created successfully:", data);

    // Clean up - delete the test user
    const { error: deleteError } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", testUser.id);

    if (deleteError) {
      console.warn("⚠️ Could not clean up test user:", deleteError);
    } else {
      console.log("✅ Test user cleaned up");
    }

    return true;
  } catch (error) {
    console.error("❌ Test user creation error:", error);
    return false;
  }
}
