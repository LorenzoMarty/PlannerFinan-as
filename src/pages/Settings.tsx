import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { useSettings } from "@/contexts/SettingsContext";
import SettingsDemo from "@/components/demo/SettingsDemo";
import ChangePasswordDialog from "@/components/security/ChangePasswordDialog";
import ProfileManagementDialog from "@/components/security/ProfileManagementDialog";
import { DataBackupDialog } from "@/components/security/DataBackupDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Palette,
  Shield,
  Bell,
  Globe,
  Moon,
  Sun,
  Monitor,
  Type,
  Layout,
  Zap,
  Download,
  Upload,
  User,
  Key,
  Database,
  Accessibility,
  Volume2,
  Eye,
  Clock,
  Cloud,
  HardDrive,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const themeColors = [
  { name: "Azul", value: "blue", class: "bg-blue-500" },
  { name: "Verde", value: "green", class: "bg-green-500" },
  { name: "Roxo", value: "purple", class: "bg-purple-500" },
  { name: "Rosa", value: "pink", class: "bg-pink-500" },
  { name: "Laranja", value: "orange", class: "bg-orange-500" },
  { name: "Vermelho", value: "red", class: "bg-red-500" },
];

const fontOptions = [
  { name: "Inter (Padrão)", value: "inter" },
  { name: "Roboto", value: "roboto" },
  { name: "Open Sans", value: "opensans" },
  { name: "Lato", value: "lato" },
  { name: "Poppins", value: "poppins" },
];

const layoutOptions = [
  { name: "Compacto", value: "compact" },
  { name: "Padrão", value: "default" },
  { name: "Espaçoso", value: "spacious" },
];

