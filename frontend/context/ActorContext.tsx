'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Actor, CreateActorDto } from '../types/actor';

interface ActorContextType {
  actors: Actor[];
  loading: boolean;
  error: string | null;
  apiConnected: boolean;
  addActor: (actorData: CreateActorDto) => Promise<Actor>;
  updateActor: (id: string, actorData: CreateActorDto) => Promise<Actor>;
  deleteActor: (id: string) => Promise<void>;
  reloadActors: () => Promise<void>;
}

const ActorContext = createContext<ActorContextType | undefined>(undefined);

// Usa la ruta interna de Next.js que actúa de proxy hacia el backend NestJS (http://127.0.0.1:3000)
const API_BASE_URL = '/api/v1/actors';

const INITIAL_FALLBACK_ACTORS: Actor[] = [
  {
    id: 'fa540a31-2c26-42dc-afb5-2cd30af6a88e',
    name: 'Barnett Campagne',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    nationality: 'Ireland',
    birthDate: '1995-12-20',
    biography: 'Actor conocido por sus destacadas participaciones en producciones de teatro y cine independiente.'
  },
  {
    id: '4499e858-3ea4-47c3-8515-32f85d32bbc2',
    name: 'Godiva Durran',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    nationality: 'China',
    birthDate: '2000-07-22',
    biography: 'Reconocida actriz de cine dramático y televisión con múltiples galardones internacionales.'
  },
  {
    id: 'beaeb2b0-b10f-487a-bf68-794161e00acf',
    name: 'Papagena Bales',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    nationality: 'Venezuela',
    birthDate: '1992-04-30',
    biography: 'Actriz versátil con amplia trayectoria en cine contemporáneo y series de televisión.'
  }
];

export const ActorProvider = ({ children }: { children: ReactNode }) => {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(false);

  // Paso 1: Hook useEffect para obtener los datos del API (/api/v1/actors)
  const fetchActors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data: Actor[] = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setActors(data);
        setApiConnected(true);
      } else {
        setActors(INITIAL_FALLBACK_ACTORS);
        setApiConnected(true);
      }
    } catch (err: any) {
      console.warn('Backend API no disponible en /api/v1/actors, usando datos de respaldo:', err.message);
      setActors(INITIAL_FALLBACK_ACTORS);
      setApiConnected(false);
      setError('No se pudo conectar con el backend (BackArte7). Mostrando datos locales de respaldo.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  // Paso 3 & Paso 5: Agregar nuevo actor a la lista y persistir en el estado
  const addActor = async (actorData: CreateActorDto): Promise<Actor> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorData),
      });

      if (response.ok) {
        const created: Actor = await response.json();
        setActors((prev) => [created, ...prev]);
        setApiConnected(true);
        return created;
      }
    } catch (err) {
      console.error('Error comunicándose con el API para POST:', err);
    }

    // Persistencia local en el estado (Paso 5) si la API falla
    const newActor: Actor = {
      ...actorData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`
    };
    setActors((prev) => [newActor, ...prev]);
    return newActor;
  };

  // Paso 6: Actualizar información de un actor existente
  const updateActor = async (id: string, actorData: CreateActorDto): Promise<Actor> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorData),
      });

      if (response.ok) {
        const updated: Actor = await response.json();
        setActors((prev) => prev.map((a) => (a.id === id ? updated : a)));
        setApiConnected(true);
        return updated;
      }
    } catch (err) {
      console.error('Error comunicándose con el API para PUT:', err);
    }

    // Actualización local en el estado
    const updatedActor: Actor = { id, ...actorData };
    setActors((prev) => prev.map((a) => (a.id === id ? updatedActor : a)));
    return updatedActor;
  };

  // Paso 7: Eliminar actor de la lista y actualizar el estado
  const deleteActor = async (id: string): Promise<void> => {
    try {
      await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      setApiConnected(true);
    } catch (err) {
      console.error('Error comunicándose con el API para DELETE:', err);
    }

    // Remover del estado de React y actualizar la vista
    setActors((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <ActorContext.Provider
      value={{
        actors,
        loading,
        error,
        apiConnected,
        addActor,
        updateActor,
        deleteActor,
        reloadActors: fetchActors,
      }}
    >
      {children}
    </ActorContext.Provider>
  );
};

export const useActors = () => {
  const context = useContext(ActorContext);
  if (!context) {
    throw new Error('useActors debe ser utilizado dentro de un ActorProvider');
  }
  return context;
};
