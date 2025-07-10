import { supabase } from "./supabase";

/**
 * Mock authentication utility for RLS policies
 * This ensures a user is always authenticated when interacting with Supabase
 */

export interface MockUser {
  id: string;
  email: string;
  name: string;
  password: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    id: "demo-user-uuid-1234567890",
    email: "demo@plannerfin.com",
    password: "123456",
    name: "Usuário Demo",
  },
  {
    id: "admin-user-uuid-0987654321",
    email: "admin@plannerfin.com",
    password: "admin123",
    name: "Administrador",
  },
];

let currentMockUser: MockUser | null = null;

/**
 * Set up a mock authenticated session for RLS policies to work
 */
export async function setupMockAuthentication(
  userEmail?: string,
): Promise<boolean> {
  try {
    // Choose mock user
    const targetUser = userEmail
      ? MOCK_USERS.find((u) => u.email === userEmail)
      : MOCK_USERS[0];

    if (!targetUser) {
      console.error("Mock user not found:", userEmail);
      return false;
    }

    // Check if already authenticated as this user
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.email === targetUser.email) {
      currentMockUser = targetUser;
      console.log("✅ Already authenticated as:", targetUser.email);

      // Ensure user profile exists for RLS
      await ensureUserProfileExists(session.user.id, targetUser);
      return true;
    }

    // Try to sign in with mock user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: targetUser.email,
      password: targetUser.password,
    });

    if (error) {
      console.log("🔧 Mock user doesn't exist, creating...");

      // Create the mock user if it doesn't exist
      const { data: signUpData, error: signUpError } =
        await supabase.auth.signUp({
          email: targetUser.email,
          password: targetUser.password,
          options: {
            data: {
              name: targetUser.name,
            },
            emailRedirectTo: undefined, // Disable email confirmation for demo
          },
        });

      if (signUpError) {
        console.error("❌ Failed to create mock user:", signUpError.message);
        return false;
      }

      if (signUpData.user) {
        console.log("✅ Mock user created:", targetUser.email);

        // If email confirmation is disabled, the user should be immediately available
        if (signUpData.session) {
          currentMockUser = targetUser;
          console.log("✅ Mock authentication successful:", targetUser.email);

          // Ensure user profile exists for RLS
          await ensureUserProfileExists(signUpData.session.user.id, targetUser);

          // Store in localStorage for ProtectedRoute compatibility
          localStorage.setItem(
            "plannerfinUser",
            JSON.stringify({
              id: signUpData.session.user.id,
              email: targetUser.email,
              name: targetUser.name,
              authenticated: true,
            }),
          );

          return true;
        }

        // If no session but user created, try to sign in
        const { data: retryData, error: retryError } =
          await supabase.auth.signInWithPassword({
            email: targetUser.email,
            password: targetUser.password,
          });

        if (retryError) {
          console.error(
            "❌ Failed to sign in after creation:",
            retryError.message,
          );
          return false;
        }

        if (retryData.session) {
          currentMockUser = targetUser;
          console.log("✅ Mock authentication successful:", targetUser.email);

          // Ensure user profile exists for RLS
          await ensureUserProfileExists(retryData.session.user.id, targetUser);

          // Store in localStorage for ProtectedRoute compatibility
          localStorage.setItem(
            "plannerfinUser",
            JSON.stringify({
              id: retryData.session.user.id,
              email: targetUser.email,
              name: targetUser.name,
              authenticated: true,
            }),
          );

          return true;
        }
      }
    } else if (data.session) {
      currentMockUser = targetUser;
      console.log("✅ Mock authentication successful:", targetUser.email);

      // Ensure user profile exists for RLS
      await ensureUserProfileExists(data.session.user.id, targetUser);

      // Store in localStorage for ProtectedRoute compatibility
      localStorage.setItem(
        "plannerfinUser",
        JSON.stringify({
          id: data.session.user.id,
          email: targetUser.email,
          name: targetUser.name,
          authenticated: true,
        }),
      );

      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Mock authentication failed:", error);
    return false;
  }
}

/**
 * Ensure user profile exists in database for RLS policies
 */
async function ensureUserProfileExists(
  userId: string,
  user: MockUser,
): Promise<void> {
  try {
    // Check if profile exists
    const { data: existing, error: selectError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking user profile:", selectError);
      return;
    }

    if (!existing) {
      // Create user profile
      const { error: insertError } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          email: user.email,
          name: user.name,
        });

      if (insertError) {
        console.error("❌ Failed to create user profile:", insertError);
      } else {
        console.log("✅ User profile created for RLS");
      }
    }
  } catch (error) {
    console.error("Error ensuring user profile:", error);
  }
}

/**
 * Get current mock user
 */
export function getCurrentMockUser(): MockUser | null {
  return currentMockUser;
}

/**
 * Ensure authentication before any Supabase RLS operation
 */
export async function ensureAuthenticated(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return true;
  }

  console.log("🔧 No active session, setting up mock authentication...");
  return await setupMockAuthentication();
}

/**
 * Auto-setup mock authentication on import (for development)
 */
if (import.meta.env.DEV) {
  setupMockAuthentication().then((success) => {
    if (success) {
      console.log("🚀 Mock authentication auto-setup completed");
    }
  });
}
