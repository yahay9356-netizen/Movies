import { Movie } from '../data/movies';

const BASE_URL = 'https://yts.gg/api/v2';

interface YtsMovie {
  id: number;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  like_count?: number;
  genres?: string[];
  large_cover_image?: string;
  medium_cover_image?: string;
  description_full?: string;
  summary?: string;
  large_screenshot_image1?: string;
  large_screenshot_image2?: string;
  large_screenshot_image3?: string;
  yt_trailer_code?: string;
  cast?: Array<{
    name: string;
    character_name: string;
    url_small_image?: string;
  }>;
}

function mapYtsMovie(m: YtsMovie): Movie {
  const screenshots = [
    m.large_screenshot_image1,
    m.large_screenshot_image2,
    m.large_screenshot_image3,
  ].filter((s): s is string => Boolean(s));

  return {
    id: String(m.id),
    title: m.title,
    year: m.year,
    rating: m.rating || 7.5,
    duration: m.runtime || 120,
    likes: m.like_count ?? 15,
    genres: m.genres && m.genres.length > 0 ? m.genres : ['Action'],
    poster: m.large_cover_image || m.medium_cover_image || '',
    screenshots,
    summary: m.description_full || m.summary || '',
    trailerCode: m.yt_trailer_code || undefined,
    cast: m.cast?.map((c) => ({
      name: c.name,
      character: c.character_name || 'Cast',
      avatar: c.url_small_image || '/assets/aistudio/0ecb0264ed6bae405d7a1f06d2b702842000ca23_69821f5d.png',
    })),
  };
}

export async function fetchYtsMovies(params?: {
  query?: string;
  genre?: string;
  limit?: number;
}): Promise<Movie[]> {
  const url = new URL(`${BASE_URL}/list_movies.json`);
  url.searchParams.set('limit', String(params?.limit ?? 20));
  if (params?.query) url.searchParams.set('query_term', params.query);
  if (params?.genre && params.genre !== 'All') {
    url.searchParams.set('genre', params.genre.toLowerCase());
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch movies');
  const json = await res.json();
  const list: YtsMovie[] = json?.data?.movies ?? [];
  return list.map(mapYtsMovie);
}

export async function fetchYtsMovieDetails(movieId: string): Promise<Movie | null> {
  const url = new URL(`${BASE_URL}/movie_details.json`);
  url.searchParams.set('movie_id', movieId);
  url.searchParams.set('with_images', 'true');
  url.searchParams.set('with_cast', 'true');

  const res = await fetch(url.toString());
  if (!res.ok) return null;
  const json = await res.json();
  const movie: YtsMovie | undefined = json?.data?.movie;
  return movie ? mapYtsMovie(movie) : null;
}

export async function fetchYtsSimilarMovies(movieId: string): Promise<Movie[]> {
  const url = new URL(`${BASE_URL}/movie_suggestions.json`);
  url.searchParams.set('movie_id', movieId);

  const res = await fetch(url.toString());
  if (!res.ok) return [];
  const json = await res.json();
  const list: YtsMovie[] = json?.data?.movies ?? [];
  return list.map(mapYtsMovie);
}
