import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import { AutoSaveNotification } from "@/components/layout/AutoSaveNotification";
import { supabase } from "@/lib/supabase";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";

// Protected Route wrapper - uses Supabase session for auth state
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

useEffect(() => {
const checkAuth = async () => {
try {
const { data: { session }, error } = await supabase.auth.getSession();
if (error || !session) {
// Se offline ou sem sessão, destrói localStorage e força logout
localStorage.removeItem("plannerfinUser");
setIsAuthenticated(false);
} else {
setIsAuthenticated(true);
}
} catch {
// Qualquer erro (incluindo offline) destrói sessão local
localStorage.removeItem("plannerfinUser");
setIsAuthenticated(false);
}
};
checkAuth();
}, []);

if (isAuthenticated === null) {
// Loading state
return (
<div className="min-h-screen flex items-center justify-center">
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
</div>
);
}

if (!isAuthenticated) {
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
