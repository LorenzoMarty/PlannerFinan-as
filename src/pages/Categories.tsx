import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tags, Plus, Edit2, Trash2 } from "lucide-react";

export default function Categories() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Categorias</h1>
            <p className="text-muted-foreground">
              Crie, edite e organize suas categorias de receitas e despesas
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>

        {/* Placeholder Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <Tags className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-semibold mb-2">
                Gerenciamento de Categorias
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Esta funcionalidade está sendo desenvolvida. Em breve você
                poderá:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Criar categorias personalizadas</li>
                <li>• Editar categorias existentes</li>
                <li>• Definir cores e ícones</li>
                <li>• Organizar por grupos</li>
              </ul>
            </CardContent>
          </Card>

          {/* Example categories */}
          {[
            { name: "Alimentação", color: "bg-red-500", count: 15 },
            { name: "Transporte", color: "bg-orange-500", count: 8 },
            { name: "Moradia", color: "bg-yellow-500", count: 12 },
            { name: "Lazer", color: "bg-green-500", count: 6 },
            { name: "Saúde", color: "bg-blue-500", count: 4 },
            { name: "Educação", color: "bg-purple-500", count: 3 },
          ].map((category, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${category.color}`} />
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.count} lançamentos nesta categoria
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
