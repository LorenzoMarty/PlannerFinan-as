// Simple test to check if Supabase is working
import { supabase } from "./src/lib/supabase.ts";

async function testSupabase() {
  console.log("Testing Supabase...");

  try {
    // Test auth
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    console.log("Current session:", session);

    // Test database connection
    const { data, error: dbError } = await supabase
      .from("user_profiles")
      .select("*")
      .range(0, 0);

    if (dbError) {
      console.error("Database error:", dbError);
    } else {
      console.log("Database connected successfully");
    }
  } catch (error) {
    console.error("Supabase test failed:", error);
  }
}

testSupabase();
