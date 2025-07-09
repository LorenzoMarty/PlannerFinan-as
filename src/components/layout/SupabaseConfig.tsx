import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserData } from "@/contexts/UserDataContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { SupabaseSetup } from "@/lib/supabase-setup";
import { setupDemoUsers, resetDemoData } from "@/lib/setup-demo-users";
import {
  Cloud,
  CloudOff,
  Database,
  RefreshCw,
  Upload,
  CheckCircle,
  AlertCircle,
  Server,
  Shield,
  HardDrive,
  Users,
  RotateCcw,
} from "lucide-react";

export function SupabaseConfig() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "disconnected" | "error"
  >("checking");
  const { useSupabase, toggleStorageMode, migrateToSupabase, currentUser } =
    useUserData();
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setConnectionStatus("checking");
    try {
      const connected = await SupabaseSetup.testConnection();
      setIsConnected(connected);
      setConnectionStatus(connected ? "connected" : "disconnected");
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus("error");
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      const connected = await SupabaseSetup.testConnection();
      setIsConnected(connected);
      setConnectionStatus(connected ? "connected" : "disconnected");

      if (connected) {
        toast({
          title: "Conexão bem-sucedida!",
          description: "Supabase está funcionando corretamente",
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: "Não foi possível conectar ao Supabase",
          variant: "destructive",
        });
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus("error");
      toast({
        title: "Erro de conexão",
        description: "Erro inesperado ao testar conexão",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTables = async () => {
    setIsLoading(true);
    try {
      const success = await SupabaseSetup.ensureTablesExist();
      if (success) {
        toast({
          title: "Tabelas criadas com sucesso!",
          description: "Estrutura do banco de dados está pronta",
        });
        await checkConnection();
      } else {
        toast({
          title: "Erro ao criar tabelas",
          description: "Verifique as permissões no Supabase",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível criar as tabelas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigration = async () => {
    setIsLoading(true);
    try {
      const success = await migrateToSupabase();
      if (success) {
        toast({
          title: "Migração concluída!",
          description: "Seus dados foram migrados para o Supabase",
        });
      } else {
        toast({
          title: "Erro na migração",
          description: "Não foi possível migrar os dados",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Falha durante a migração",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStorage = () => {
    toggleStorageMode();
    toast({
      title: useSupabase
        ? "Mudando para localStorage"
        : "Mudando para Supabase",
      description: `Dados serão salvos ${!useSupabase ? "na nuvem" : "localmente"}`,
    });
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "checking":
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "disconnected":
        return <CloudOff className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case "checking":
        return "Verificando...";
      case "connected":
        return "Conectado";
      case "disconnected":
        return "Desconectado";
      case "error":
        return "Erro de conexão";
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Status da Integração Supabase
          </CardTitle>
          <CardDescription>
            Gerencie a conexão e sincronização com o banco de dados na nuvem
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="font-medium">{getStatusText()}</span>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {useSupabase ? (
                <Database className="w-4 h-4 text-blue-500" />
              ) : (
                <HardDrive className="w-4 h-4 text-gray-500" />
              )}
              <span className="font-medium">Modo de Armazenamento</span>
            </div>
            <Badge variant={useSupabase ? "default" : "outline"}>
              {useSupabase ? "Supabase (Nuvem)" : "localStorage (Local)"}
            </Badge>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleTestConnection}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Testar Conexão
            </Button>

            <Button
              onClick={handleCreateTables}
              disabled={isLoading || !isConnected}
              variant="outline"
              size="sm"
            >
              <Database className="w-4 h-4 mr-2" />
              Criar Tabelas
            </Button>

            <Button
              onClick={handleToggleStorage}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {useSupabase ? (
                <>
                  <HardDrive className="w-4 h-4 mr-2" />
                  Usar Local
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4 mr-2" />
                  Usar Nuvem
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Migration Card */}
      {!useSupabase && isConnected && currentUser && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Migração para Supabase
            </CardTitle>
            <CardDescription>
              Transfira seus dados locais para a nuvem para acesso em qualquer
              dispositivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-4">
              <Shield className="w-4 h-4" />
              <AlertDescription>
                Seus dados locais serão transferidos com segurança para o
                Supabase. Os dados locais serão mantidos como backup.
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleMigration}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Migrar para Supabase
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Informações do Supabase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Projeto URL:</span>
            <span className="font-mono">hzqidfqjysjclksqqvqj.supabase.co</span>
          </div>
          <div className="flex justify-between">
            <span>Região:</span>
            <span>US East (N. Virginia)</span>
          </div>
          <div className="flex justify-between">
            <span>Status do Serviço:</span>
            <span className="text-green-500">Operacional</span>
          </div>
          <div className="flex justify-between">
            <span>Backup Local:</span>
            <span>Automático (a cada 10 min)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
