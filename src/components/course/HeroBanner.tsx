import { Button } from "@/components/ui/button";
import { Play, Info, Star } from "lucide-react";
import { Course } from "@/types/course";

interface HeroBannerProps {
  course: Course;
  onPlay?: () => void;
  onInfo?: () => void;
}

export const HeroBanner = ({ course, onPlay, onInfo }: HeroBannerProps) => {
  return (
    <div className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        <div className="gradient-overlay-bottom" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-8 flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight">
            {course.title}
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
            {course.description}
          </p>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{course.instructor}</span>
            <span>•</span>
            <span>{course.duration}</span>
            {course.totalLessons && (
              <>
                <span>•</span>
                <span>{course.totalLessons} aulas</span>
              </>
            )}
            {!course.isPaid && (
              <>
                <span className="ml-1 px-2 py-0.5 bg-emerald-700 text-white text-xs font-semibold rounded">
                  Curso Gratuito
                </span>
                <div className="flex items-center gap-0.5 ml-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              onClick={onPlay}
            >
              <Play className="mr-2 h-5 w-5" fill="currentColor" />
              {course.progress ? "Continuar Assistindo" : "Assistir Agora"}
            </Button>
            
            <Button
              size="lg"
              variant="secondary"
              onClick={onInfo}
            >
              <Info className="mr-2 h-5 w-5" />
              Mais Informações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
