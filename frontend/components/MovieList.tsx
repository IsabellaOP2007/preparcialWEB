'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Movie, Prize } from '../types/movie';
import { normalizePosterUrl, getMoviePosterFallbackSvg } from '../utils/imageHelper';

export const MovieList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterWithPrizes, setFilterWithPrizes] = useState<boolean>(false);

  useEffect(() => {
    fetchMoviesWithPrizes();
  }, []);

  const fetchMoviesWithPrizes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Optimizamos: solo 2 llamadas en paralelo en lugar de 100 llamadas individuales
      const [moviesRes, prizesRes] = await Promise.all([
        fetch('/api/v1/movies', { cache: 'no-store' }),
        fetch('/api/v1/prizes', { cache: 'no-store' }).catch(() => null),
      ]);

      if (!moviesRes.ok) {
        throw new Error(`Error ${moviesRes.status}: ${moviesRes.statusText}`);
      }

      const moviesData: Movie[] = await moviesRes.json();

      // Mapear los premios a sus respectivas películas
      let prizesMap: Record<string, Prize[]> = {};
      if (prizesRes && prizesRes.ok) {
        const prizesData = await prizesRes.json();
        if (Array.isArray(prizesData)) {
          prizesData.forEach((prize: any) => {
            if (Array.isArray(prize.movies)) {
              prize.movies.forEach((m: any) => {
                if (!prizesMap[m.id]) {
                  prizesMap[m.id] = [];
                }
                prizesMap[m.id].push({
                  id: prize.id,
                  name: prize.name,
                  category: prize.category,
                  year: prize.year,
                  status: prize.status,
                });
              });
            }
          });
        }
      }

      // Enriquecer cada película instantáneamente en memoria
      const enrichedMovies = moviesData.map((movie) => ({
        ...movie,
        prizes: prizesMap[movie.id] || movie.prizes || [],
      }));

      setMovies(enrichedMovies);
    } catch (err: any) {
      console.error('Error al cargar películas:', err);
      setError('No se pudieron cargar las películas desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      const matchSearch =
        movie.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.director?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movie.actors?.some((a) => a.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        movie.prizes?.some((p) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterWithPrizes) {
        return matchSearch && movie.prizes && movie.prizes.length > 0;
      }
      return matchSearch;
    });
  }, [movies, searchTerm, filterWithPrizes]);

  // Formato amigable de fecha
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

  return (
    <div className="container py-4">
      {/* Encabezado */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 className="h2 fw-bold text-dark mb-1">🎥 Listado de Películas</h1>
          <p className="text-muted mb-0">
            Explora las películas del sistema, sus autores, actores y premios reconocidos.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/movies/crear" className="btn btn-primary d-flex align-items-center gap-2 shadow-sm">
            <span>➕</span>
            <span>Crear Película</span>
          </Link>
          <button
            onClick={fetchMoviesWithPrizes}
            className="btn btn-outline-secondary"
            title="Recargar lista"
            disabled={loading}
          >
            🔄 Recargar
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="card shadow-sm border-0 mb-4 bg-white">
        <div className="card-body p-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">🔍</span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar por título, autor, actor o premio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="col-12 col-md-4 d-flex justify-content-md-end align-items-center gap-2">
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="filterPrizesSwitch"
                  checked={filterWithPrizes}
                  onChange={(e) => setFilterWithPrizes(e.target.checked)}
                />
                <label className="form-check-label small" htmlFor="filterPrizesSwitch">
                  Solo con Premios 🏆
                </label>
              </div>
              <span className="badge bg-secondary">
                {filteredMovies.length} {filteredMovies.length === 1 ? 'película' : 'películas'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de Error */}
      {error && (
        <div className="alert alert-danger shadow-sm d-flex align-items-center justify-content-between" role="alert">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button onClick={fetchMoviesWithPrizes} className="btn btn-sm btn-outline-danger">
            Reintentar
          </button>
        </div>
      )}

      {/* Spinner de Carga */}
      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando películas...</span>
          </div>
          <p className="text-muted mt-3">Obteniendo catálogo de películas y premios...</p>
        </div>
      )}

      {/* Sin Resultados */}
      {!loading && filteredMovies.length === 0 && (
        <div className="card border-0 shadow-sm text-center py-5">
          <div className="card-body">
            <span style={{ fontSize: '3.5rem' }}>🎬</span>
            <h4 className="mt-3 fw-bold">No se encontraron películas</h4>
            <p className="text-muted">
              {searchTerm || filterWithPrizes
                ? 'No hay películas que coincidan con los filtros seleccionados.'
                : 'Aún no hay películas registradas en el sistema.'}
            </p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              {(searchTerm || filterWithPrizes) && (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterWithPrizes(false);
                  }}
                >
                  Limpiar Filtros
                </button>
              )}
              <Link href="/movies/crear" className="btn btn-primary">
                Crear la primera película
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Cuadrícula de Películas */}
      {!loading && filteredMovies.length > 0 && (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {filteredMovies.map((movie) => {
            const primaryActor = movie.actors && movie.actors.length > 0 ? movie.actors[0].name : null;
            const primaryPrize = movie.prizes && movie.prizes.length > 0 ? movie.prizes[0] : null;

            return (
              <div key={movie.id} className="col">
                <div className="card h-100 shadow-sm border-0 position-relative d-flex flex-column overflow-hidden">
                  {/* Poster de la Película */}
                  <div className="position-relative bg-dark" style={{ height: '320px', overflow: 'hidden' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={normalizePosterUrl(movie.poster, movie.title)}
                      alt={movie.title}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getMoviePosterFallbackSvg(movie.title);
                      }}
                    />

                    {/* Badge de Popularidad / Género */}
                    <div className="position-absolute top-0 end-0 m-2 d-flex flex-column gap-1 align-items-end">
                      {movie.popularity !== undefined && (
                        <span className="badge bg-warning text-dark fw-bold shadow-sm">
                          ⭐ {movie.popularity}
                        </span>
                      )}
                      {movie.genre?.type && (
                        <span className="badge bg-dark bg-opacity-75 text-white shadow-sm">
                          {movie.genre.type}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cuerpo de la Tarjeta */}
                  <div className="card-body d-flex flex-column p-3">
                    {/* 1. Título */}
                    <h5 className="card-title fw-bold text-dark text-truncate mb-2" title={movie.title}>
                      {movie.title}
                    </h5>

                    {/* 2. Fecha de Lanzamiento */}
                    <div className="mb-2 text-muted small d-flex align-items-center gap-1">
                      <span>📅</span>
                      <span className="fw-semibold">Lanzamiento:</span>
                      <span>{formatDate(movie.releaseDate)}</span>
                    </div>

                    {/* 3. Nombre de un Autor / Actor (si tiene) */}
                    <div className="mb-2 small">
                      <div className="text-secondary d-flex align-items-center gap-1 text-truncate">
                        <span>🎭</span>
                        <span className="fw-semibold">Actor/Autor:</span>
                        <span className="text-dark fw-medium text-truncate">
                          {primaryActor || (movie.director?.name ? `${movie.director.name} (Director)` : 'Sin autor')}
                        </span>
                      </div>
                      {movie.director?.name && primaryActor && (
                        <div className="text-muted extra-small text-truncate ps-3" style={{ fontSize: '0.75rem' }}>
                          Dir: {movie.director.name}
                        </div>
                      )}
                    </div>

                    {/* 4. Nombre del Premio (si tiene) */}
                    <div className="mb-3 mt-auto">
                      {primaryPrize ? (
                        <div className="alert alert-warning py-1 px-2 mb-0 d-flex align-items-center gap-1 small text-truncate border-0 shadow-sm">
                          <span>🏆</span>
                          <span className="fw-bold text-truncate" title={`${primaryPrize.name} (${primaryPrize.year}) - ${primaryPrize.status === 'won' ? 'Ganador' : 'Nominado'}`}>
                            {primaryPrize.name}
                          </span>
                          <span className="badge bg-warning text-dark ms-auto" style={{ fontSize: '0.65rem' }}>
                            {primaryPrize.status === 'won' ? 'Ganó' : 'Nom'}
                          </span>
                        </div>
                      ) : (
                        <div className="text-muted small fst-italic">
                          <span>🏆 Sin premios registrados</span>
                        </div>
                      )}
                    </div>

                    {/* Botón Ver Detalle */}
                    <Link
                      href={`/movies/${movie.id}`}
                      className="btn btn-outline-primary btn-sm w-100 fw-semibold d-flex align-items-center justify-content-center gap-1 mt-2"
                    >
                      <span>Ver Detalle</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
