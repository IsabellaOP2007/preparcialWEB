'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useActors } from '../context/ActorContext';

export const Navbar = () => {
  const pathname = usePathname();
  const { apiConnected } = useActors();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
      <div className="container">
        <Link href="/actors" className="navbar-brand fw-bold">
          🎭 CRUD Actores - Next.js
        </Link>
        <button
          className="navbar-toggler"
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
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                href="/actors"
                className={`nav-link ${pathname === '/actors' ? 'active fw-bold text-white' : ''}`}
              >
                Actores
              </Link>
            </li>
            <li className="nav-item">
              <Link
                href="/crear"
                className={`nav-link ${pathname === '/crear' ? 'active fw-bold text-white' : ''}`}
              >
                Crear Actor
              </Link>
            </li>
          </ul>
          <div className="d-flex align-items-center">
            {apiConnected ? (
              <span className="badge bg-success py-2 px-3">
                ● Backend API Conectado
              </span>
            ) : (
              <span className="badge bg-warning text-dark py-2 px-3" title="El servidor docker BackArte7 no está corriendo. Usando almacenamiento local en memoria.">
                ○ Modo Local (Sin Backend)
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
