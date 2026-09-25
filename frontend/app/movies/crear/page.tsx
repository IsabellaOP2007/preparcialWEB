import React from 'react';
import { MovieForm } from '../../../components/MovieForm';

export const metadata = {
  title: 'Crear Película - CineArte7',
  description: 'Formulario de creación de película con actor principal y premio',
};

export default function CrearMoviePage() {
  return <MovieForm />;
}
