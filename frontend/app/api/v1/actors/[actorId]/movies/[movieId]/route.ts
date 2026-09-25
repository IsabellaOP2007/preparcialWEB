import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/actors';

export async function POST(
  request: Request,
  { params }: { params: { actorId: string; movieId: string } }
) {
  try {
    const { actorId, movieId } = params;

    const res = await fetch(`${BACKEND_URL}/${actorId}/movies/${movieId}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error('Error al asignar película a actor:', error.message);
    return NextResponse.json(
      { error: 'Error al asociar película al actor' },
      { status: 500 }
    );
  }
}
