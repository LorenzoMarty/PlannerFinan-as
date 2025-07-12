import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Database } from "lucide-react";

export function SupabaseConfig() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Configuração de Dados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Modo de Armazenamento</span>
          </div>
          <Badge variant="default">Nuvem</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          O armazenamento de dados está sempre na nuvem (Supabase). O modo local foi desativado.
        </div>
      </CardContent>
    </Card>
  );
}
