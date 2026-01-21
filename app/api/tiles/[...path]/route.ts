import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: pathArray } = await params;
    const path = pathArray.join('/');
    const tileUrl = `http://localhost:8080/${path}`;

    try {
        const response = await fetch(tileUrl);
        if (!response.ok) {
            return new NextResponse('Tile not found', { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'image/png';
        const buffer = await response.arrayBuffer();

        return new NextResponse(Buffer.from(buffer), {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400',
            },
        });
    } catch (error) {
        console.error('Error proxying tile:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
