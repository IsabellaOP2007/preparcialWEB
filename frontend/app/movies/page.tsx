import React from 'react';
import { MovieList } from '../../components/MovieList';

export const metadata = {
  title: 'Películas - Sistema CineArte7',
  description: 'Listado general de películas con sus autores y premios',
};

export default function MoviesPage() {
  return <MovieList />;
}
