import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/movies';

export async function POST(
  request: Request,
  { params }: { params: { movieId: string; prizeId: string } }
) {
  try {
    const { movieId, prizeId } = params;

    const res = await fetch(`${BACKEND_URL}/${movieId}/prizes/${prizeId}`, {
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
    console.error('Error al asignar premio a película:', error.message);
    return NextResponse.json(
      { error: 'Error al asociar premio a la película' },
      { status: 500 }
    );
  }
}
