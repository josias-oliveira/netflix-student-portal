import { supabase } from "@/integrations/supabase/client";
import { CourseStructure, Module, Lesson, Material } from "@/types/courseEditor";

export async function saveCourse(course: CourseStructure, status?: 'draft' | 'published'): Promise<string> {
  // Generate slug from title if not provided
  const slug = course.slug || course.title.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Calculate total duration from lessons
  let totalDurationMinutes = 0;
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      totalDurationMinutes += lesson.duration || 0;
    }
  }
  const durationHours = Math.ceil(totalDurationMinutes / 60);

  // Save or update course
  const courseData = {
    title: course.title,
    slug: slug,
    description: course.description || null,
    thumbnail_url: course.thumbnail_url || null,
    is_featured: course.featured || false,
    is_published: status === 'published',
    duration_hours: durationHours,
  };

  let courseId: string;

  if (course.id === 'new') {
    // Insert new course
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select('id')
      .single();

    if (courseError) {
      console.error('Error creating course:', courseError);
      throw courseError;
    }
    courseId = newCourse.id;
  } else {
    // Update existing course
    courseId = course.id;
    const { error: courseError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId);

    if (courseError) {
      console.error('Error updating course:', courseError);
      throw courseError;
    }
  }

  // Delete existing modules, lessons for this course
  const { data: existingModules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (existingModules && existingModules.length > 0) {
    const moduleIds = existingModules.map(m => m.id);
    
    // Delete lessons
    await supabase
      .from('lessons')
      .delete()
      .in('module_id', moduleIds);

    // Delete modules
    await supabase
      .from('modules')
      .delete()
      .eq('course_id', courseId);
  }

  // Insert modules
  for (let i = 0; i < course.modules.length; i++) {
    const module = course.modules[i];
    const { data: newModule, error: moduleError } = await supabase
      .from('modules')
      .insert({
        course_id: courseId,
        title: module.title,
        description: module.description || null,
        order_index: i,
      })
      .select('id')
      .single();

    if (moduleError) {
      console.error('Error creating module:', moduleError);
      throw moduleError;
    }

    // Insert lessons for this module
    for (let j = 0; j < module.lessons.length; j++) {
      const lesson = module.lessons[j];
      const videoUrl = lesson.streamingUrl || lesson.videoUrl || null;
      console.log(`Saving lesson "${lesson.title}":`, { 
        streamingUrl: lesson.streamingUrl, 
        videoUrl: lesson.videoUrl,
        finalVideoUrl: videoUrl,
        duration: lesson.duration 
      });
      
      const { error: lessonError } = await supabase
        .from('lessons')
        .insert({
          module_id: newModule.id,
          title: lesson.title,
          description: lesson.description || null,
          video_url: videoUrl,
          duration_minutes: lesson.duration || 0,
          order_index: j,
          is_free: false,
        });

      if (lessonError) {
        console.error('Error creating lesson:', lessonError);
        throw lessonError;
      }
    }
  }

  return courseId;
}

export async function updateCourseStatus(courseId: string, status: 'draft' | 'published'): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .update({ is_published: status === 'published' })
    .eq('id', courseId);

  if (error) throw error;
}

export async function loadCourse(courseId: string): Promise<CourseStructure> {
  // Load course
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (courseError) throw courseError;

  // Load modules
  const { data: modules, error: modulesError } = await supabase
    .from('modules')
    .select('*')
    .eq('course_id', courseId)
    .order('order_index');

  if (modulesError) throw modulesError;

  const courseStructure: CourseStructure = {
    id: courseId,
    title: course.title,
    slug: course.slug || undefined,
    description: course.description || undefined,
    thumbnail_url: course.thumbnail_url || undefined,
    featured: course.is_featured || false,
    status: course.is_published ? 'published' : 'draft',
    modules: [],
  };

  for (const module of modules || []) {
    // Load lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('order_index');

    if (lessonsError) throw lessonsError;

    const moduleLessons: Lesson[] = [];

    for (const lesson of lessons || []) {
      moduleLessons.push({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description || '',
        videoUrl: undefined,
        streamingUrl: lesson.video_url || undefined,
        duration: lesson.duration_minutes || 0,
        materials: [],
      });
    }

    courseStructure.modules.push({
      id: module.id,
      title: module.title,
      description: module.description || '',
      lessons: moduleLessons,
    });
  }

  return courseStructure;
}

export async function loadCourseBySlug(slug: string): Promise<CourseStructure> {
  // Load course by slug
  const { data: course, error: courseError } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (courseError) throw courseError;

  // Use existing loadCourse function with the ID
  return loadCourse(course.id);
}
