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

    const { course_id, user_id, force } = await req.json();

    if (!course_id || !user_id) {
      throw new Error("course_id and user_id are required");
    }

    console.log(`Generating certificate for user ${user_id}, course ${course_id} (force=${!!force})`);

    // If not forcing, return existing certificate to avoid unnecessary regeneration
    if (!force) {
      const { data: existingCert } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user_id)
        .eq("course_id", course_id)
        .maybeSingle();

      if (existingCert) {
        return new Response(
          JSON.stringify({
            success: true,
            certificate_url: existingCert.certificate_url,
            message: "Certificate already exists",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user_id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
    }

    const studentName = profile?.full_name?.trim() || "Aluno";

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

    // Simple width estimation to center text (avoids font imports/type issues in Deno)
    const estimateWidth = (text: string, fontSize: number) => text.length * fontSize * 0.55;

    // Draw student name (centered on X)
    const nameFontSize = course.certificate_font_size || 48;
    const nameXPercent = course.certificate_text_x || 50;
    const nameYPercent = course.certificate_text_y || 50;

    const nameCenterX = (nameXPercent / 100) * backgroundImage.width;
    const nameTopY = (nameYPercent / 100) * backgroundImage.height;
    const nameWidth = estimateWidth(studentName, nameFontSize);

    page.drawText(studentName, {
      x: nameCenterX - nameWidth / 2,
      y: backgroundImage.height - nameTopY,
      size: nameFontSize,
      color: rgb(r, g, b),
    });

    // Draw completion date (centered on X)
    const today = new Date();
    const dateStr = today.toLocaleDateString('pt-BR'); // DD/MM/AAAA format
    const dateFontSize = course.certificate_date_font_size || 24;
    const dateXPercent = course.certificate_date_x || 50;
    const dateYPercent = course.certificate_date_y || 60;

    const dateCenterX = (dateXPercent / 100) * backgroundImage.width;
    const dateTopY = (dateYPercent / 100) * backgroundImage.height;
    const dateWidth = estimateWidth(dateStr, dateFontSize);

    page.drawText(dateStr, {
      x: dateCenterX - dateWidth / 2,
      y: backgroundImage.height - dateTopY,
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

    // Upsert certificate record
    const { data: existingRow } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", user_id)
      .eq("course_id", course_id)
      .maybeSingle();

    if (existingRow?.id) {
      const { data: updated, error: updateError } = await supabase
        .from("certificates")
        .update({ certificate_url: certificateUrl, issued_at: new Date().toISOString() })
        .eq("id", existingRow.id)
        .select()
        .single();

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      return new Response(
        JSON.stringify({
          success: true,
          certificate_url: certificateUrl,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: insertError } = await supabase
      .from("certificates")
      .insert({
        user_id,
        course_id,
        certificate_url: certificateUrl,
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        certificate_url: certificateUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
