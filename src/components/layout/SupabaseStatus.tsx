import React from "react";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/contexts/UserDataContext";
import { Cloud, CloudOff } from "lucide-react";

export const SupabaseStatus: React.FC = () => {
  const { useSupabase } = useUserData();

  return (
    <Badge
      variant={useSupabase ? "default" : "outline"}
      className="flex items-center gap-1 text-xs px-2 py-1"
    >
      {useSupabase ? (
        <Cloud className="h-3 w-3" />
      ) : (
        <CloudOff className="h-3 w-3" />
      )}
      <span className="hidden sm:inline">
        {useSupabase ? "Cloud" : "Local"}
      </span>
    </Badge>
  );
};
