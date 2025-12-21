import { Skeleton } from "@/components/ui/skeleton";

export const CoursePlayerSkeleton = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Skeleton */}
      <header className="fixed top-0 left-0 right-0 lg:right-96 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="px-6 py-3 flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-6 w-48" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex pt-16 lg:pr-96">
        {/* Video and Content Area */}
        <div className="flex-1 flex justify-center px-4">
          <div className="w-full max-w-[990px] mx-auto">
            {/* Video Player Skeleton */}
            <Skeleton className="w-full aspect-video" />

            {/* Course Info Skeleton */}
            <div className="px-8 py-6 bg-background">
              {/* Title and Navigation Row */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <Skeleton className="h-4 w-64 mb-3" />
                  <Skeleton className="h-8 w-80" />
                </div>
                <div className="flex items-center gap-3 ml-6">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>

              {/* Rating and Complete Section */}
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
                <div>
                  <Skeleton className="h-6 w-24 mb-3" />
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Skeleton key={star} className="h-8 w-8" />
                    ))}
                  </div>
                </div>
                <Skeleton className="h-10 w-48" />
              </div>

              {/* Comments Section Skeleton */}
              <div>
                <Skeleton className="h-7 w-32 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="w-full h-[100px] rounded-lg" />
                    <div className="flex justify-end mt-3">
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="fixed top-16 right-0 bottom-0 w-96 bg-card border-l border-border hidden lg:block">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>

            <div className="p-4 space-y-6 overflow-hidden">
              {/* Module Skeletons */}
              {[1, 2, 3, 4].map((moduleIndex) => (
                <div key={moduleIndex} className="space-y-2">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <div className="space-y-2">
                    {[1, 2].map((lessonIndex) => (
                      <div key={lessonIndex} className="p-3 rounded-lg border border-transparent">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Skeleton className="h-4 w-full mb-1" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                          <Skeleton className="h-5 w-5 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
