const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchPlaylist(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }
  return response.text();
}

function getBaseUrl(url: string): string {
  const lastSlash = url.lastIndexOf('/');
  return url.substring(0, lastSlash + 1);
}

async function getDurationFromMediaPlaylist(manifest: string): Promise<number> {
  let totalDuration = 0;
  const lines = manifest.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('#EXTINF:')) {
      const match = line.match(/#EXTINF:(\d+\.?\d*)/);
      if (match) {
        totalDuration += parseFloat(match[1]);
      }
    }
  }
  
  return totalDuration;
}

async function getVideoDuration(url: string): Promise<number> {
  console.log('Fetching master playlist:', url);
  const masterPlaylist = await fetchPlaylist(url);
  const baseUrl = getBaseUrl(url);
  
  const lines = masterPlaylist.split('\n');
  
  // Check if this is a master playlist (contains #EXT-X-STREAM-INF)
  const isMasterPlaylist = lines.some(line => line.includes('#EXT-X-STREAM-INF'));
  
  if (isMasterPlaylist) {
    console.log('Detected master playlist, looking for variant playlist...');
    
    // Find the first variant playlist URL
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('#EXT-X-STREAM-INF')) {
        // The next non-empty line should be the playlist URL
        const nextLine = lines[i + 1]?.trim();
        if (nextLine && !nextLine.startsWith('#')) {
          const variantUrl = nextLine.startsWith('http') 
            ? nextLine 
            : baseUrl + nextLine;
          
          console.log('Fetching variant playlist:', variantUrl);
          const variantPlaylist = await fetchPlaylist(variantUrl);
          return getDurationFromMediaPlaylist(variantPlaylist);
        }
      }
    }
    
    throw new Error('No variant playlist found in master playlist');
  }
  
  // This is already a media playlist
  console.log('Detected media playlist, parsing directly...');
  return getDurationFromMediaPlaylist(masterPlaylist);
}

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

    const totalDuration = await getVideoDuration(url);
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
