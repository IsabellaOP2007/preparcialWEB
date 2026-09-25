'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActors } from '../context/ActorContext';

export const Navbar = () => {
  const pathname = usePathname();
  const { apiConnected } = useActors();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top py-3">
      <div className="container">
        <Link href="/movies" className="navbar-brand fw-bold d-flex align-items-center gap-2">
          <span style={{ fontSize: '1.4rem' }}>🎬</span>
          <span className="fs-4 tracking-tight">CineArte7</span>
          <span className="navbar-brand-badge text-uppercase" style={{ fontSize: '0.65rem' }}>
            Next.js
          </span>
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-1">
            {/* Películas */}
            <li className="nav-item">
              <Link
                href="/movies"
                className={`nav-link d-flex align-items-center gap-1 ${
                  pathname === '/movies' ? 'active' : ''
                }`}
              >
                <span>🎥</span>
                <span>Películas</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/movies/crear"
                className={`nav-link d-flex align-items-center gap-1 ${
                  pathname === '/movies/crear' || pathname === '/crear-pelicula' ? 'active' : ''
                }`}
              >
                <span>➕</span>
                <span>Crear Película</span>
              </Link>
            </li>

            {/* Actores (Parte 1) */}
            <li className="nav-item ms-lg-2">
              <Link
                href="/actors"
                className={`nav-link d-flex align-items-center gap-1 ${
                  pathname === '/actors' ? 'active' : ''
                }`}
              >
                <span>🎭</span>
                <span>Actores</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/crear"
                className={`nav-link d-flex align-items-center gap-1 ${
                  pathname === '/crear' ? 'active' : ''
                }`}
              >
                <span>👤</span>
                <span>Crear Actor</span>
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            {apiConnected ? (
              <span className="badge rounded-pill bg-success bg-opacity-25 text-success border border-success border-opacity-50 py-2 px-3 d-flex align-items-center gap-2">
                <span className="spinner-grow spinner-grow-sm text-success" role="status" style={{ width: '8px', height: '8px' }}></span>
                <span className="fw-semibold">Backend Conectado</span>
              </span>
            ) : (
              <span className="badge rounded-pill bg-warning bg-opacity-25 text-warning border border-warning border-opacity-50 py-2 px-3 d-flex align-items-center gap-2">
                <span className="badge bg-warning rounded-circle p-1"></span>
                <span className="fw-semibold">Modo Local</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
