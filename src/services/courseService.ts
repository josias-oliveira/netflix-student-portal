import { supabase } from "@/integrations/supabase/client";
import { CourseStructure, Module, Lesson, Material } from "@/types/courseEditor";

export async function saveCourse(course: CourseStructure, status?: 'draft' | 'published'): Promise<number> {
  // Save or update course
  const courseData = {
    title: course.title,
    slug: course.slug || null,
    description: course.description || null,
    thumbnail_url: course.thumbnail_url || null,
    cover_image_url: course.cover_image_url || null,
    featured: course.featured || false,
    ...(status && { status }),
  };

  let courseId: number;

  if (course.id === 'new') {
    // Insert new course
    const { data: newCourse, error: courseError } = await supabase
      .from('courses')
      .insert(courseData)
      .select('id')
      .single();

    if (courseError) throw courseError;
    courseId = newCourse.id;
  } else {
    // Update existing course
    courseId = parseInt(course.id);
    const { error: courseError } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', courseId);

    if (courseError) throw courseError;
  }

  // Delete existing modules, lessons, and materials for this course
  const { data: existingModules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId);

  if (existingModules && existingModules.length > 0) {
    const moduleIds = existingModules.map(m => m.id);
    
    // Get lesson ids to delete materials
    const { data: existingLessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (existingLessons && existingLessons.length > 0) {
      const lessonIds = existingLessons.map(l => l.id);
      
      // Delete materials
      await supabase
        .from('lesson_materials')
        .delete()
        .in('lesson_id', lessonIds);
      
      // Delete lessons
      await supabase
        .from('lessons')
        .delete()
        .in('module_id', moduleIds);
    }

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
        description: module.description,
        order: i + 1,
      })
      .select('id')
      .single();

    if (moduleError) throw moduleError;

    // Insert lessons for this module
    for (let j = 0; j < module.lessons.length; j++) {
      const lesson = module.lessons[j];
      const { data: newLesson, error: lessonError } = await supabase
        .from('lessons')
        .insert({
          module_id: newModule.id,
          title: lesson.title,
          description: lesson.description,
          video_url: lesson.videoUrl || null,
          streaming_url: lesson.streamingUrl || null,
          order: j + 1,
        })
        .select('id')
        .single();

      if (lessonError) throw lessonError;

      // Insert materials for this lesson
      if (lesson.materials && lesson.materials.length > 0) {
        const materialsData = lesson.materials.map(material => ({
          lesson_id: newLesson.id,
          name: material.name,
          url: material.url,
          size: material.size,
          type: material.type,
        }));

        const { error: materialsError } = await supabase
          .from('lesson_materials')
          .insert(materialsData);

      if (materialsError) throw materialsError;
    }
  }
  }

  return courseId;
}

export async function updateCourseStatus(courseId: number, status: 'draft' | 'published'): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .update({ status })
    .eq('id', courseId);

  if (error) throw error;
}

export async function loadCourse(courseId: number): Promise<CourseStructure> {
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
    .order('order');

  if (modulesError) throw modulesError;

  const courseStructure: CourseStructure = {
    id: courseId.toString(),
    title: course.title,
    slug: course.slug || undefined,
    description: course.description || undefined,
    thumbnail_url: course.thumbnail_url || undefined,
    cover_image_url: course.cover_image_url || undefined,
    featured: course.featured || false,
    status: course.status as 'draft' | 'published',
    modules: [],
  };

  for (const module of modules || []) {
    // Load lessons for this module
    const { data: lessons, error: lessonsError } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', module.id)
      .order('order');

    if (lessonsError) throw lessonsError;

    const moduleLessons: Lesson[] = [];

    for (const lesson of lessons || []) {
      // Load materials for this lesson
      const { data: materials, error: materialsError } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('lesson_id', lesson.id);

      if (materialsError) throw materialsError;

      moduleLessons.push({
        id: lesson.id.toString(),
        title: lesson.title,
        description: lesson.description || '',
        videoUrl: lesson.video_url || undefined,
        streamingUrl: lesson.streaming_url || undefined,
        materials: (materials || []).map(m => ({
          id: m.id.toString(),
          name: m.name,
          url: m.url,
          size: m.size || '',
          type: m.type || '',
        })),
      });
    }

    courseStructure.modules.push({
      id: module.id.toString(),
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
