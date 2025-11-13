import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Module } from "@/types/courseEditor";

interface ModuleEditorProps {
  module: Module;
  moduleIndex: number;
  onUpdate: (updates: Partial<Module>) => void;
}

export function ModuleEditor({ module, moduleIndex, onUpdate }: ModuleEditorProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Módulo {moduleIndex + 1}
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure as informações do módulo
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="module-title">Título do Módulo</Label>
        <Input
          id="module-title"
          value={module.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: FERRAMENTAS BÁSICAS"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="module-description">Descrição do Módulo (Opcional)</Label>
        <Textarea
          id="module-description"
          value={module.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Um breve texto explicando o que será visto neste conjunto de aulas..."
          rows={4}
        />
      </div>
    </div>
  );
}
