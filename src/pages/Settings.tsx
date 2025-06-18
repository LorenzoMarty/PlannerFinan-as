import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Settings as SettingsIcon,
  Palette,
  Shield,
  Bell,
  Globe,
  Moon,
  Sun,
} from "lucide-react";

export default function Settings() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no PlannerFin
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Aparência e Personalização
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tema Escuro</Label>
                  <p className="text-sm text-muted-foreground">
                    Alterar entre tema claro e escuro
                  </p>
                </div>
                <Switch />
              </div>

              <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg p-6 text-center">
                <h4 className="font-semibold mb-2">Personalização Completa</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Em breve você poderá personalizar:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Cores da interface</li>
                  <li>• Fontes e tamanhos</li>
                  <li>• Layout dos componentes</li>
                  <li>• Estilo dos gráficos</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber resumos mensais por email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Colaboração</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar sobre atividades de colaboradores
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Lembretes</Label>
                  <p className="text-sm text-muted-foreground">
                    Lembrar de adicionar lançamentos
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacidade e Segurança
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    Verificação em duas etapas
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Aumentar a segurança da sua conta
                  </p>
                </div>
                <Switch />
              </div>

              <Button variant="outline" className="w-full">
                Alterar Senha
              </Button>

              <Button variant="outline" className="w-full">
                Gerenciar Dados
              </Button>
            </CardContent>
          </Card>

          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Configurações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Idioma</Label>
                  <p className="text-sm text-muted-foreground">
                    Português (Brasil)
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Moeda</Label>
                  <p className="text-sm text-muted-foreground">Real (BRL)</p>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Fuso Horário</Label>
                  <p className="text-sm text-muted-foreground">
                    América/São_Paulo
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accessibility Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Acessibilidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg p-6 text-center">
              <h4 className="font-semibold mb-2">Recursos de Acessibilidade</h4>
              <p className="text-sm text-muted-foreground mb-4">
                O PlannerFin foi desenvolvido com acessibilidade em mente.
                Recursos disponíveis:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li>• Navegação via teclado</li>
                  <li>• Suporte a leitores de tela</li>
                  <li>• Alto contraste</li>
                </ul>
                <ul className="space-y-1">
                  <li>• Ajuste de tamanho de fonte</li>
                  <li>• Descrições alternativas</li>
                  <li>• Foco visual aprimorado</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
