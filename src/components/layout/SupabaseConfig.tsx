import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/contexts/UserDataContext";
import { Cloud, HardDrive, Database } from "lucide-react";

export function SupabaseConfig() {
  const { useSupabase, toggleStorageMode } = useUserData();

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
            {useSupabase ? (
              <Cloud className="w-4 h-4 text-blue-500" />
            ) : (
              <HardDrive className="w-4 h-4 text-gray-500" />
            )}
            <span className="font-medium">Modo de Armazenamento</span>
          </div>
          <Badge variant={useSupabase ? "default" : "outline"}>
            {useSupabase ? "Nuvem" : "Local"}
          </Badge>
        </div>

        <Button
          onClick={toggleStorageMode}
          variant="outline"
          className="w-full"
        >
          {useSupabase ? (
            <>
              <HardDrive className="w-4 h-4 mr-2" />
              Usar Armazenamento Local
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 mr-2" />
              Usar Armazenamento na Nuvem
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
