import { Skeleton } from "@/components/ui/skeleton";

interface CourseShelfSkeletonProps {
  title?: string;
  count?: number;
}

export const CourseShelfSkeleton = ({ title = "Carregando...", count = 5 }: CourseShelfSkeletonProps) => {
  return (
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="px-4 sm:px-8">
        {title ? (
          <Skeleton className="h-7 w-48" />
        ) : (
          <Skeleton className="h-7 w-48" />
        )}
      </div>
      
      {/* Course cards skeleton */}
      <div className="flex gap-4 px-4 sm:px-8 overflow-hidden">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="flex-shrink-0 w-[200px] sm:w-[250px] space-y-3"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* Thumbnail skeleton */}
            <Skeleton className="aspect-video w-full rounded-lg" />
            
            {/* Title skeleton */}
            <Skeleton className="h-5 w-full" />
            
            {/* Meta info skeleton */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
