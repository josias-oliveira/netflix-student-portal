import { Course } from "@/types/course";
import { CourseCard } from "./CourseCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface CourseShelfProps {
  title: string;
  courses: Course[];
  onCourseClick?: (course: Course) => void;
}

export const CourseShelf = ({ title, courses, onCourseClick }: CourseShelfProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 group/shelf">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground px-3 sm:px-4 md:px-8">
        {title}
      </h2>
      
      <div className="relative">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 opacity-0 group-hover/shelf:opacity-100 transition-opacity hidden sm:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>

        {/* Course cards container */}
        <div
          ref={scrollRef}
          className="shelf-scroll px-3 sm:px-4 md:px-8 gap-3 sm:gap-4"
        >
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => onCourseClick?.(course)}
            />
          ))}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 opacity-0 group-hover/shelf:opacity-100 transition-opacity hidden sm:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>
    </div>
  );
};
