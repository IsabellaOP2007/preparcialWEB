import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/youtube-trailers';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error al enviar POST /youtube-trailers al backend:', error.message);
    return NextResponse.json(
      { error: 'Error al comunicarse con el backend' },
      { status: 500 }
    );
  }
}
