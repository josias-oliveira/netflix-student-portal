import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseInfoEditorProps {
  courseTitle: string;
  courseDescription?: string;
  thumbnailUrl?: string;
  onTitleUpdate: (title: string) => void;
  onDescriptionUpdate: (description: string) => void;
  onThumbnailUpdate: (url: string) => void;
}

export function CourseInfoEditor({
  courseTitle,
  courseDescription,
  thumbnailUrl,
  onTitleUpdate,
  onDescriptionUpdate,
  onThumbnailUpdate,
}: CourseInfoEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(filePath);

      onThumbnailUpdate(publicUrl);

      toast({
        title: "Imagem enviada",
        description: "A capa do curso foi atualizada com sucesso",
      });
    } catch (error: any) {
      console.error('Error uploading thumbnail:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: error.message || "Não foi possível fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveThumbnail = () => {
    onThumbnailUpdate('');
    toast({
      title: "Imagem removida",
      description: "A capa do curso foi removida",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Informações do Curso</h2>
        <p className="text-sm text-muted-foreground">
          Configure as informações gerais do seu curso
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="course-title">Título do Curso *</Label>
          <Input
            id="course-title"
            value={courseTitle}
            onChange={(e) => onTitleUpdate(e.target.value)}
            placeholder="Ex: Workshop de Apresentações"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="course-description">Descrição</Label>
          <Textarea
            id="course-description"
            value={courseDescription || ''}
            onChange={(e) => onDescriptionUpdate(e.target.value)}
            placeholder="Descreva o que os alunos aprenderão neste curso..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Imagem de Capa do Curso</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            {thumbnailUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full max-w-md mx-auto rounded-lg overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt="Capa do curso"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Imagem
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveThumbnail}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remover
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Nenhuma imagem selecionada
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Enviando..." : "Selecionar Imagem"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou WEBP (máx. 5MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
