import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/prizes';

export async function GET() {
  try {
    const res = await fetch(BACKEND_URL, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Error del backend: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'No se pudo conectar con el backend' },
      { status: 503 }
    );
  }
}

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
    console.error('Error al enviar POST /prizes al backend:', error.message);
    return NextResponse.json(
      { error: 'Error al comunicarse con el backend' },
      { status: 500 }
    );
  }
}
