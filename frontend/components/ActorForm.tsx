'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useActors } from '../context/ActorContext';
import { ActorImage } from './ActorImage';

export const ActorForm: React.FC = () => {
  const router = useRouter();
  const { addActor } = useActors();

  // Paso 3.2: Manejar el estado de cada campo con useState
  const [nombre, setNombre] = useState<string>('');
  const [photo, setPhoto] = useState<string>('');
  const [nationality, setNationality] = useState<string>('');
  const [birthday, setBirthday] = useState<string>('');
  const [biography, setBiography] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Paso 3.3: Al enviar el formulario, agregar el nuevo actor a la lista
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validación básica de campos requeridos
    if (!nombre.trim() || !photo.trim() || !nationality.trim() || !birthday.trim() || !biography.trim()) {
      setErrorMessage('Todos los campos son obligatorios.');
      return;
    }

    try {
      setLoading(true);
      await addActor({
        name: nombre.trim(),
        photo: photo.trim(),
        nationality: nationality.trim(),
        birthDate: birthday,
        biography: biography.trim(),
      });

      setSuccessMessage('¡Actor creado exitosamente!');
      
      // Limpiar el formulario
      setNombre('');
      setPhoto('');
      setNationality('');
      setBirthday('');
      setBiography('');

      // Redirigir a la lista de actores después de 1 segundo (Paso 5)
      setTimeout(() => {
        router.push('/actors');
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Ocurrió un error al registrar el actor: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '720px' }}>
      <div className="card shadow-sm border-0 rounded-3">
        <div className="card-header bg-primary text-white py-3">
          <h2 className="h4 mb-0 fw-bold">🎭 Crear Nuevo Actor</h2>
          <p className="mb-0 small opacity-75">
            Ingresa la información requerida para registrar el actor en la plataforma.
          </p>
        </div>
        <div className="card-body p-4">
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <strong>{successMessage}</strong> Redirigiendo a la lista de actores...
            </div>
          )}

          {errorMessage && (
            <div className="alert alert-danger" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Campo 1: Nombre */}
            <div className="mb-3">
              <label htmlFor="nombre" className="form-label fw-semibold">
                Nombre Completo <span className="text-danger">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className="form-control"
                placeholder="Ej: Pedro Pascal"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            {/* Campo 2: Photo */}
            <div className="mb-3">
              <label htmlFor="photo" className="form-label fw-semibold">
                URL de la Fotografía <span className="text-danger">*</span>
              </label>
              <input
                id="photo"
                name="photo"
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/photo-..."
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
                required
              />
              <div className="form-text">
                Ingresa un enlace web válido de imagen (ejemplo: Unsplash, Wikimedia o URL de imagen).
              </div>
              {photo && (
                <div className="mt-2 p-2 border rounded bg-light text-center">
                  <small className="text-muted d-block mb-1">Vista previa:</small>
                  <ActorImage
                    photo={photo}
                    name={nombre || 'Nuevo Actor'}
                    style={{ maxHeight: '120px', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
              )}
            </div>

            <div className="row">
              {/* Campo 3: Nationality */}
              <div className="col-md-6 mb-3">
                <label htmlFor="nationality" className="form-label fw-semibold">
                  Nacionalidad <span className="text-danger">*</span>
                </label>
                <input
                  id="nationality"
                  name="nationality"
                  type="text"
                  className="form-control"
                  placeholder="Ej: Chile"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  required
                />
              </div>

              {/* Campo 4: Birthday */}
              <div className="col-md-6 mb-3">
                <label htmlFor="birthday" className="form-label fw-semibold">
                  Fecha de Nacimiento (Birthday) <span className="text-danger">*</span>
                </label>
                <input
                  id="birthday"
                  name="birthday"
                  type="date"
                  className="form-control"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Campo 5: Biography */}
            <div className="mb-4">
              <label htmlFor="biography" className="form-label fw-semibold">
                Biografía <span className="text-danger">*</span>
              </label>
              <textarea
                id="biography"
                name="biography"
                rows={4}
                className="form-control"
                placeholder="Describe la trayectoria y datos relevantes del actor..."
                value={biography}
                onChange={(e) => setBiography(e.target.value)}
                required
              ></textarea>
            </div>

            {/* Acciones */}
            <div className="d-flex justify-content-between align-items-center pt-3 border-top">
              <Link href="/actors" className="btn btn-outline-secondary">
                ← Volver a Actores
              </Link>
              <button
                type="submit"
                className="btn btn-primary px-4 fw-bold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  'Crear Actor'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
