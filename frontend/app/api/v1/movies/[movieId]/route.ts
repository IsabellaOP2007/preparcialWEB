import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/movies';

export async function GET(
  request: Request,
  { params }: { params: { movieId: string } }
) {
  try {
    const { movieId } = params;
    const res = await fetch(`${BACKEND_URL}/${movieId}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Película no encontrada' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al comunicarse con el backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { movieId: string } }
) {
  try {
    const { movieId } = params;
    const res = await fetch(`${BACKEND_URL}/${movieId}`, {
      method: 'DELETE',
    });

    if (!res.ok && res.status !== 204) {
      return NextResponse.json(
        { error: 'Error al eliminar la película' },
        { status: res.status }
      );
    }

    return new Response(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al comunicarse con el backend' },
      { status: 500 }
    );
  }
}
