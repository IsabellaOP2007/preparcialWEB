'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Genre, Director } from '../types/movie';

interface ProgressStep {
  label: string;
  endpoint: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  detail?: string;
}

export const MovieForm = () => {
  const router = useRouter();

  // Listas de soporte para garantizar preconditions del backend
  const [genres, setGenres] = useState<Genre[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState<boolean>(true);

  // 1. Información de la Película
  const [movieData, setMovieData] = useState({
    title: '',
    poster: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    duration: 125,
    country: 'Colombia',
    releaseDate: new Date().toISOString().split('T')[0],
    popularity: 88,
    genreId: '',
    directorId: '',
    trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  });

  // 2. Información del Actor Principal
  const [actorData, setActorData] = useState({
    name: '',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    nationality: 'Colombiano',
    birthDate: '1992-05-18',
    biography: '',
  });

  // 3. Información del Premio
  const [prizeData, setPrizeData] = useState({
    name: '',
    category: 'Mejor Película',
    year: new Date().getFullYear(),
    status: 'won' as 'won' | 'nominated',
  });

  // Estado del proceso de creación
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [createdMovieId, setCreatedMovieId] = useState<string | null>(null);

  // Pasos de progreso
  const [steps, setSteps] = useState<ProgressStep[]>([
    { label: 'Crear Película', endpoint: 'POST /movies', status: 'pending' },
    { label: 'Crear Actor Principal', endpoint: 'POST /actors', status: 'pending' },
    { label: 'Asignar Película al Actor', endpoint: 'POST /actors/:actorId/movies/:movieId', status: 'pending' },
    { label: 'Crear Premio', endpoint: 'POST /prizes', status: 'pending' },
    { label: 'Asignar Premio a la Película', endpoint: 'POST /movies/:movieId/prizes/:prizeId', status: 'pending' },
  ]);

  // Cargar géneros y directores del backend al iniciar
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [genresRes, directorsRes] = await Promise.all([
          fetch('/api/v1/genres'),
          fetch('/api/v1/directors'),
        ]);

        if (genresRes.ok) {
          const gList: Genre[] = await genresRes.json();
          setGenres(gList);
          if (gList.length > 0) {
            setMovieData((prev) => ({ ...prev, genreId: gList[0].id }));
          }
        }

        if (directorsRes.ok) {
          const dList: Director[] = await directorsRes.json();
          setDirectors(dList);
          if (dList.length > 0) {
            setMovieData((prev) => ({ ...prev, directorId: dList[0].id }));
          }
        }
      } catch (err) {
        console.warn('No se pudieron cargar géneros/directores iniciales:', err);
      } finally {
        setLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, []);

  const updateStepStatus = (index: number, status: 'pending' | 'loading' | 'success' | 'error', detail?: string) => {
    setSteps((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], status, detail };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setGlobalError(null);

    // Reiniciar estados de pasos
    setSteps([
      { label: 'Crear Película', endpoint: 'POST /movies', status: 'pending' },
      { label: 'Crear Actor Principal', endpoint: 'POST /actors', status: 'pending' },
      { label: 'Asignar Película al Actor', endpoint: 'POST /actors/:actorId/movies/:movieId', status: 'pending' },
      { label: 'Crear Premio', endpoint: 'POST /prizes', status: 'pending' },
      { label: 'Asignar Premio a la Película', endpoint: 'POST /movies/:movieId/prizes/:prizeId', status: 'pending' },
    ]);

    try {
      // 0. Garantizar YouTube Trailer para la película (requisito de integridad de la base de datos BackArte7)
      let trailerId = '';
      try {
        const trailerRes = await fetch('/api/v1/youtube-trailers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Trailer Oficial - ${movieData.title}`,
            url: movieData.trailerUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 3,
            channel: 'Canal Oficial de Distribución',
          }),
        });
        if (trailerRes.ok) {
          const trailerObj = await trailerRes.json();
          trailerId = trailerObj.id;
        }
      } catch (e) {
        console.warn('Creación de trailer falló o no fue necesaria:', e);
      }

      // Paso 1: Crear película: "/movies"
      updateStepStatus(0, 'loading', 'Enviando petición POST a /api/v1/movies...');
      const moviePayload = {
        title: movieData.title,
        poster: movieData.poster,
        duration: Number(movieData.duration),
        country: movieData.country,
        releaseDate: new Date(movieData.releaseDate).toISOString(),
        popularity: Number(movieData.popularity),
        genre: { id: movieData.genreId || (genres[0]?.id) },
        director: { id: movieData.directorId || (directors[0]?.id) },
        youtubeTrailer: { id: trailerId },
      };

      const movieRes = await fetch('/api/v1/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(moviePayload),
      });

      if (!movieRes.ok) {
        const errData = await movieRes.json();
        throw new Error(`Error en Paso 1 (Crear Película): ${errData.message || movieRes.statusText}`);
      }

      const createdMovie = await movieRes.json();
      const movieId = createdMovie.id;
      setCreatedMovieId(movieId);
      updateStepStatus(0, 'success', `Película creada con ID: ${movieId.substring(0, 8)}...`);

      // Paso 2: Crear actor: "/actors"
      updateStepStatus(1, 'loading', 'Enviando petición POST a /api/v1/actors...');
      const actorPayload = {
        name: actorData.name,
        photo: actorData.photo,
        nationality: actorData.nationality,
        birthDate: new Date(actorData.birthDate).toISOString(),
        biography: actorData.biography || `Actor principal de la película ${movieData.title}.`,
      };

      const actorRes = await fetch('/api/v1/actors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actorPayload),
      });

      if (!actorRes.ok) {
        const errData = await actorRes.json();
        throw new Error(`Error en Paso 2 (Crear Actor): ${errData.message || actorRes.statusText}`);
      }

      const createdActor = await actorRes.json();
      const actorId = createdActor.id;
      updateStepStatus(1, 'success', `Actor creado con ID: ${actorId.substring(0, 8)}...`);

      // Paso 3: Asignar película al actor: "/actors/:actorId/movies/:movieId"
      updateStepStatus(2, 'loading', `Asociando película ${movieId.substring(0, 6)} al actor ${actorId.substring(0, 6)}...`);
      const assignMovieRes = await fetch(`/api/v1/actors/${actorId}/movies/${movieId}`, {
        method: 'POST',
      });

      if (!assignMovieRes.ok) {
        const errData = await assignMovieRes.json();
        throw new Error(`Error en Paso 3 (Asignar Película a Actor): ${errData.message || assignMovieRes.statusText}`);
      }

      updateStepStatus(2, 'success', 'Película asignada exitosamente al actor principal');

      // Paso 4: Crear premio: "/prizes"
      updateStepStatus(3, 'loading', 'Enviando petición POST a /api/v1/prizes...');
      const prizePayload = {
        name: prizeData.name,
        category: prizeData.category,
        year: Number(prizeData.year),
        status: prizeData.status,
      };

      const prizeRes = await fetch('/api/v1/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prizePayload),
      });

      if (!prizeRes.ok) {
        const errData = await prizeRes.json();
        throw new Error(`Error en Paso 4 (Crear Premio): ${errData.message || prizeRes.statusText}`);
      }

      const createdPrize = await prizeRes.json();
      const prizeId = createdPrize.id;
      updateStepStatus(3, 'success', `Premio creado con ID: ${prizeId.substring(0, 8)}...`);

      // Paso 5: Asignar premio a la película: "/movies/:movieId/prizes/:prizeId"
      updateStepStatus(4, 'loading', `Asociando premio ${prizeId.substring(0, 6)} a la película ${movieId.substring(0, 6)}...`);
      const assignPrizeRes = await fetch(`/api/v1/movies/${movieId}/prizes/${prizeId}`, {
        method: 'POST',
      });

      if (!assignPrizeRes.ok) {
        const errData = await assignPrizeRes.json();
        throw new Error(`Error en Paso 5 (Asignar Premio a Película): ${errData.message || assignPrizeRes.statusText}`);
      }

      updateStepStatus(4, 'success', 'Premio asignado exitosamente a la película');

      // Esperar brevemente para mostrar la finalización de los pasos y redirigir
      setTimeout(() => {
        router.push(`/movies/${movieId}`);
      }, 1200);

    } catch (error: any) {
      console.error('Error durante la creación coordinada:', error);
      setGlobalError(error.message || 'Ocurrió un error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '960px' }}>
      {/* Navegación y Título */}
      <div className="mb-4">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/movies">Películas</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Crear Película</li>
          </ol>
        </nav>
        <h1 className="h2 fw-bold text-dark">🎬 Creación de Película, Actor y Premio</h1>
        <p className="text-muted">
          Este formulario crea las entidades por separado y las asocia mediante los endpoints correspondientes según las instrucciones de la <strong>Parte 2</strong>.
        </p>
      </div>

      {/* Alerta de Error Global */}
      {globalError && (
        <div className="alert alert-danger shadow-sm alert-dismissible fade show" role="alert">
          <h5 className="alert-heading fw-bold">⚠️ Ocurrió un error en el proceso:</h5>
          <p className="mb-0">{globalError}</p>
          <button type="button" className="btn-close" onClick={() => setGlobalError(null)} aria-label="Close"></button>
        </div>
      )}

      {/* Visualizador de Progreso durante o después del Submit */}
      {(submitting || steps.some((s) => s.status !== 'pending')) && (
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-header bg-dark text-white py-3">
            <h5 className="mb-0 fw-bold">
              {submitting ? '⏳ Ejecutando Pasos de Creación y Asociación...' : '📋 Resultado de los Pasos:'}
            </h5>
          </div>
          <div className="card-body p-4">
            <div className="list-group list-group-flush">
              {steps.map((step, idx) => (
                <div key={idx} className="list-group-item d-flex align-items-center justify-content-between py-3">
                  <div className="d-flex align-items-center gap-3">
                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-bold">
                      Paso {idx + 1}
                    </span>
                    <div>
                      <div className="fw-semibold text-dark">{step.label}</div>
                      <div className="text-muted small">
                        <code>{step.endpoint}</code>
                        {step.detail && <span className="ms-2 text-secondary">• {step.detail}</span>}
                      </div>
                    </div>
                  </div>
                  <div>
                    {step.status === 'pending' && <span className="badge bg-secondary">Pendiente</span>}
                    {step.status === 'loading' && (
                      <span className="badge bg-primary d-flex align-items-center gap-1">
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        Ejecutando...
                      </span>
                    )}
                    {step.status === 'success' && <span className="badge bg-success">✓ Completado</span>}
                    {step.status === 'error' && <span className="badge bg-danger">✕ Error</span>}
                  </div>
                </div>
              ))}
            </div>

            {createdMovieId && steps[4].status === 'success' && (
              <div className="alert alert-success mt-3 mb-0 d-flex justify-content-between align-items-center">
                <span>🎉 ¡Todas las entidades y asociaciones se crearon exitosamente! Redirigiendo al detalle...</span>
                <Link href={`/movies/${createdMovieId}`} className="btn btn-sm btn-success fw-bold">
                  Ver Película Ahora →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Formulario Principal */}
      <form onSubmit={handleSubmit} className="needs-validation">
        {/* SECCIÓN 1: Información de la Película */}
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-header bg-primary text-white py-3">
            <h4 className="mb-0 fw-bold">1. 🎥 Información de la Película</h4>
            <small className="text-white-50">Se enviará a: <code>POST /movies</code></small>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Título */}
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold">Título de la Película *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Interstellar, El Laberinto del Fauno"
                  required
                  value={movieData.title}
                  onChange={(e) => setMovieData({ ...movieData, title: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* País */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">País de Origen *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Colombia, Estados Unidos"
                  required
                  value={movieData.country}
                  onChange={(e) => setMovieData({ ...movieData, country: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* URL del Póster */}
              <div className="col-12">
                <label className="form-label fw-semibold">URL del Póster *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://ejemplo.com/poster.jpg"
                  required
                  value={movieData.poster}
                  onChange={(e) => setMovieData({ ...movieData, poster: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Duración */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Duración (minutos) *</label>
                <input
                  type="number"
                  min="1"
                  className="form-control"
                  required
                  value={movieData.duration}
                  onChange={(e) => setMovieData({ ...movieData, duration: Number(e.target.value) })}
                  disabled={submitting}
                />
              </div>

              {/* Fecha de Lanzamiento */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Fecha de Lanzamiento *</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={movieData.releaseDate}
                  onChange={(e) => setMovieData({ ...movieData, releaseDate: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Popularidad */}
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Popularidad (1 a 100) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="form-control"
                  required
                  value={movieData.popularity}
                  onChange={(e) => setMovieData({ ...movieData, popularity: Number(e.target.value) })}
                  disabled={submitting}
                />
              </div>

              {/* Género */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Género Cinematográfico *</label>
                <select
                  className="form-select"
                  value={movieData.genreId}
                  onChange={(e) => setMovieData({ ...movieData, genreId: e.target.value })}
                  disabled={submitting || loadingMetadata}
                  required
                >
                  {genres.length > 0 ? (
                    genres.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.type}
                      </option>
                    ))
                  ) : (
                    <option value="">Cargando géneros...</option>
                  )}
                </select>
              </div>

              {/* Director */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Director *</label>
                <select
                  className="form-select"
                  value={movieData.directorId}
                  onChange={(e) => setMovieData({ ...movieData, directorId: e.target.value })}
                  disabled={submitting || loadingMetadata}
                  required
                >
                  {directors.length > 0 ? (
                    directors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.nationality || 'Cineasta'})
                      </option>
                    ))
                  ) : (
                    <option value="">Cargando directores...</option>
                  )}
                </select>
              </div>

              {/* URL Trailer */}
              <div className="col-12">
                <label className="form-label fw-semibold">Trailer Oficial de YouTube (URL)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={movieData.trailerUrl}
                  onChange={(e) => setMovieData({ ...movieData, trailerUrl: e.target.value })}
                  disabled={submitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: Actor Principal */}
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-header bg-dark text-white py-3">
            <h4 className="mb-0 fw-bold">2. 🎭 Actor Principal</h4>
            <small className="text-white-50">Se creará en <code>POST /actors</code> y se asociará en <code>POST /actors/:actorId/movies/:movieId</code></small>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Nombre del Actor */}
              <div className="col-12 col-md-7">
                <label className="form-label fw-semibold">Nombre del Actor Principal *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Pedro Pascal, Penélope Cruz"
                  required
                  value={actorData.name}
                  onChange={(e) => setActorData({ ...actorData, name: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Nacionalidad */}
              <div className="col-12 col-md-5">
                <label className="form-label fw-semibold">Nacionalidad *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Chilena, Española, Colombiana"
                  required
                  value={actorData.nationality}
                  onChange={(e) => setActorData({ ...actorData, nationality: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Foto del Actor */}
              <div className="col-12 col-md-7">
                <label className="form-label fw-semibold">Foto del Actor (URL) *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://ejemplo.com/actor.jpg"
                  required
                  value={actorData.photo}
                  onChange={(e) => setActorData({ ...actorData, photo: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Fecha de Nacimiento */}
              <div className="col-12 col-md-5">
                <label className="form-label fw-semibold">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={actorData.birthDate}
                  onChange={(e) => setActorData({ ...actorData, birthDate: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Biografía */}
              <div className="col-12">
                <label className="form-label fw-semibold">Biografía del Actor *</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Breve trayectoria, premios y reconocimientos..."
                  required
                  value={actorData.biography}
                  onChange={(e) => setActorData({ ...actorData, biography: e.target.value })}
                  disabled={submitting}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: Premio para la Película */}
        <div className="card shadow-sm border-0 mb-4 bg-white">
          <div className="card-header bg-warning text-dark py-3">
            <h4 className="mb-0 fw-bold">3. 🏆 Premio para la Película</h4>
            <small className="text-dark">Se creará en <code>POST /prizes</code> y se asociará en <code>POST /movies/:movieId/prizes/:prizeId</code></small>
          </div>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Nombre del Premio */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Nombre del Premio *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Premio Óscar, Palma de Oro, Goya"
                  required
                  value={prizeData.name}
                  onChange={(e) => setPrizeData({ ...prizeData, name: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Categoría */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Categoría *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Mejor Película, Mejor Guion, Mejor Fotografía"
                  required
                  value={prizeData.category}
                  onChange={(e) => setPrizeData({ ...prizeData, category: e.target.value })}
                  disabled={submitting}
                />
              </div>

              {/* Año */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Año del Premio *</label>
                <input
                  type="number"
                  min="1900"
                  max="2099"
                  className="form-control"
                  required
                  value={prizeData.year}
                  onChange={(e) => setPrizeData({ ...prizeData, year: Number(e.target.value) })}
                  disabled={submitting}
                />
              </div>

              {/* Estado (Ganador / Nominado) */}
              <div className="col-12 col-md-6">
                <label className="form-label fw-semibold">Resultado / Estado *</label>
                <select
                  className="form-select"
                  value={prizeData.status}
                  onChange={(e) => setPrizeData({ ...prizeData, status: e.target.value as 'won' | 'nominated' })}
                  disabled={submitting}
                  required
                >
                  <option value="won">🏆 Ganador (Won)</option>
                  <option value="nominated">🎖️ Nominado (Nominated)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="d-flex justify-content-end gap-3 mb-5">
          <Link href="/movies" className="btn btn-outline-secondary px-4 py-2" tabIndex={submitting ? -1 : 0}>
            Cancelar
          </Link>
          <button
            type="submit"
            className="btn btn-primary px-5 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Procesando Entidades y Asociaciones...</span>
              </>
            ) : (
              <>
                <span>🚀 Crear Película Completa</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
