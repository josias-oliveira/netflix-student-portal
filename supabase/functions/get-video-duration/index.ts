const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Getting duration for URL:', url);

    // Fetch the HLS manifest
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch manifest:', response.status);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch video manifest' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const manifest = await response.text();
    console.log('Manifest fetched, parsing duration...');

    // Parse HLS manifest to get duration
    // Look for #EXTINF tags which contain segment durations
    let totalDuration = 0;
    const lines = manifest.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('#EXTINF:')) {
        // Extract duration from #EXTINF:duration,
        const match = line.match(/#EXTINF:(\d+\.?\d*)/);
        if (match) {
          totalDuration += parseFloat(match[1]);
        }
      }
    }

    // Convert to minutes and round up
    const durationMinutes = Math.ceil(totalDuration / 60);

    console.log(`Total duration: ${totalDuration}s = ${durationMinutes} minutes`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        durationSeconds: Math.round(totalDuration),
        durationMinutes 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error getting video duration:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
