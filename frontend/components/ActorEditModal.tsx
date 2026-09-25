'use client';

import React, { useState, useEffect } from 'react';
import { Actor, CreateActorDto } from '../types/actor';
import { ActorImage } from './ActorImage';

interface ActorEditModalProps {
  actor: Actor | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: CreateActorDto) => Promise<void>;
}

export const ActorEditModal: React.FC<ActorEditModalProps> = ({
  actor,
  isOpen,
  onClose,
  onSave,
}) => {
  // Manejo de estado de cada campo con useState
  const [nombre, setNombre] = useState('');
  const [photo, setPhoto] = useState('');
  const [nationality, setNationality] = useState('');
  const [birthday, setBirthday] = useState('');
  const [biography, setBiography] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Cargar datos del actor cuando se selecciona
  useEffect(() => {
    if (actor) {
      setNombre(actor.name || '');
      setPhoto(actor.photo || '');
      setNationality(actor.nationality || '');
      // Formatear fecha para el input type="date"
      const formattedDate = actor.birthDate
        ? actor.birthDate.split('T')[0]
        : '';
      setBirthday(formattedDate);
      setBiography(actor.biography || '');
      setErrorMsg('');
    }
  }, [actor]);

  if (!isOpen || !actor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !photo.trim() || !nationality.trim() || !birthday || !biography.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');
      await onSave(actor.id, {
        name: nombre,
        photo,
        nationality,
        birthDate: birthday,
        biography,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg('Error al guardar los cambios: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex={-1}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title fw-bold">✏️ Editar Actor: {actor.name}</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {errorMsg && (
                <div className="alert alert-danger py-2">{errorMsg}</div>
              )}

              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre del Actor</label>
                <input
                  type="text"
                  className="form-control"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Pedro Pascal"
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Nacionalidad</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    placeholder="Ej: Chile"
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-semibold">Fecha de Nacimiento (Birthday)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={birthday}
                    onChange={(e) => setBirthday(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">URL de la Foto</label>
                <input
                  type="url"
                  className="form-control"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://ejemplo.com/foto.jpg"
                  required
                />
                {photo && (
                  <div className="mt-2 text-center p-2 border rounded bg-light">
                    <small className="text-muted d-block mb-1">Vista previa:</small>
                    <ActorImage
                      photo={photo}
                      name={nombre || 'Actor'}
                      className="rounded shadow-sm"
                      style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Biografía</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  placeholder="Escribe la biografía del actor..."
                  required
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary fw-bold"
                disabled={submitting}
              >
                {submitting ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
