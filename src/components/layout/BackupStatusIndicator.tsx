import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserData } from "@/contexts/UserDataContext";
import { CheckCircle, Database, AlertTriangle } from "lucide-react";

export const BackupStatusIndicator: React.FC = () => {
  const { getStorageInfo } = useUserData();
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [storageHealth, setStorageHealth] = useState<
    "good" | "warning" | "critical"
  >("good");

  useEffect(() => {
    // Check backup status every minute
    const checkBackupStatus = () => {
      try {
        const metadata = localStorage.getItem("plannerfinMetadata");
        if (metadata) {
          const parsed = JSON.parse(metadata);
          setLastBackup(parsed.lastUpdated);
        }

        // Check storage health
        const storageInfo = getStorageInfo();
        const percentage = (storageInfo.used / storageInfo.total) * 100;

        if (percentage > 90) {
          setStorageHealth("critical");
        } else if (percentage > 80) {
          setStorageHealth("warning");
        } else {
          setStorageHealth("good");
        }
      } catch (error) {
        console.error("Error checking backup status:", error);
      }
    };

    checkBackupStatus();
    const interval = setInterval(checkBackupStatus, 60000); // Every minute

    return () => clearInterval(interval);
  }, [getStorageInfo]);

  const formatLastBackup = (dateString: string | null) => {
    if (!dateString) return "Nunca";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Agora mesmo";
    if (diffMinutes < 60) return `${diffMinutes}m atrás`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d atrás`;
  };

  const getStatusIcon = () => {
    switch (storageHealth) {
      case "critical":
        return <AlertTriangle className="h-3 w-3" />;
      case "warning":
        return <Database className="h-3 w-3" />;
      default:
        return <CheckCircle className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (storageHealth) {
      case "critical":
        return "destructive";
      case "warning":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTooltipContent = () => {
    const storageInfo = getStorageInfo();
    const percentage =
      storageInfo.total > 0 ? (storageInfo.used / storageInfo.total) * 100 : 0;

    return (
      <div className="space-y-1">
        <div className="font-medium">Status do Backup</div>
        <div className="text-xs space-y-1">
          <div>Último backup: {formatLastBackup(lastBackup)}</div>
          <div>Storage: {percentage.toFixed(1)}% usado</div>
          <div>Backup automático: ativo</div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={getStatusColor() as any}
            className="cursor-help flex items-center gap-1 text-xs px-2 py-1"
          >
            {getStatusIcon()}
            <span className="hidden sm:inline">Backup</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{getTooltipContent()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
