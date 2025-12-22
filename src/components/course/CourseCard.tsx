import { Course } from "@/types/course";
import { Play, Clock, Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
}

export const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <div
      className="group relative flex-shrink-0 w-[200px] sm:w-[280px] md:w-[320px] cursor-pointer course-card-hover"
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-md overflow-hidden bg-card">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Progress bar overlay */}
        {course.progress !== undefined && course.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-progress-bg">
            <div
              className="h-full bg-progress transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        )}

        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/90 flex items-center justify-center">
            <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground ml-0.5 sm:ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-2">
          {course.isNew && (
            <Badge className="bg-accent text-accent-foreground">
              Novo
            </Badge>
          )}
          {course.comingSoon && (
            <Badge className="bg-muted text-muted-foreground">
              Em breve
            </Badge>
          )}
        </div>

        {/* Premium badge */}
        {course.isPremium && (
          <div className="absolute top-2 right-2">
            <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </div>

      <div className="mt-2 sm:mt-3 space-y-1">
        <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{course.duration}</span>
          {course.totalLessons && (
            <>
              <span>•</span>
              <span>{course.totalLessons} aulas</span>
            </>
          )}
        </div>
        {course.progress !== undefined && course.progress > 0 && (
          <div className="pt-1">
            <Progress value={course.progress} className="h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {course.progress}% concluído
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
