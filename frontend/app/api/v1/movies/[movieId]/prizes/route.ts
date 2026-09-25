import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/movies';

export async function GET(
  request: Request,
  { params }: { params: { movieId: string } }
) {
  try {
    const { movieId } = params;
    const res = await fetch(`${BACKEND_URL}/${movieId}/prizes`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      return NextResponse.json([], { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json([], { status: 200 });
  }
}
