import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export const AutoSaveNotification: React.FC = () => {
  const [showNotification, setShowNotification] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<string | null>(null);

  useEffect(() => {
    // Listen for localStorage changes to detect auto-saves
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("plannerfinUserData_")) {
        setLastSaveTime(new Date().toLocaleTimeString());
        setShowNotification(true);

        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      }
    };

    // Listen for plannerfinMetadata changes (backup creation)
    const handleBackupCreation = () => {
      const metadata = localStorage.getItem("plannerfinMetadata");
      if (metadata) {
        try {
          const parsed = JSON.parse(metadata);
          const lastUpdated = new Date(parsed.lastUpdated);
          const now = new Date();

          // If backup was created in the last 5 seconds, show notification
          if (now.getTime() - lastUpdated.getTime() < 5000) {
            setLastSaveTime(lastUpdated.toLocaleTimeString());
            setShowNotification(true);
            setTimeout(() => {
              setShowNotification(false);
            }, 3000);
          }
        } catch (error) {
          // Ignore errors
        }
      }
    };

    // Check for backup notifications every 30 seconds
    const interval = setInterval(handleBackupCreation, 30000);

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert
        className={cn(
          "transition-all duration-300 ease-in-out",
          "border-green-200 bg-green-50 dark:bg-green-950/20",
          "animate-in slide-in-from-bottom-2",
        )}
      >
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800 dark:text-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              Dados salvos automaticamente
            </span>
            {lastSaveTime && (
              <span className="text-xs opacity-70 ml-2">{lastSaveTime}</span>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};
