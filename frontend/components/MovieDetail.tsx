'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Movie, Prize } from '../types/movie';
import { normalizePosterUrl, getMoviePosterFallbackSvg, normalizePhotoUrl } from '../utils/imageHelper';

interface MovieDetailProps {
  movieId: string;
}

export const MovieDetail: React.FC<MovieDetailProps> = ({ movieId }) => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMovieDetail();
  }, [movieId]);

  const fetchMovieDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const [movieRes, prizesRes] = await Promise.all([
        fetch(`/api/v1/movies/${movieId}`, { cache: 'no-store' }),
        fetch(`/api/v1/movies/${movieId}/prizes`, { cache: 'no-store' }),
      ]);

      if (!movieRes.ok) {
        throw new Error(`Película no encontrada (Error ${movieRes.status})`);
      }

      const movieData: Movie = await movieRes.json();
      setMovie(movieData);

      if (prizesRes.ok) {
        const prizesData: Prize[] = await prizesRes.json();
        setPrizes(Array.isArray(prizesData) ? prizesData : []);
      }
    } catch (err: any) {
      console.error('Error al cargar detalle de película:', err);
      setError(err.message || 'No se pudo cargar la información de la película.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No especificada';
    try {
      const d = new Date(dateString);
      return isNaN(d.getTime()) ? dateString : d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" style={{ width: '3.5rem', height: '3.5rem' }} role="status">
          <span className="visually-hidden">Cargando película...</span>
        </div>
        <p className="text-muted mt-3 fs-5">Cargando todos los atributos de la película y su elenco...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5">
        <div className="card shadow-sm border-0 text-center py-5">
          <div className="card-body">
            <span style={{ fontSize: '4rem' }}>⚠️</span>
            <h3 className="mt-3 fw-bold text-danger">No se pudo encontrar la película</h3>
            <p className="text-muted">{error || 'El identificador proporcionado no corresponde a ninguna película registrada.'}</p>
            <Link href="/movies" className="btn btn-primary mt-3">
              ← Volver al Listado de Películas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb de navegación */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/movies">Películas</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{movie.title}</li>
        </ol>
      </nav>

      {/* HERO / Encabezado Principal */}
      <div className="card shadow-sm border-0 mb-4 overflow-hidden bg-white">
        <div className="card-body p-4 p-lg-5">
          <div className="row g-4 align-items-center">
            {/* Póster */}
            <div className="col-12 col-md-4 col-lg-3 text-center">
              <div className="shadow-lg rounded-3 overflow-hidden d-inline-block bg-dark" style={{ maxWidth: '280px', width: '100%' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizePosterUrl(movie.poster, movie.title)}
                  alt={movie.title}
                  className="w-100 h-auto object-fit-cover"
                  style={{ minHeight: '360px', maxHeight: '420px' }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getMoviePosterFallbackSvg(movie.title);
                  }}
                />
              </div>
            </div>

            {/* Información Resumida */}
            <div className="col-12 col-md-8 col-lg-9">
              <div className="d-flex flex-wrap gap-2 mb-2">
                {movie.genre?.type && (
                  <span className="badge bg-primary px-3 py-2 fs-6">
                    {movie.genre.type}
                  </span>
                )}
                {movie.popularity !== undefined && (
                  <span className="badge bg-warning text-dark px-3 py-2 fs-6 fw-bold">
                    ⭐ Popularidad: {movie.popularity} / 100
                  </span>
                )}
                <span className="badge bg-secondary px-3 py-2 fs-6">
                  ⏱️ {movie.duration} min
                </span>
                <span className="badge bg-info text-dark px-3 py-2 fs-6">
                  🌍 {movie.country}
                </span>
              </div>

              <h1 className="display-5 fw-bold text-dark mb-3">{movie.title}</h1>

              <p className="text-muted fs-5 mb-4">
                <strong>Fecha de Lanzamiento:</strong> {formatDate(movie.releaseDate)}
              </p>

              {/* Botón Trailer */}
              {movie.youtubeTrailer?.url && (
                <div className="mb-4">
                  <a
                    href={movie.youtubeTrailer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-danger btn-lg d-inline-flex align-items-center gap-2 shadow-sm"
                  >
                    <span>▶</span>
                    <span>Ver Trailer Oficial ({movie.youtubeTrailer.name || 'YouTube'})</span>
                  </a>
                  {movie.youtubeTrailer.channel && (
                    <span className="ms-3 text-muted small">Canal: {movie.youtubeTrailer.channel}</span>
                  )}
                </div>
              )}

              <div className="d-flex gap-2">
                <Link href="/movies" className="btn btn-outline-secondary">
                  ← Volver a Películas
                </Link>
                <Link href="/movies/crear" className="btn btn-outline-primary">
                  ➕ Crear Otra Película
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DETALLES Y ATRIBUTOS */}
      <div className="row g-4 mb-5">
        {/* Atributos Generales y Director */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-header bg-dark text-white py-3">
              <h5 className="mb-0 fw-bold">📋 Ficha Técnica y Atributos</h5>
            </div>
            <div className="card-body p-4">
              <table className="table table-borderless mb-0">
                <tbody>
                  <tr>
                    <th scope="row" className="text-muted" style={{ width: '40%' }}>ID del Sistema:</th>
                    <td className="text-break"><small className="text-secondary">{movie.id}</small></td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-muted">Título Oficial:</th>
                    <td className="fw-semibold text-dark">{movie.title}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-muted">Duración:</th>
                    <td>{movie.duration} minutos ({Math.floor(movie.duration / 60)}h {movie.duration % 60}m)</td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-muted">País:</th>
                    <td>{movie.country}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-muted">Fecha de Estreno:</th>
                    <td>{formatDate(movie.releaseDate)}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-muted">Puntaje de Popularidad:</th>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" style={{ height: '8px' }}>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: `${Math.min(movie.popularity, 100)}%` }}
                          ></div>
                        </div>
                        <span className="fw-bold">{movie.popularity}%</span>
                      </div>
                    </td>
                  </tr>
                  {movie.genre && (
                    <tr>
                      <th scope="row" className="text-muted">Género:</th>
                      <td><span className="badge bg-primary">{movie.genre.type}</span></td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Director / Autor */}
              {movie.director && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-3">🎬 Director / Autor</h6>
                  <div className="d-flex align-items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizePhotoUrl(movie.director.photo, movie.director.name)}
                      alt={movie.director.name}
                      className="rounded-circle object-fit-cover shadow-sm"
                      style={{ width: '60px', height: '60px' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0 text-dark">{movie.director.name}</h6>
                      <small className="text-muted d-block">{movie.director.nationality || 'Cineasta'}</small>
                      {movie.director.biography && (
                        <small className="text-secondary text-truncate d-block mt-1" style={{ maxWidth: '350px' }}>
                          {movie.director.biography}
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Plataformas */}
              {movie.platforms && movie.platforms.length > 0 && (
                <div className="mt-4 pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-2">📺 Plataformas Disponibles</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {movie.platforms.map((p) => (
                      <span key={p.id} className="badge bg-light text-dark border px-3 py-2">
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premios y Reseñas */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100 bg-white">
            <div className="card-header bg-warning text-dark py-3">
              <h5 className="mb-0 fw-bold">🏆 Premios y Galardones ({prizes.length})</h5>
            </div>
            <div className="card-body p-4">
              {prizes.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <span style={{ fontSize: '2.5rem' }}>🎖️</span>
                  <p className="mt-2 mb-0">Esta película no tiene premios registrados actualmente.</p>
                </div>
              ) : (
                <div className="list-group list-group-flush mb-4">
                  {prizes.map((prize) => (
                    <div key={prize.id} className="list-group-item px-0 py-3 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                          <span>🏆</span>
                          <span>{prize.name}</span>
                        </h6>
                        <small className="text-muted">
                          Categoría: <strong>{prize.category}</strong> • Año: <strong>{prize.year}</strong>
                        </small>
                      </div>
                      <span className={`badge ${prize.status === 'won' ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2`}>
                        {prize.status === 'won' ? '✓ Ganador' : 'Nominado'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reseñas */}
              {movie.reviews && movie.reviews.length > 0 && (
                <div className="pt-3 border-top">
                  <h6 className="fw-bold text-dark mb-3">💬 Reseñas y Críticas ({movie.reviews.length})</h6>
                  <div className="d-flex flex-column gap-3">
                    {movie.reviews.map((rev) => (
                      <div key={rev.id} className="card bg-light border-0 p-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-dark small">{rev.creator}</strong>
                          <span className="badge bg-primary">⭐ {rev.score} / 5</span>
                        </div>
                        <p className="mb-0 text-secondary small fst-italic">&ldquo;{rev.text}&rdquo;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN ESPECÍFICA REQUERIDA: LISTADO DE AUTORES / ACTORES */}
      <div className="card shadow-sm border-0 mb-5 bg-white">
        <div className="card-header bg-primary text-white py-3 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0 fw-bold">🎭 Listado de Autores / Actores</h4>
            <small className="text-white-50">Elenco principal y autores asociados a esta película</small>
          </div>
          <span className="badge bg-light text-primary px-3 py-2 fw-bold fs-6">
            {movie.actors?.length || 0} {movie.actors?.length === 1 ? 'actor' : 'actores'}
          </span>
        </div>

        <div className="card-body p-4">
          {!movie.actors || movie.actors.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <span style={{ fontSize: '3.5rem' }}>🎭</span>
              <h5 className="mt-3 fw-bold">No hay actores asociados a esta película</h5>
              <p className="mb-0">
                Puedes registrar un actor y asociarlo mediante la pantalla de <strong>Crear Película</strong>.
              </p>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {movie.actors.map((actor) => (
                <div key={actor.id} className="col">
                  <div className="card h-100 border shadow-sm rounded-3 overflow-hidden">
                    {/* Foto del Actor */}
                    <div className="position-relative bg-light text-center" style={{ height: '220px', overflow: 'hidden' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={normalizePhotoUrl(actor.photo, actor.name)}
                        alt={actor.name}
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = normalizePhotoUrl('', actor.name);
                        }}
                      />
                      <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark bg-opacity-75 text-white">
                        {actor.nationality}
                      </span>
                    </div>

                    {/* Datos del Actor */}
                    <div className="card-body p-3 d-flex flex-column">
                      <h5 className="card-title fw-bold text-dark mb-1">{actor.name}</h5>
                      <p className="text-muted small mb-2">
                        📅 Nacimiento: {formatDate(actor.birthDate)}
                      </p>
                      <p className="card-text text-secondary small line-clamp-3 flex-grow-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {actor.biography || 'Sin biografía disponible para este actor.'}
                      </p>
                      <div className="mt-3 pt-2 border-top">
                        <Link href="/actors" className="btn btn-outline-secondary btn-sm w-100">
                          Ver en Catálogo de Actores →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