export default function Settings() {
  const {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
  } = useSettings();

  const handleSettingChange = (key: string, value: any) => {
    updateSetting(key as any, value);
    toast.success("Configuração atualizada!");
  };

  const handleExportSettings = () => {
    const dataStr = exportSettings();
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plannerfin-settings.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Configurações exportadas!");
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result as string;
          if (importSettings(result)) {
            toast.success("Configurações importadas com sucesso!");
          } else {
            toast.error("Erro ao importar configurações");
          }
        } catch (error) {
          toast.error("Erro ao importar configurações");
        }
      };
      reader.readAsText(file);
    }
  };

  const resetToDefaults = () => {
    resetSettings();
    toast.success("Configurações restauradas para o padrão!");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Personalize sua experiência no PlannerFin
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportSettings}>
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById("import-file")?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleImportSettings}
              className="hidden"
            />
            <Button variant="destructive" onClick={resetToDefaults}>
              Restaurar Padrão
            </Button>
          </div>
        </div>

        {/* Settings Demo */}
        <SettingsDemo />

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="privacy">Privacidade</TabsTrigger>
            <TabsTrigger value="accessibility">Acessibilidade</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
          </TabsList>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Theme */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Tema e Cores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Modo de Exibição</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: "light", icon: Sun, label: "Claro" },
                        { value: "dark", icon: Moon, label: "Escuro" },
                        { value: "system", icon: Monitor, label: "Sistema" },
                      ].map((mode) => (
                        <Button
                          key={mode.value}
                          variant={
                            settings.theme === mode.value
                              ? "default"
                              : "outline"
                          }
                          className="h-auto p-3 flex flex-col gap-2"
                          onClick={() =>
                            handleSettingChange("theme", mode.value)
                          }
                        >
                          <mode.icon className="w-4 h-4" />
                          <span className="text-xs">{mode.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Cor Primária</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {themeColors.map((color) => (
                        <Button
                          key={color.value}
                          variant="outline"
                          className={cn(
                            "h-12 relative overflow-hidden",
                            settings.primaryColor === color.value &&
                              "ring-2 ring-primary",
                          )}
                          onClick={() =>
                            handleSettingChange("primaryColor", color.value)
                          }
                        >
                          <div
                            className={cn("absolute inset-0", color.class)}
                          />
                          <span className="relative z-10 text-white font-medium text-xs">
                            {color.name}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Alto Contraste</Label>
                      <Switch
                        checked={settings.highContrast}
                        onCheckedChange={(checked) =>
                          handleSettingChange("highContrast", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Aumenta o contraste para melhor visibilidade
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Typography */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5" />
                    Tipografia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Fonte</Label>
                    <Select
                      value={settings.font}
                      onValueChange={(value) =>
                        handleSettingChange("font", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontOptions.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Tamanho da Fonte: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={(value) =>
                        handleSettingChange("fontSize", value[0])
                      }
                      max={24}
                      min={12}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Pequeno</span>
                      <span>Grande</span>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <p style={{ fontSize: `${settings.fontSize}px` }}>
                      Exemplo de texto com o tamanho selecionado. O PlannerFin
                      facilita o controle das suas finanças.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Layout */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5" />
                    Layout e Espaçamento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Densidade do Layout</Label>
                    <div className="grid grid-cols-1 gap-3">
                      {layoutOptions.map((layout) => (
                        <Button
                          key={layout.value}
                          variant={
                            settings.layout === layout.value
                              ? "default"
                              : "outline"
                          }
                          className="justify-start"
                          onClick={() =>
                            handleSettingChange("layout", layout.value)
                          }
                        >
                          {layout.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Reduzir Animações</Label>
                      <Switch
                        checked={settings.reducedMotion}
                        onCheckedChange={(checked) =>
                          handleSettingChange("reducedMotion", checked)
                        }
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Diminui animações para melhor performance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notificações por Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      key: "emailNotifications",
                      title: "Resumos Mensais",
                      description: "Receber relatórios financeiros por email",
                    },
                    {
                      key: "collaborationNotifications",
                      title: "Colaboração",
                      description: "Atividades de colaboradores em planilhas",
                    },
                    {
                      key: "reminderNotifications",
                      title: "Lembretes",
                      description: "Lembrar de adicionar lançamentos",
                    },
                    {
                      key: "marketingEmails",
                      title: "Novidades e Dicas",
                      description: "Receber dicas financeiras e atualizações",
                    },
                  ].map((notification) => (
                    <div
                      key={notification.key}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <Label className="text-base">
                          {notification.title}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {notification.description}
                        </p>
                      </div>
                      <Switch
                        checked={
                          settings[
                            notification.key as keyof typeof settings
                          ] as boolean
                        }
                        onCheckedChange={(checked) =>
                          handleSettingChange(notification.key, checked)
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Notificações Push
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Notificações Push</Label>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações no navegador
                      </p>
                    </div>
                    <Switch
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleSettingChange("pushNotifications", checked)
                      }
                    />
                  </div>

                  {settings.pushNotifications && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-sm">
                        <strong>Dica:</strong> As notificações push funcionam
                        mesmo quando o PlannerFin não está aberto no navegador.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Privacy & Security */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Segurança da Conta
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Autenticação de Dois Fatores
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Adiciona uma camada extra de segurança
                      </p>
                    </div>
                    <Switch
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        handleSettingChange("twoFactorAuth", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>
                      Timeout da Sessão: {settings.sessionTimeout} minutos
                    </Label>
                    <Slider
                      value={[settings.sessionTimeout]}
                      onValueChange={(value) =>
                        handleSettingChange("sessionTimeout", value[0])
                      }
                      max={120}
                      min={15}
                      step={15}
                      className="w-full"
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <ChangePasswordDialog
                      trigger={
                        <Button variant="outline" className="w-full">
                          <Key className="w-4 h-4 mr-2" />
                          Alterar Senha
                        </Button>
                      }
                    />
                    <ProfileManagementDialog
                      trigger={
                        <Button variant="outline" className="w-full">
                          <User className="w-4 h-4 mr-2" />
                          Gerenciar Perfil
                        </Button>
                      }
                    />
                    <DataBackupDialog>
                      <Button variant="outline" className="w-full">
                        <Database className="w-4 h-4 mr-2" />
                        Backup de Dados
                      </Button>
                    </DataBackupDialog>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Privacidade de Dados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">
                        Compartilhamento de Dados
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir análises anônimas para melhorias
                      </p>
                    </div>
                    <Switch
                      checked={settings.dataSharing}
                      onCheckedChange={(checked) =>
                        handleSettingChange("dataSharing", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Ajudar a melhorar o PlannerFin
                      </p>
                    </div>
                    <Switch
                      checked={settings.analyticsTracking}
                      onCheckedChange={(checked) =>
                        handleSettingChange("analyticsTracking", checked)
                      }
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Button variant="destructive" className="w-full">
                      Baixar Meus Dados
                    </Button>
                    <Button variant="destructive" className="w-full">
                      Excluir Conta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Accessibility */}
          <TabsContent value="accessibility" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Accessibility className="w-5 h-5" />
                  Recursos de Acessibilidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">
                          Suporte a Leitor de Tela
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Otimizações para leitores de tela
                        </p>
                      </div>
                      <Switch
                        checked={settings.screenReader}
                        onCheckedChange={(checked) =>
                          handleSettingChange("screenReader", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">
                          Navegação por Teclado
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Melhor suporte para navegação via teclado
                        </p>
                      </div>
                      <Switch
                        checked={settings.keyboardNavigation}
                        onCheckedChange={(checked) =>
                          handleSettingChange("keyboardNavigation", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Anúncios por Voz</Label>
                        <p className="text-sm text-muted-foreground">
                          Anunciar ações importantes por voz
                        </p>
                      </div>
                      <Switch
                        checked={settings.voiceAnnouncements}
                        onCheckedChange={(checked) =>
                          handleSettingChange("voiceAnnouncements", checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Botões Grandes</Label>
                        <p className="text-sm text-muted-foreground">
                          Aumentar tamanho de botões e elementos interativos
                        </p>
                      </div>
                      <Switch
                        checked={settings.largeButtons}
                        onCheckedChange={(checked) =>
                          handleSettingChange("largeButtons", checked)
                        }
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Recursos Disponíveis
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Descrições alternativas em imagens</li>
                      <li>• Estrutura semântica completa</li>
                      <li>• Suporte a atalhos de teclado</li>
                      <li>• Indicadores de foco visíveis</li>
                      <li>• Contraste adequado em todos os elementos</li>
                      <li>• Texto escalável sem perda de funcionalidade</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Localização e Formato
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={settings.language}
                      onValueChange={(value) =>
                        handleSettingChange("language", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">
                          Português (Brasil)
                        </SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Moeda</Label>
                    <Select
                      value={settings.currency}
                      onValueChange={(value) =>
                        handleSettingChange("currency", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">Real (R$)</SelectItem>
                        <SelectItem value="USD">Dólar ($)</SelectItem>
                        <SelectItem value="EUR">Euro (€)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato de Data</Label>
                    <Select
                      value={settings.dateFormat}
                      onValueChange={(value) =>
                        handleSettingChange("dateFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/AAAA</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/AAAA</SelectItem>
                        <SelectItem value="YYYY-MM-DD">AAAA-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato de Números</Label>
                    <Select
                      value={settings.numberFormat}
                      onValueChange={(value) =>
                        handleSettingChange("numberFormat", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1.234,56">1.234,56</SelectItem>
                        <SelectItem value="1,234.56">1,234.56</SelectItem>
                        <SelectItem value="1 234,56">1 234,56</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Select
                      value={settings.timezone}
                      onValueChange={(value) =>
                        handleSettingChange("timezone", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">
                          São Paulo (GMT-3)
                        </SelectItem>
                        <SelectItem value="America/New_York">
                          Nova York (GMT-5)
                        </SelectItem>
                        <SelectItem value="Europe/London">
                          Londres (GMT+0)
                        </SelectItem>
                        <SelectItem value="Asia/Tokyo">
                          Tóquio (GMT+9)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview das Configurações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Data de Hoje
                          </Label>
                          <p className="font-medium">
                            {(() => {
                              const today = new Date();
                              if (settings.dateFormat === "DD/MM/YYYY") {
                                return today.toLocaleDateString("pt-BR");
                              } else if (settings.dateFormat === "MM/DD/YYYY") {
                                return today.toLocaleDateString("en-US");
                              } else {
                                return today.toISOString().split("T")[0];
                              }
                            })()}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Valor de Exemplo
                          </Label>
                          <p className="font-medium">
                            {(() => {
                              const value = 1234.56;
                              let formatted = "";

                              if (settings.numberFormat === "1.234,56") {
                                formatted = value.toLocaleString("pt-BR");
                              } else if (settings.numberFormat === "1,234.56") {
                                formatted = value.toLocaleString("en-US");
                              } else {
                                formatted = value.toLocaleString("fr-FR");
                              }

                              const currency =
                                settings.currency === "BRL"
                                  ? "R$ "
                                  : settings.currency === "USD"
                                    ? "$ "
                                    : "€ ";

                              return currency + formatted;
                            })()}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground flex items-center gap-1">
                            <Palette className="w-3 h-3" />
                            Tema Atual
                          </Label>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              {settings.theme === "light"
                                ? "Claro"
                                : settings.theme === "dark"
                                  ? "Escuro"
                                  : "Sistema"}
                            </Badge>
                            <Badge variant="outline" className="capitalize">
                              {settings.primaryColor}
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm text-muted-foreground flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            Idioma/Região
                          </Label>
                          <p className="font-medium">
                            {settings.language === "pt-BR" &&
                              "Português (Brasil)"}
                            {settings.language === "en-US" && "English (US)"}
                            {settings.language === "es-ES" && "Español"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t">
                        <Label className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Horário Local
                        </Label>
                        <p className="font-medium">
                          {new Date().toLocaleString("pt-BR", {
                            timeZone: settings.timezone,
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <SettingsIcon className="w-5 h-5" />
                      Configurações Avançadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-base">Backup Automático</Label>
                          <p className="text-sm text-muted-foreground">
                            Fazer backup dos dados automaticamente
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={true}
                        onCheckedChange={() =>
                          toast.success("Backup automático configurado!")
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Cloud className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-base">
                            Sincronização em Nuvem
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Sincronizar dados entre dispositivos
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={false}
                        onCheckedChange={() =>
                          toast.info("Funcionalidade em desenvolvimento")
                        }
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <Label className="text-base">
                            Compactação de Dados
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Reduzir espaço de armazenamento
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={true}
                        onCheckedChange={() =>
                          toast.success("Compactação ativada!")
                        }
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleExportSettings}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Todas as Configurações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
