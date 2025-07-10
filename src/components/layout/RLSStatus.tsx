import React from "react";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";

interface RLSStatusProps {
  showDetails?: boolean;
}

export function RLSStatus({ showDetails = false }: RLSStatusProps) {
  if (!showDetails) {
    return (
      <Badge variant="default">
        <Shield className="w-3 h-3 mr-1" />
        RLS OK
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="default">
        <Shield className="w-3 h-3 mr-1" />
        RLS OK
      </Badge>
    </div>
  );
}
