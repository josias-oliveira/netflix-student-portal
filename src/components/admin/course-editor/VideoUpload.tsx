import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Video, Link2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface VideoUploadProps {
  videoUrl?: string;
  videoFileName?: string;
  streamingUrl?: string;
  uploadProgress?: number;
  onVideoSelect: (file: File) => void;
  onStreamingUrlChange: (url: string) => void;
  onVideoRemove: () => void;
}

export function VideoUpload({
  videoUrl,
  videoFileName,
  streamingUrl,
  uploadProgress,
  onVideoSelect,
  onStreamingUrlChange,
  onVideoRemove,
}: VideoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState(streamingUrl || "");

  // Sync local state with props
  useEffect(() => {
    setUrlInput(streamingUrl || "");
  }, [streamingUrl]);

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

  if (videoUrl || streamingUrl || uploadProgress !== undefined) {
    return (
      <div className="space-y-3">
        <div className="border border-border rounded-lg p-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {streamingUrl ? (
                <Link2 className="h-8 w-8 text-primary" />
              ) : (
                <Video className="h-8 w-8 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {streamingUrl ? (
                  <>URL de Streaming: {streamingUrl}</>
                ) : (
                  videoFileName || "video.mp4"
                )}
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
              {streamingUrl && (
                <p className="text-xs text-muted-foreground mt-1">
                  Formato: HLS (m3u8)
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
    <Tabs defaultValue="upload" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload">
          <Upload className="h-4 w-4 mr-2" />
          Upload de Arquivo
        </TabsTrigger>
        <TabsTrigger value="streaming">
          <Link2 className="h-4 w-4 mr-2" />
          URL de Streaming
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="upload" className="mt-4">
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
      </TabsContent>
      
      <TabsContent value="streaming" className="mt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="streaming-url">URL do Vídeo (HLS/m3u8)</Label>
            <Input
              id="streaming-url"
              type="url"
              placeholder="https://exemplo.com/video/playlist.m3u8"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Cole a URL do streaming em formato HLS (.m3u8)
            </p>
          </div>
          
          <Button
            onClick={() => {
              if (urlInput.trim()) {
                onStreamingUrlChange(urlInput.trim());
              }
            }}
            disabled={!urlInput.trim()}
          >
            <Link2 className="h-4 w-4 mr-2" />
            Adicionar URL de Streaming
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}
