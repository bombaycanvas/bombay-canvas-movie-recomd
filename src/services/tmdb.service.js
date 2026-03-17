const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const tmdbCache = new Map();
const TMDB_CACHE_TTL = 10 * 60 * 1000;

const { GENRE_MAP, TV_GENRE_OVERRIDE } = require("../utils/mappings");

async function discoverContent({ type, genreNames, language, page = 1 }) {
  
  // Build a cache key from the exact params
  const cacheKey = `${type}-${genreNames.join(",")}-${language}-${page}`;
  const cached = tmdbCache.get(cacheKey);

  if (cached && (Date.now() - cached.fetchedAt) < TMDB_CACHE_TTL) {
    console.log("TMDB cache hit:", cacheKey);
    return cached.data;
  }
  
  
  
  try {
    
    const endpoint = type === "movie" ? "movie" : "tv";
    const isAnime = type === "anime";
    const isTv = type === "tv" || isAnime;

    // const genreMapKey = isAnime ? "tv" : type;
    const genreIds = genreNames
      .map(g => {
        const key = g.toLowerCase();
        // Use TV override if it exists for this genre, otherwise fall back to base map
        return isTv
          ? (TV_GENRE_OVERRIDE[key] ?? GENRE_MAP[key])
          : GENRE_MAP[key];
      })
      .filter(Boolean);

    const response = await axios.get(
      `${TMDB_BASE_URL}/discover/${endpoint}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,

          
          with_genres: genreIds?.join(","),

          
          language,

          
          with_original_language: isAnime ? "ja" : (type === "movie" ? language : undefined),

          sort_by: "popularity.desc",
          page,
        },
      }
    );

    // return response.data.results.map((item) => ({
    //   ...item,
    //   _contentType: type, 
    // }));

    const results = response.data.results.map(item => ({
      ...item,
      _contentType: type,
    }));

    // Store in cache
    tmdbCache.set(cacheKey, { data: results, fetchedAt: Date.now() });

    return results;

  } catch (error) {
    console.error(`TMDB discoverContent error [${type}]:`, error.message);
    return [];
  }
}


async function fetchInternalShows() {
  try {
    const response = await axios.get(
      "https://bombay-canvas-new-dev-v2-1018893063821.asia-south1.run.app/api/all-series"
    );

    if (!response.data?.series) return [];

    return response.data.series.map((show) => ({
      id: `internal-${show.id}`,
      title: show.title,
      name: show.title,             // TV shape compatibility
      overview: show.description,
      poster_path: show.posterUrl,
      is_full_poster: true,         // signals non-TMDB poster URL format
      original_language: "hi",      // default — API doesn't return this field

      
      vote_average: 7.5,
      popularity: 0,
      genre_ids: [],                // intentionally empty — genre match is skipped

      _contentType: show.isTV ? "tv" : "movie",
      is_internal: true,
    }));

  } catch (error) {
    console.error("Internal shows fetch error:", error.message);
    return [];
  }
}


async function getWatchProviders(type, id) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/${type}/${id}/watch/providers`,
      {
        params: { api_key: process.env.TMDB_API_KEY },
      }
    );

    return response.data.results?.IN || null;
  } catch (error) {
    console.error(`getWatchProviders error [${type}/${id}]:`, error.message);
    return null;
  }
}


async function getTrailer(type, id) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/${type}/${id}/videos`,
      {
        params: { api_key: process.env.TMDB_API_KEY },
      }
    );

    const trailer = response.data.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    return trailer
      ? `https://www.youtube.com/watch?v=${trailer.key}`
      : null;

  } catch (error) {
    console.error(`getTrailer error [${type}/${id}]:`, error.message);
    return null;
  }
}

module.exports = { discoverContent, fetchInternalShows, getWatchProviders, getTrailer };