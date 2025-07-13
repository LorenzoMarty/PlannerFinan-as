import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const colorOptions = [
  { name: "Vermelho", value: "#ef4444", class: "bg-red-500" },
  { name: "Laranja", value: "#f97316", class: "bg-orange-500" },
  { name: "Amarelo", value: "#eab308", class: "bg-yellow-500" },
  { name: "Verde", value: "#22c55e", class: "bg-green-500" },
  { name: "Azul", value: "#3b82f6", class: "bg-blue-500" },
  { name: "Roxo", value: "#8b5cf6", class: "bg-purple-500" },
  { name: "Rosa", value: "#ec4899", class: "bg-pink-500" },
  { name: "Cinza", value: "#6b7280", class: "bg-gray-500" },
];

export const CategoryForm = ({
  isDialogOpen,
  setIsDialogOpen,
  editingCategory,
  formData,
  setFormData,
  handleSubmit,
  resetForm,
}) => (
  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
    <DialogTrigger asChild>
      <Button onClick={() => setEditingCategory(null)}>
        <Plus className="w-4 h-4 mr-2" />
        Nova Categoria
      </Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {editingCategory ? "Editar" : "Nova"} Categoria
        </DialogTitle>
        <DialogDescription>
          {editingCategory
            ? "Edite as informações da categoria"
            : "Crie uma nova categoria para organizar seus lançamentos"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Ex: Alimentação"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="icon">Emoji/Ícone</Label>
          <Input
            id="icon"
            placeholder="📊"
            value={formData.icon}
            onChange={(e) =>
              setFormData({ ...formData, icon: e.target.value })
            }
            maxLength={2}
          />
        </div>

        <div className="space-y-2">
          <Label>Cor</Label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                className={cn(
                  "w-8 h-8 rounded-full border-2 transition-all",
                  formData.color === color.value
                    ? "border-primary scale-110"
                    : "border-muted hover:scale-105",
                  color.class,
                )}
                onClick={() =>
                  setFormData({ ...formData, color: color.value })
                }
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Input
            id="description"
            placeholder="Descreva esta categoria..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {editingCategory ? "Salvar" : "Criar"}
          </Button>
          <Button type="button" variant="outline" onClick={resetForm}>
            Cancelar
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);
