import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface VideoUploadProps {
  videoUrl?: string;
  videoFileName?: string;
  uploadProgress?: number;
  onVideoSelect: (file: File) => void;
  onVideoRemove: () => void;
}

export function VideoUpload({
  videoUrl,
  videoFileName,
  uploadProgress,
  onVideoSelect,
  onVideoRemove,
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      onVideoSelect(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onVideoSelect(files[0]);
    }
  };

  if (videoUrl || uploadProgress !== undefined) {
    return (
      <div className="space-y-3">
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {videoFileName || "video.mp4"}
              </p>
              {uploadProgress !== undefined && uploadProgress < 100 && (
                <div className="mt-2 space-y-1">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Enviando... {uploadProgress}%
                  </p>
                </div>
              )}
              {uploadProgress === 100 && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Upload concluído
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onVideoRemove}
              disabled={uploadProgress !== undefined && uploadProgress < 100}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileSelect}
      />
      
      <div className="space-y-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        
        <div>
          <p className="text-sm font-medium text-foreground">
            Arraste o vídeo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            MP4, MOV ou outros formatos de vídeo
          </p>
        </div>
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          Selecionar Arquivo de Vídeo
        </Button>
      </div>
    </div>
  );
}
