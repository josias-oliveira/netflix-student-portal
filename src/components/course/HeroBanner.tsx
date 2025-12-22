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
    <div className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] w-full overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 sm:via-background/70 to-transparent" />
        <div className="gradient-overlay-bottom" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 sm:px-8 flex items-center pt-16 sm:pt-0">
        <div className="max-w-2xl space-y-3 sm:space-y-4 md:space-y-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            {course.title}
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl line-clamp-2 sm:line-clamp-none">
            {course.description}
          </p>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{course.instructor}</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{course.duration}</span>
            {course.totalLessons && (
              <>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">{course.totalLessons} aulas</span>
              </>
            )}
            {!course.isPaid && (
              <>
                <span className="px-2 py-0.5 bg-emerald-700 text-white text-xs font-semibold rounded">
                  Curso Gratuito
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={onPlay}
            >
              <Play className="mr-2 h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" />
              {course.progress ? "Continuar Assistindo" : "Assistir Agora"}
            </Button>
            
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto text-sm sm:text-base"
              onClick={onInfo}
            >
              <Info className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Mais Informações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
