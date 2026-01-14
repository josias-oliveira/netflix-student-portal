import { useState, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CourseInfoEditorProps {
  courseTitle: string;
  courseDescription?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  featured?: boolean;
  isPaid?: boolean;
  price?: number;
  onTitleUpdate: (title: string) => void;
  onDescriptionUpdate: (description: string) => void;
  onThumbnailUpdate: (url: string) => void;
  onCoverImageUpdate: (url: string) => void;
  onFeaturedUpdate: (featured: boolean) => void;
  onIsPaidUpdate: (isPaid: boolean) => void;
  onPriceUpdate: (price: number) => void;
}

export function CourseInfoEditor({
  courseTitle,
  courseDescription,
  thumbnailUrl,
  coverImageUrl,
  featured,
  isPaid,
  price,
  onTitleUpdate,
  onDescriptionUpdate,
  onThumbnailUpdate,
  onCoverImageUpdate,
  onFeaturedUpdate,
  onIsPaidUpdate,
  onPriceUpdate,
}: CourseInfoEditorProps) {
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'thumbnail' | 'cover'
  ) => {
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

    if (type === 'thumbnail') {
      setUploadingThumbnail(true);
    } else {
      setUploadingCover(true);
    }

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${type}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = fileName;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('course-thumbnails')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-thumbnails')
        .getPublicUrl(filePath);

      if (type === 'thumbnail') {
        onThumbnailUpdate(publicUrl);
        toast({
          title: "Thumbnail enviado",
          description: "A miniatura do curso foi atualizada com sucesso",
        });
      } else {
        onCoverImageUpdate(publicUrl);
        toast({
          title: "Capa enviada",
          description: "A imagem de capa do curso foi atualizada com sucesso",
        });
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro ao enviar imagem",
        description: error.message || "Não foi possível fazer upload da imagem",
        variant: "destructive",
      });
    } finally {
      if (type === 'thumbnail') {
        setUploadingThumbnail(false);
        if (thumbnailInputRef.current) {
          thumbnailInputRef.current.value = '';
        }
      } else {
        setUploadingCover(false);
        if (coverInputRef.current) {
          coverInputRef.current.value = '';
        }
      }
    }
  };

  const handleRemoveImage = (type: 'thumbnail' | 'cover') => {
    if (type === 'thumbnail') {
      onThumbnailUpdate('');
      toast({
        title: "Thumbnail removido",
        description: "A miniatura do curso foi removida",
      });
    } else {
      onCoverImageUpdate('');
      toast({
        title: "Capa removida",
        description: "A imagem de capa do curso foi removida",
      });
    }
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

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label>Curso em Destaque</Label>
            <p className="text-sm text-muted-foreground">
              Marque se este curso deve aparecer como destaque
            </p>
          </div>
          <Switch
            checked={featured || false}
            onCheckedChange={onFeaturedUpdate}
          />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-0.5">
            <Label>Curso Pago</Label>
            <p className="text-sm text-muted-foreground">
              Marque se este curso requer pagamento para acesso
            </p>
          </div>
          <Switch
            checked={isPaid || false}
            onCheckedChange={onIsPaidUpdate}
          />
        </div>

        {isPaid && (
          <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
            <Label htmlFor="course-price">
              Preço do Curso *
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Defina o valor em Reais (R$) que será cobrado pelo acesso ao curso
            </p>
            <Input
              id="course-price"
              type="number"
              min="0"
              step="0.01"
              value={price || ''}
              onChange={(e) => onPriceUpdate(parseFloat(e.target.value) || 0)}
              placeholder="Ex: 197.00"
              required
            />
            {(!price || price <= 0) && (
              <p className="text-sm text-destructive">
                ⚠️ Você deve definir um preço maior que zero para cursos pagos
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label>Imagem de Capa (Banner Grande)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Recomendado: 1920x1080px (16:9) - Usada em páginas de detalhes
          </p>
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            {coverImageUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                  <img
                    src={coverImageUrl}
                    alt="Capa do curso"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Capa
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImage('cover')}
                    disabled={uploadingCover}
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
                  Nenhuma imagem de capa selecionada
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingCover ? "Enviando..." : "Selecionar Capa"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou WEBP (máx. 5MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'cover')}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <Label>Thumbnail (Miniatura para Cards)</Label>
          <p className="text-xs text-muted-foreground mb-2">
            Recomendado: 400x225px (16:9) - Usada em listagens e cards
          </p>
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            {thumbnailUrl ? (
              <div className="space-y-4">
                <div className="relative aspect-video w-full max-w-sm mx-auto rounded-lg overflow-hidden">
                  <img
                    src={thumbnailUrl}
                    alt="Thumbnail do curso"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={uploadingThumbnail}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Alterar Thumbnail
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveImage('thumbnail')}
                    disabled={uploadingThumbnail}
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
                  Nenhum thumbnail selecionado
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => thumbnailInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploadingThumbnail ? "Enviando..." : "Selecionar Thumbnail"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  PNG, JPG ou WEBP (máx. 5MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'thumbnail')}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
