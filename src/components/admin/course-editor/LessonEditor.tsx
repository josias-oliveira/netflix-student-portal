import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, X, Clock, AlertCircle, Loader2 } from "lucide-react";
import { VideoUpload } from "./VideoUpload";
import { Lesson, Material } from "@/types/courseEditor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);

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

  const fetchVideoDuration = async (url: string) => {
    if (!url || !url.includes('.m3u8')) return;

    setIsLoadingDuration(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-video-duration', {
        body: { url },
      });

      if (error) {
        console.error('Error fetching duration:', error);
        toast({
          title: "Não foi possível obter a duração",
          description: "Preencha manualmente a duração do vídeo",
          variant: "destructive",
        });
        return;
      }

      if (data?.success && data?.durationMinutes) {
        onUpdate({ duration: data.durationMinutes });
        toast({
          title: "Duração detectada",
          description: `Duração do vídeo: ${data.durationMinutes} minutos`,
        });
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoadingDuration(false);
    }
  };

  const handleStreamingUrlChange = async (url: string) => {
    console.log('handleStreamingUrlChange called with URL:', url);
    
    onUpdate({
      streamingUrl: url,
      videoUrl: undefined,
      videoFileName: undefined,
      uploadProgress: undefined,
    });

    // Auto-fetch duration when URL is added
    if (url && url.includes('.m3u8')) {
      await fetchVideoDuration(url);
    }
  };

  const handleVideoRemove = () => {
    onUpdate({
      videoUrl: undefined,
      videoFileName: undefined,
      streamingUrl: undefined,
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
          streamingUrl={lesson.streamingUrl}
          uploadProgress={lesson.uploadProgress}
          onVideoSelect={handleVideoSelect}
          onStreamingUrlChange={handleStreamingUrlChange}
          onVideoRemove={handleVideoRemove}
        />
      </div>

      {/* Duration - MANDATORY FIELD */}
      <div className="space-y-2 p-4 rounded-lg border-2 border-warning/50 bg-warning/5">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-warning" />
          <Label htmlFor="lesson-duration" className="text-base font-semibold">
            Duração do Vídeo (minutos)
          </Label>
          {isLoadingDuration && (
            <Badge variant="secondary" className="ml-auto">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Detectando...
            </Badge>
          )}
          {!isLoadingDuration && (!lesson.duration || lesson.duration === 0) && (
            <Badge variant="destructive" className="ml-auto">
              <AlertCircle className="h-3 w-3 mr-1" />
              Obrigatório
            </Badge>
          )}
          {!isLoadingDuration && lesson.duration && lesson.duration > 0 && (
            <Badge variant="default" className="ml-auto bg-green-600">
              ✓ {lesson.duration} min
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            id="lesson-duration"
            type="number"
            min="0"
            value={lesson.duration || 0}
            onChange={(e) => onUpdate({ duration: parseInt(e.target.value) || 0 })}
            placeholder="Ex: 15"
            className={(!lesson.duration || lesson.duration === 0) ? "border-destructive" : ""}
            disabled={isLoadingDuration}
          />
          {lesson.streamingUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchVideoDuration(lesson.streamingUrl!)}
              disabled={isLoadingDuration}
            >
              {isLoadingDuration ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Detectar"
              )}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          A duração é detectada automaticamente ao adicionar a URL do vídeo
        </p>
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
