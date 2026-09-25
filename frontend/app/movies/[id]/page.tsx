import React from 'react';
import { MovieDetail } from '../../../components/MovieDetail';

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'Detalle de Película - CineArte7',
  description: 'Detalle completo de la película, atributos y listado de actores',
};

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  return <MovieDetail movieId={params.id} />;
}
