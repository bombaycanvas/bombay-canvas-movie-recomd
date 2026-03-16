const axios = require("axios");

const TMDB_BASE_URL = "https://api.themoviedb.org/3";


async function discoverContent({ type, genreIds, language, page = 1 }) {
  try {
    
    const endpoint = type === "movie" ? "movie" : "tv";
    const isAnime = type === "anime";

    const response = await axios.get(
      `${TMDB_BASE_URL}/discover/${endpoint}`,
      {
        params: {
          api_key: process.env.TMDB_API_KEY,

          
          with_genres: genreIds?.join(","),

          
          language,

          
          with_original_language: isAnime ? "ja" : language,

          sort_by: "popularity.desc",
          page,
        },
      }
    );

    return response.data.results.map((item) => ({
      ...item,
      _contentType: type, 
    }));

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