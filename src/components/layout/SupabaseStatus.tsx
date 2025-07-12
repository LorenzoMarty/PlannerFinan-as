import React from "react";
import { Badge } from "@/components/ui/badge";
import { Cloud } from "lucide-react";

export const SupabaseStatus: React.FC = () => {
  return (
    <Badge variant="default" className="flex items-center gap-1 text-xs px-2 py-1">
      <Cloud className="h-3 w-3" />
      <span className="hidden sm:inline">Cloud</span>
    </Badge>
  );
};
