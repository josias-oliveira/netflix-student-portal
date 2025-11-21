import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Upload, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CourseStructure } from "@/types/courseEditor";

interface CertificateEditorProps {
  course: CourseStructure;
  onUpdate: (updates: Partial<CourseStructure>) => void;
}

export const CertificateEditor = ({ course, onUpdate }: CertificateEditorProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const enabled = course.certificate_enabled || false;
  const textX = course.certificate_text_x || 50;
  const textY = course.certificate_text_y || 50;
  const fontSize = course.certificate_font_size || 48;
  const fontColor = course.certificate_font_color || "#000000";
  const templateUrl = course.certificate_template_url || "";

  useEffect(() => {
    if (templateUrl) {
      setPreviewImage(templateUrl);
    }
  }, [templateUrl]);

  useEffect(() => {
    drawPreview();
  }, [previewImage, textX, textY, fontSize, fontColor]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas || !previewImage) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Draw sample text
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      const x = (textX / 100) * canvas.width;
      const y = (textY / 100) * canvas.height;
      
      ctx.fillText("NOME DO ALUNO", x, y);
    };
    img.src = previewImage;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, envie uma imagem (JPG ou PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);

    try {
      // Upload to storage
      const fileName = `templates/${course.id}/background.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setPreviewImage(publicUrl);
      onUpdate({ certificate_template_url: publicUrl });

      toast.success("Imagem do certificado enviada com sucesso!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Erro ao enviar imagem: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Certificado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Certificate */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Emitir Certificado de Conclusão</Label>
              <p className="text-sm text-muted-foreground">
                Gerar certificado automaticamente quando o aluno completar o curso
              </p>
            </div>
            <Switch
              checked={enabled}
              onCheckedChange={(checked) => onUpdate({ certificate_enabled: checked })}
            />
          </div>

          {enabled && (
            <>
              {/* Template Upload */}
              <div className="space-y-2">
                <Label htmlFor="template-upload">Imagem de Fundo do Certificado</Label>
                <p className="text-sm text-muted-foreground">
                  Envie uma imagem JPG ou PNG (recomendado: 1920x1080px, máx: 5MB)
                </p>
                <div className="flex gap-2">
                  <Input
                    ref={fileInputRef}
                    id="template-upload"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Enviando..." : "Enviar Imagem"}
                  </Button>
                  {templateUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={drawPreview}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Atualizar Preview
                    </Button>
                  )}
                </div>
              </div>

              {/* Text Position X */}
              <div className="space-y-2">
                <Label>Posição Horizontal do Nome ({textX}%)</Label>
                <Slider
                  value={[textX]}
                  onValueChange={([value]) => onUpdate({ certificate_text_x: value })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Text Position Y */}
              <div className="space-y-2">
                <Label>Posição Vertical do Nome ({textY}%)</Label>
                <Slider
                  value={[textY]}
                  onValueChange={([value]) => onUpdate({ certificate_text_y: value })}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Font Size */}
              <div className="space-y-2">
                <Label>Tamanho da Fonte ({fontSize}px)</Label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]) => onUpdate({ certificate_font_size: value })}
                  min={20}
                  max={72}
                  step={2}
                />
              </div>

              {/* Font Color */}
              <div className="space-y-2">
                <Label htmlFor="font-color">Cor do Texto</Label>
                <div className="flex gap-2">
                  <Input
                    id="font-color"
                    type="color"
                    value={fontColor}
                    onChange={(e) => onUpdate({ certificate_font_color: e.target.value })}
                    className="w-20 h-10"
                  />
                  <Input
                    value={fontColor}
                    onChange={(e) => onUpdate({ certificate_font_color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Preview */}
              {previewImage && (
                <div className="space-y-2">
                  <Label>Preview do Certificado</Label>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    <canvas
                      ref={canvasRef}
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    💡 Preview de posicionamento: O texto "NOME DO ALUNO" mostra onde o nome será posicionado. 
                    Ao gerar o certificado, o nome completo do aluno será inserido automaticamente a partir do perfil dele.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
