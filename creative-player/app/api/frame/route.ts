import { NextRequest, NextResponse } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_request: NextRequest) {
  try {
    // Handle Frame interaction
    // For now, we'll redirect to the main app
    // In the future, you can add specific Frame logic here
    // const body = await request.json(); // Uncomment when needed
    
    // Return a Frame response that redirects to the main app
    return new NextResponse(
      `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${process.env.NEXT_PUBLIC_URL || 'https://jukebox.creativeplatform.xyz'}/screenshot.png" />
  <meta property="fc:frame:button:1" content="Open Jukebox" />
  <meta property="fc:frame:post_url" content="${process.env.NEXT_PUBLIC_URL || 'https://jukebox.creativeplatform.xyz'}/api/frame" />
  <meta property="fc:frame:state" content="jukebox" />
  <meta property="fc:frame:input:text" content="false" />
  <title>Genesis Jukebox</title>
</head>
<body>
  <script>
    window.location.href = '${process.env.NEXT_PUBLIC_URL || 'https://jukebox.creativeplatform.xyz'}';
  </script>
</body>
</html>`,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Frame API error:', error);
    return NextResponse.json(
      { error: 'Failed to process frame interaction' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Redirect GET requests to the main app
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_URL || 'https://jukebox.creativeplatform.xyz'));
}
