import { supabase } from "./supabase";

export async function testSupabaseConnection() {
  console.log("Testing Supabase connection...");

  try {
    // Test basic connection
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      return false;
    }

    console.log("Supabase connection successful!");
    console.log("Test data:", data);
    return true;
  } catch (error) {
    console.error("Supabase connection error:", error);
    return false;
  }
}

export async function createTestUserProfile() {
  console.log("Creating test user profile...");

  try {
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
      console.error("Test user creation failed:", error);
      return false;
    }

    console.log("Test user created successfully:", data);

    // Clean up - delete the test user
    await supabase.from("user_profiles").delete().eq("id", testUser.id);
    console.log("Test user cleaned up");

    return true;
  } catch (error) {
    console.error("Test user creation error:", error);
    return false;
  }
}
