import { Actor } from './actor';

export interface Genre {
  id: string;
  type: string;
}

export interface Director {
  id: string;
  name: string;
  photo?: string;
  nationality?: string;
  birthDate?: string;
  biography?: string;
}

export interface YoutubeTrailer {
  id: string;
  name: string;
  url: string;
  duration?: number;
  channel?: string;
}

export interface Platform {
  id: string;
  name: string;
  url: string;
}

export interface Review {
  id: string;
  text: string;
  score: number;
  creator: string;
}

export interface Prize {
  id: string;
  name: string;
  category: string;
  year: number;
  status: 'won' | 'nominated' | string;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: string;
  popularity: number;
  director?: Director;
  actors?: Actor[];
  genre?: Genre;
  platforms?: Platform[];
  reviews?: Review[];
  youtubeTrailer?: YoutubeTrailer;
  prizes?: Prize[];
}

export interface CreateMovieDto {
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: string;
  popularity: number;
  genre: { id: string };
  director: { id: string };
  youtubeTrailer: { id: string };
}

export interface CreatePrizeDto {
  name: string;
  category: string;
  year: number;
  status: 'won' | 'nominated';
}
