import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/directors';

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
    return NextResponse.json([], { status: 200 });
  }
}
