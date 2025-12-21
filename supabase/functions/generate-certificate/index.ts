import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { PDFDocument, rgb } from "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { course_id, user_id } = await req.json();

    if (!course_id || !user_id) {
      throw new Error("course_id and user_id are required");
    }

    console.log(`Generating certificate for user ${user_id}, course ${course_id}`);

    // Check if certificate already exists
    const { data: existingCert } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user_id)
      .eq('course_id', course_id)
      .maybeSingle();

    if (existingCert) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          certificate_url: existingCert.certificate_url,
          validation_code: existingCert.validation_code,
          message: "Certificate already exists"
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all lessons for the course
    const { data: modules } = await supabase
      .from('modules')
      .select('id')
      .eq('course_id', course_id);

    if (!modules || modules.length === 0) {
      throw new Error("Course has no modules");
    }

    const moduleIds = modules.map(m => m.id);

    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .in('module_id', moduleIds);

    if (!lessons || lessons.length === 0) {
      throw new Error("Course has no lessons");
    }

    // Check completion progress
    const { data: progress, count } = await supabase
      .from('lesson_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', user_id)
      .in('lesson_id', lessons.map(l => l.id));

    const completedLessons = count || 0;
    const totalLessons = lessons.length;

    if (completedLessons < totalLessons) {
      throw new Error(`Course not completed. Progress: ${completedLessons}/${totalLessons} lessons`);
    }

    console.log(`Course completed: ${completedLessons}/${totalLessons} lessons`);

    // Get course certificate configuration
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', course_id)
      .single();

    if (!course || !course.certificate_enabled) {
      throw new Error("Certificate generation is not enabled for this course");
    }

    if (!course.certificate_template_url) {
      throw new Error("Certificate template not configured");
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user_id)
      .single();

    const studentName = profile?.full_name || "Aluno";

    console.log(`Generating PDF for ${studentName}`);

    // Download template image
    const templateResponse = await fetch(course.certificate_template_url);
    const templateBuffer = await templateResponse.arrayBuffer();

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    
    let backgroundImage;
    const contentType = templateResponse.headers.get('content-type');
    
    if (contentType?.includes('png')) {
      backgroundImage = await pdfDoc.embedPng(templateBuffer);
    } else {
      backgroundImage = await pdfDoc.embedJpg(templateBuffer);
    }

    const page = pdfDoc.addPage([backgroundImage.width, backgroundImage.height]);
    
    // Draw background
    page.drawImage(backgroundImage, {
      x: 0,
      y: 0,
      width: backgroundImage.width,
      height: backgroundImage.height,
    });

    // Parse hex color to RGB
    const hexColor = course.certificate_font_color || '#000000';
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    // Draw student name
    const nameFontSize = course.certificate_font_size || 48;
    const nameX = ((course.certificate_text_x || 50) / 100) * backgroundImage.width;
    const nameY = ((course.certificate_text_y || 50) / 100) * backgroundImage.height;

    page.drawText(studentName, {
      x: nameX,
      y: backgroundImage.height - nameY,
      size: nameFontSize,
      color: rgb(r, g, b),
    });

    // Draw completion date
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR'); // DD/MM/AAAA format
    const dateFontSize = course.certificate_date_font_size || 24;
    const dateX = ((course.certificate_date_x || 50) / 100) * backgroundImage.width;
    const dateY = ((course.certificate_date_y || 60) / 100) * backgroundImage.height;

    page.drawText(dateStr, {
      x: dateX,
      y: backgroundImage.height - dateY,
      size: dateFontSize,
      color: rgb(r, g, b),
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Upload to storage
    const fileName = `${user_id}/${course_id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(fileName, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName);

    const certificateUrl = urlData.publicUrl;

    // Insert certificate record
    const { data: certificate, error: insertError } = await supabase
      .from('certificates')
      .insert({
        user_id,
        course_id,
        certificate_url: certificateUrl,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    console.log(`Certificate generated successfully: ${certificate.validation_code}`);

    return new Response(
      JSON.stringify({
        success: true,
        certificate_url: certificateUrl,
        validation_code: certificate.validation_code,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error generating certificate:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
