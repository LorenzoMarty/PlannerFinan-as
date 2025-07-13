import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { AutoSaveNotification } from "@/components/layout/AutoSaveNotification";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";

// Protected Route wrapper - uses Supabase session for auth state
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      try {
        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setSession(null);
          return;
        }

        setSession(currentSession);
      } catch (error) {
        console.error("Failed to get session:", error);
        setSession(null);
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, session?.user?.id);

      if (event === "SIGNED_OUT" || !session) {
        // Clear session and cached data first
        localStorage.removeItem("plannerfinUser");
        setSession(null);
        // Ensure we're on the login page
        window.location.href = "/";
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setSession(session);
      }
    });

    // Listen for online/offline changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      // When going offline, destroy session and redirect to login
      supabase.auth.signOut();
      setSession(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Show loading while checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show offline message if offline
  if (!isOnline) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">
            Sem conexão
          </h2>
          <p className="text-muted-foreground">
            Você precisa estar online para usar o aplicativo
          </p>
        </div>
      </div>
    );
  }

  // Redirect to login if no session
  if (!session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <SettingsProvider>
      <UserDataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AutoSaveNotification />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <Categories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/collaboration"
                element={
                  <ProtectedRoute>
                    <Collaboration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserDataProvider>
    </SettingsProvider>
  );
};

export default App;