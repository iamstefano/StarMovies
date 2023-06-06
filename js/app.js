import { GetMovies } from "./utils/http.js";

// show movies
const BASE_URL = `https://api.themoviedb.org/3`;
const API_KEY = `07216a1a06f37360792e4611ca0c6c7c`;
const TRENDING_MOVIE = `${BASE_URL}/trending/all/week?api_key=${API_KEY}`;
const POPULAR_MOVIE = `${BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${API_KEY}`;
const RATED_MOVIE = `${BASE_URL}/movie/top_rated?api_key=${API_KEY}`;
const IMAGE_URL = `https://image.tmdb.org/t/p/w500`;
