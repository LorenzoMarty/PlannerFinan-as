import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUserData } from "@/contexts/UserDataContext";
import {
  testSupabaseConnection,
  createTestUserProfile,
} from "@/lib/supabase-test";
import { Cloud, CloudOff, Database, ArrowUpDown, TestTube } from "lucide-react";

export const SupabaseStatus: React.FC = () => {
  const { useSupabase, isLoading, migrateToSupabase, toggleStorageMode } =
    useUserData();

  const getStatusIcon = () => {
    if (isLoading) {
      return <ArrowUpDown className="h-3 w-3 animate-spin" />;
    }
    return useSupabase ? (
      <Cloud className="h-3 w-3" />
    ) : (
      <CloudOff className="h-3 w-3" />
    );
  };

  const getStatusColor = () => {
    if (isLoading) return "secondary";
    return useSupabase ? "default" : "outline";
  };

  const handleMigrate = async () => {
    try {
      const success = await migrateToSupabase();
      if (success) {
        alert("Migração para Supabase concluída com sucesso!");
      } else {
        alert("Erro na migração. Tente novamente.");
      }
    } catch (error) {
      alert("Erro na migração. Tente novamente.");
    }
  };

  const handleTestConnection = async () => {
    const success = await testSupabaseConnection();
    if (success) {
      alert("Conexão com Supabase funcionando!");
    } else {
      alert("Erro na conexão com Supabase. Verifique o console.");
    }
  };

  const handleTestUserCreation = async () => {
    const success = await createTestUserProfile();
    if (success) {
      alert("Teste de criação de usuário bem-sucedido!");
    } else {
      alert("Erro no teste de criação de usuário. Verifique o console.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={getStatusColor() as any}
                className="cursor-pointer flex items-center gap-1 text-xs px-2 py-1"
              >
                {getStatusIcon()}
                <span className="hidden sm:inline">
                  {useSupabase ? "Cloud" : "Local"}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <div className="font-medium">Armazenamento de Dados</div>
                <div className="text-xs space-y-1">
                  <div>
                    Modo: {useSupabase ? "Supabase (Cloud)" : "LocalStorage"}
                  </div>
                  <div>
                    Status: {isLoading ? "Sincronizando..." : "Conectado"}
                  </div>
                  <div>Clique para gerenciar</div>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuração de Armazenamento
          </DialogTitle>
          <DialogDescription>
            Gerencie como seus dados são armazenados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Cloud className="h-5 w-5 text-blue-500" />
              <div>
                <h4 className="font-medium">Supabase (Cloud)</h4>
                <p className="text-sm text-muted-foreground">
                  Armazenamento na nuvem com sincronização automática
                </p>
              </div>
            </div>
            {useSupabase && (
              <Badge variant="default" className="text-xs">
                Ativo
              </Badge>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-gray-500" />
              <div>
                <h4 className="font-medium">LocalStorage</h4>
                <p className="text-sm text-muted-foreground">
                  Armazenamento local no navegador
                </p>
              </div>
            </div>
            {!useSupabase && (
              <Badge variant="default" className="text-xs">
                Ativo
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            <Button
              onClick={toggleStorageMode}
              variant="outline"
              className="w-full"
              disabled={isLoading}
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Alternar para {useSupabase ? "LocalStorage" : "Supabase"}
            </Button>

            {!useSupabase && (
              <Button
                onClick={handleMigrate}
                className="w-full"
                disabled={isLoading}
              >
                <Cloud className="h-4 w-4 mr-2" />
                Migrar para Supabase
              </Button>
            )}

            {useSupabase && (
              <div className="space-y-2">
                <Button
                  onClick={handleTestConnection}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Testar Conexão
                </Button>
                <Button
                  onClick={handleTestUserCreation}
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                >
                  <Database className="h-4 w-4 mr-2" />
                  Testar Criação
                </Button>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              <strong>Supabase:</strong> Dados sincronizados na nuvem,
              acessíveis de qualquer dispositivo.
            </p>
            <p className="mt-1">
              <strong>LocalStorage:</strong> Dados salvos apenas neste
              navegador.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
