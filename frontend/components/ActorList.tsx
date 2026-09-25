'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useActors } from '../context/ActorContext';
import { Actor, CreateActorDto } from '../types/actor';
import { ActorEditModal } from './ActorEditModal';
import { ActorImage } from './ActorImage';

export const ActorList: React.FC = () => {
  const { actors, loading, error, deleteActor, updateActor, reloadActors, apiConnected } = useActors();
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Paso 6: Al seleccionar "Editar", mostrar formulario con datos cargados
  const handleEditClick = (actor: Actor) => {
    setSelectedActor(actor);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedActor(null);
  };

  const handleSaveEdit = async (id: string, updatedData: CreateActorDto) => {
    await updateActor(id, updatedData);
  };

  // Paso 7: Al hacer clic en "Eliminar", remover ese actor del estado y actualizar la vista
  const handleDeleteClick = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas eliminar a "${name}"?`);
    if (confirmDelete) {
      await deleteActor(id);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Cargando actores...</span>
        </div>
        <p className="mt-3 text-muted fw-semibold">Consultando lista de actores desde la API (/api/v1/actors)...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-2">
        <div>
          <h1 className="h2 fw-bold text-dark mb-0">🎭 Catálogo de Actores</h1>
          <p className="text-muted small mb-0">
            Total registrados: <strong>{actors.length}</strong> | Origen de datos: <strong>{apiConnected ? 'Backend NestJS (BackArte7)' : 'Almacenamiento Local'}</strong>
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            onClick={() => reloadActors()}
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            title="Recargar datos del backend"
          >
            🔄 Refrescar
          </button>
          <Link href="/crear" className="btn btn-primary fw-semibold shadow-sm">
            + Nuevo Actor
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-info alert-dismissible fade show" role="alert">
          <small>{error}</small>
        </div>
      )}

      {actors.length === 0 ? (
        <div className="card text-center p-5 shadow-sm border-0 bg-light">
          <div className="card-body">
            <h4 className="card-title text-muted">No hay actores en la lista</h4>
            <p className="card-text text-secondary">
              Comienza registrando tu primer actor en el sistema.
            </p>
            <Link href="/crear" className="btn btn-success mt-2">
              Crear Nuevo Actor
            </Link>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {actors.map((actor) => (
            <div key={actor.id} className="col">
              <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                <div style={{ height: '220px', overflow: 'hidden', backgroundColor: '#e9ecef' }}>
                  <ActorImage
                    photo={actor.photo}
                    name={actor.name}
                    className="card-img-top w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold text-primary mb-1">{actor.name}</h5>
                  <div className="mb-2">
                    <span className="badge bg-secondary me-2">
                      🌍 {actor.nationality || 'Desconocida'}
                    </span>
                    <span className="badge bg-light text-dark border">
                      🎂 {actor.birthDate ? actor.birthDate.split('T')[0] : 'N/A'}
                    </span>
                  </div>
                  <p
                    className="card-text text-muted small flex-grow-1"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                    title={actor.biography}
                  >
                    {actor.biography}
                  </p>
                  
                  {/* Botones de acción: Paso 6 (Editar) y Paso 7 (Eliminar) */}
                  <div className="d-flex gap-2 pt-2 border-top mt-auto">
                    <button
                      onClick={() => handleEditClick(actor)}
                      className="btn btn-outline-primary btn-sm flex-fill fw-semibold"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteClick(actor.id, actor.name)}
                      className="btn btn-outline-danger btn-sm flex-fill fw-semibold"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición (Paso 6) */}
      <ActorEditModal
        actor={selectedActor}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveEdit}
      />
    </div>
  );
};
