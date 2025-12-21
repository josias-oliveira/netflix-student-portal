import { Skeleton } from "@/components/ui/skeleton";

export const HeroBannerSkeleton = () => {
  return (
    <div className="relative h-[60vh] sm:h-[70vh] w-full overflow-hidden bg-muted/20">
      {/* Background gradient to simulate image loading */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="gradient-overlay-bottom" />

      {/* Content skeleton */}
      <div className="relative h-full container mx-auto px-4 sm:px-8 flex items-center">
        <div className="max-w-2xl space-y-4 sm:space-y-6 w-full">
          {/* Title skeleton */}
          <Skeleton className="h-12 sm:h-16 w-3/4" />
          
          {/* Description skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-5 w-full max-w-xl" />
            <Skeleton className="h-5 w-4/5 max-w-lg" />
          </div>

          {/* Meta info skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>

          {/* Buttons skeleton */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="h-11 w-40" />
            <Skeleton className="h-11 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
};
