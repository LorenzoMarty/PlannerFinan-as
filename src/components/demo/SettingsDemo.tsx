import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/contexts/SettingsContext";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { Settings, Palette, Type, Eye } from "lucide-react";

export default function SettingsDemo() {
  const { settings } = useSettings();

  const demoValues = {
    currency: 1234.56,
    date: new Date(),
    number: 9876.54,
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Demonstração das Configurações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Theme Demo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Palette className="w-4 h-4" />
              Tema Atual
            </div>
            <div className="space-y-1">
              <Badge variant="secondary">
                {settings.theme === "light"
                  ? "Claro"
                  : settings.theme === "dark"
                    ? "Escuro"
                    : "Sistema"}
              </Badge>
              <Badge variant="outline">Cor: {settings.primaryColor}</Badge>
              {settings.highContrast && (
                <Badge variant="outline">Alto Contraste</Badge>
              )}
            </div>
          </div>

          {/* Typography Demo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Type className="w-4 h-4" />
              Tipografia
            </div>
            <div className="space-y-1">
              <Badge variant="secondary">Fonte: {settings.font}</Badge>
              <Badge variant="outline">Tamanho: {settings.fontSize}px</Badge>
              <Badge variant="outline">Layout: {settings.layout}</Badge>
            </div>
          </div>

          {/* Accessibility Demo */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Eye className="w-4 h-4" />
              Acessibilidade
            </div>
            <div className="space-y-1">
              {settings.largeButtons && (
                <Badge variant="outline">Botões Grandes</Badge>
              )}
              {settings.reducedMotion && (
                <Badge variant="outline">Animações Reduzidas</Badge>
              )}
              {settings.keyboardNavigation && (
                <Badge variant="outline">Navegação por Teclado</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Format Examples */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium">Formatos Aplicados:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Moeda:</span>
              <p className="font-medium">
                {formatCurrency(demoValues.currency, settings)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Data:</span>
              <p className="font-medium">
                {formatDate(demoValues.date, settings)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Número:</span>
              <p className="font-medium">
                {formatNumber(demoValues.number, settings)}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            Os botões abaixo demonstram o tamanho configurado:
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm">Botão Pequeno</Button>
            <Button>Botão Normal</Button>
            <Button size="lg">Botão Grande</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
