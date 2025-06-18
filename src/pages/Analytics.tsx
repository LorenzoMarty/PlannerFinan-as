import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Calendar, Download } from "lucide-react";

export default function Analytics() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
            <p className="text-muted-foreground">
              Visualize gráficos detalhados e análises do seu histórico
              financeiro
            </p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <BarChart3 className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">Gráficos Avançados</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Em breve você terá acesso a:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Gráficos de barras mensais</li>
                <li>• Análise de tendências</li>
                <li>• Comparações entre períodos</li>
                <li>• Projeções futuras</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <TrendingUp className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">Análises Inteligentes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Recursos em desenvolvimento:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Insights automáticos</li>
                <li>• Alertas de gastos</li>
                <li>• Metas e objetivos</li>
                <li>• Relatórios personalizados</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">Histórico Detalhado</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Visualização temporal completa:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Timeline interativa</li>
                <li>• Filtros avançados</li>
                <li>• Comparações anuais</li>
                <li>• Sazonalidade</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Download className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">Exportações</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Formatos de exportação disponíveis:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Relatórios em PDF</li>
                <li>• Planilhas Excel/CSV</li>
                <li>• Gráficos em imagem</li>
                <li>• Dados JSON/XML</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
