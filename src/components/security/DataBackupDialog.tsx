import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useUserData } from "@/contexts/UserDataContext";
import {
  Download,
  Upload,
  Save,
  AlertTriangle,
  CheckCircle,
  HardDrive,
  FileText,
  Shield,
} from "lucide-react";

interface DataBackupDialogProps {
  children: React.ReactNode;
}

export const DataBackupDialog: React.FC<DataBackupDialogProps> = ({
  children,
}) => {
  const { exportUserData, importUserData, createManualBackup, getStorageInfo } =
    useUserData();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"backup" | "restore" | "storage">(
    "backup",
  );
  const [importData, setImportData] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const storageInfo = getStorageInfo();

  const handleExportData = () => {
    try {
      setIsProcessing(true);
      const data = exportUserData();

      if (!data) {
        setMessage({ type: "error", text: "Erro ao exportar dados" });
        return;
      }

      // Create download
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plannerfin-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: "success", text: "Backup exportado com sucesso!" });
    } catch (error: any) {
      console.error("Erro ao exportar backup:", error);
      setMessage({ type: "error", text: `Erro ao exportar backup: ${error.message || error}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportData = () => {
    if (!importData.trim()) {
      setMessage({
        type: "error",
        text: "Cole os dados do backup no campo acima",
      });
      return;
    }

    try {
      setIsProcessing(true);
      const success = importUserData(importData);

      if (success) {
        setMessage({
          type: "success",
          text: "Dados importados com sucesso! A página será recarregada.",
        });
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: "Erro ao importar dados. Verifique o formato do arquivo.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao importar dados:", error);
      setMessage({ type: "error", text: `Erro ao importar dados: ${error.message || error}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
    };
    reader.onerror = (error: any) => {
      console.error("Erro ao ler o arquivo:", error);
      setMessage({ type: "error", text: `Erro ao ler o arquivo: ${error.message || error}` });
    };
    reader.readAsText(file);
  };

  const handleCreateBackup = () => {
    try {
      setIsProcessing(true);
      const success = createManualBackup();

      if (success) {
        setMessage({
          type: "success",
          text: "Backup local criado com sucesso!",
        });
      } else {
        setMessage({ type: "error", text: "Erro ao criar backup local" });
      }
    } catch (error: any) {
      console.error("Erro ao criar backup local:", error);
      setMessage({ type: "error", text: `Erro ao criar backup local: ${error.message || error}` });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStoragePercentage = () => {
    if (storageInfo.total === 0) return 0;
    return (storageInfo.used / storageInfo.total) * 100;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Backup e Restauração de Dados
          </DialogTitle>
          <DialogDescription>
            Gerencie seus dados com segurança através de backup e restauração
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          {[
            { id: "backup", label: "Backup", icon: Save },
            { id: "restore", label: "Restaurar", icon: Upload },
            { id: "storage", label: "Armazenamento", icon: HardDrive },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {message && (
          <Alert
            className={
              message.type === "error"
                ? "border-destructive"
                : message.type === "success"
                  ? "border-green-200"
                  : ""
            }
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Backup Tab */}
        {activeTab === "backup" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exportar Dados
                </CardTitle>
                <CardDescription>
                  Baixe uma cópia completa de todos os seus dados financeiros
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    O backup inclui: perfis de usuário, orçamentos, categorias,
                    transações e configurações. Mantenha o arquivo em local
                    seguro.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleExportData}
                  disabled={isProcessing}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isProcessing ? "Exportando..." : "Baixar Backup Completo"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Backup Local
                </CardTitle>
                <CardDescription>
                  Crie um backup automático dos seus dados no navegador
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleCreateBackup}
                  disabled={isProcessing}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isProcessing ? "Criando..." : "Criar Backup Local"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Restore Tab */}
        {activeTab === "restore" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restaurar Dados
                </CardTitle>
                <CardDescription>
                  Importe dados de um arquivo de backup anterior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="border-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> Esta ação substituirá todos os
                    dados atuais. Certifique-se de ter um backup antes de
                    continuar.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="backup-file">
                    Selecionar arquivo de backup
                  </Label>
                  <Input
                    id="backup-file"
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup-data">
                    Ou cole os dados do backup
                  </Label>
                  <Textarea
                    id="backup-data"
                    placeholder="Cole o conteúdo do arquivo JSON de backup aqui..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>

                <Button
                  onClick={handleImportData}
                  disabled={isProcessing || !importData.trim()}
                  className="w-full"
                  variant="destructive"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isProcessing ? "Importando..." : "Restaurar Dados"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === "storage" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Informações de Armazenamento
                </CardTitle>
                <CardDescription>
                  Status do armazenamento local dos seus dados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Uso do Storage</span>
                    <Badge
                      variant={
                        getStoragePercentage() > 80
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {getStoragePercentage().toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getStoragePercentage() > 80
                          ? "bg-destructive"
                          : "bg-primary"
                      }`}
                      style={{
                        width: `${Math.min(getStoragePercentage(), 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatBytes(storageInfo.used)} usado</span>
                    <span>{formatBytes(storageInfo.total)} total</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium">Espaço Usado</div>
                    <div className="text-muted-foreground">
                      {formatBytes(storageInfo.used)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium">Espaço Disponível</div>
                    <div className="text-muted-foreground">
                      {formatBytes(storageInfo.available)}
                    </div>
                  </div>
                </div>

                {getStoragePercentage() > 80 && (
                  <Alert className="border-amber-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Armazenamento quase cheio. Considere fazer backup e limpar
                      dados antigos.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Backup automático ativo (a cada 10 minutos)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
