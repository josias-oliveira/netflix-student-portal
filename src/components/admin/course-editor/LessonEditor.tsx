import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, X } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { Lesson, Material } from "@/types/courseEditor";

interface LessonEditorProps {
  lesson: Lesson;
  moduleIndex: number;
  lessonIndex: number;
  onUpdate: (updates: Partial<Lesson>) => void;
  onMaterialAdd: () => void;
  onMaterialRemove: (materialId: string) => void;
}

export function LessonEditor({
  lesson,
  moduleIndex,
  lessonIndex,
  onUpdate,
  onMaterialAdd,
  onMaterialRemove,
}: LessonEditorProps) {
  const handleVideoSelect = (file: File) => {
    // Simulate upload
    onUpdate({
      videoFileName: file.name,
      uploadProgress: 0,
    });

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        onUpdate({
          videoUrl: URL.createObjectURL(file),
          uploadProgress: 100,
        });
      } else {
        onUpdate({ uploadProgress: progress });
      }
    }, 500);
  };

  const handleVideoRemove = () => {
    onUpdate({
      videoUrl: undefined,
      videoFileName: undefined,
      uploadProgress: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">
          Aula {moduleIndex + 1}.{lessonIndex + 1}
        </h2>
        <p className="text-sm text-muted-foreground">
          Edite o conteúdo da aula
        </p>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="lesson-title">Título da Aula</Label>
        <Input
          id="lesson-title"
          value={lesson.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Ex: Conhecendo a Interface"
        />
      </div>

      {/* Video Upload */}
      <div className="space-y-2">
        <Label>Vídeo da Aula</Label>
        <VideoUpload
          videoUrl={lesson.videoUrl}
          videoFileName={lesson.videoFileName}
          uploadProgress={lesson.uploadProgress}
          onVideoSelect={handleVideoSelect}
          onVideoRemove={handleVideoRemove}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="lesson-description">Descrição da Aula</Label>
        <Textarea
          id="lesson-description"
          value={lesson.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Escreva um resumo da aula, instruções ou links importantes..."
          rows={6}
        />
        <p className="text-xs text-muted-foreground">
          Esta descrição aparecerá abaixo do vídeo para o aluno
        </p>
      </div>

      {/* Support Materials */}
      <div className="space-y-3">
        <Label>Materiais de Apoio</Label>
        
        {lesson.materials.length > 0 && (
          <div className="space-y-2">
            {lesson.materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-3 p-3 border border-border rounded-md bg-muted/20"
              >
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{material.name}</p>
                  <p className="text-xs text-muted-foreground">{material.size}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0"
                  onClick={() => onMaterialRemove(material.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="outline"
          onClick={onMaterialAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Arquivo
        </Button>
        <p className="text-xs text-muted-foreground">
          PDFs, planilhas, arquivos .zip que o aluno poderá baixar
        </p>
      </div>
    </div>
  );
}
