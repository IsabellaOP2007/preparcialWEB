import { NextResponse } from 'next/server';

const BACKEND_URL = 'http://127.0.0.1:3000/api/v1/actors';

export async function GET(
  request: Request,
  { params }: { params: { actorId: string } }
) {
  try {
    const { actorId } = params;
    const res = await fetch(`${BACKEND_URL}/${actorId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Actor no encontrado' },
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

export async function PUT(
  request: Request,
  { params }: { params: { actorId: string } }
) {
  try {
    const { actorId } = params;
    const body = await request.json();

    const res = await fetch(`${BACKEND_URL}/${actorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al actualizar el actor en el backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { actorId: string } }
) {
  try {
    const { actorId } = params;

    const res = await fetch(`${BACKEND_URL}/${actorId}`, {
      method: 'DELETE',
    });

    if (!res.ok && res.status !== 204) {
      return NextResponse.json(
        { error: 'Error al eliminar el actor' },
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
