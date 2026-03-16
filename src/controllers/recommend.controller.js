
const { discoverContent, fetchInternalShows } = require("../services/tmdb.service");
const { calculateScore } = require("../services/scoring.service");
const { GENRE_MAP, LANGUAGE_MAP, VALID_MOODS } = require("../utils/mappings");
const { formatContent } = require("../utils/responseFormatter");
const { getUserStats } = require("../services/userStats.service");


const INTERNAL_INJECT_EVERY = 3;

async function recommend(req, res) {
  try {
    const {
      userId,
      types,
      genre,
      language,
      mood,
      page = 1,
      limit = 10,
    } = req.body;

    /* ---------------- VALIDATION ---------------- */

    if (!userId || !types || !Array.isArray(types) || types.length === 0) {
      return res.status(400).json({ error: "Invalid userId or types" });
    }

    
    if (!genre || !Array.isArray(genre) || genre.length === 0) {
      return res.status(400).json({ error: "Genres must be a non-empty array" });
    }

    if (!language) {
      return res.status(400).json({ error: "Language is required" });
    }
     

    // Just validate that the genre names exist in either map
const validGenres = genre.filter(g => GENRE_MAP[g.toLowerCase()]);

if (validGenres.length === 0) {
  return res.status(400).json({ error: "No valid genres provided" });
}
    
    // const genreIds = genre
    //   .map((g) => GENRE_MAP[g.toLowerCase()])
    //   .filter(Boolean);

    // if (genreIds.length === 0) {
    //   return res.status(400).json({ error: "No valid genres provided" });
    // }

    const languageCode = LANGUAGE_MAP[language.toLowerCase()];

    if (!languageCode) {
      return res.status(400).json({ error: "Invalid language" });
    }

    
    if (mood && VALID_MOODS && !VALID_MOODS.includes(mood.toLowerCase())) {
      return res.status(400).json({ error: `Invalid mood. Valid options: ${VALID_MOODS.join(", ")}` });
    }

    /* ---------------- USER BEHAVIOR ---------------- */

    const userStats = await getUserStats(userId);

    /* ---------------- FETCH EXTERNAL (TMDB) CONTENT ---------------- */

    
    // let externalContent = [];

    // for (const type of types) {
    //   const content = await discoverContent({
    //     type,
    //     genre: genreIds,
    //     language: languageCode,
    //   });

    //   externalContent.push(...content);
    // }

    
    // externalContent = externalContent.filter(
    //   (item) => item.original_language === languageCode
    // );

    const [internalShows, ...externalResults] = await Promise.all([
  fetchInternalShows(),
  ...types.map(type => discoverContent({ type, genreNames: genre, language: languageCode, page }))
]);

console.log("Raw results per type:", externalResults.map(r => r.length));
console.log("Sample TV item:", externalResults[0]?.[0]);

let externalContent = externalResults.flat();

console.log("Total before filter:", externalContent.length);
    /* ---------------- SCORE + RANK EXTERNAL CONTENT ONLY ---------------- */

    const rankedExternal = externalContent
      .map((item) => ({
        ...item,
        is_internal: false,
        score: calculateScore(
          item,
          { language: languageCode, mood: mood?.toLowerCase() ?? null },
          userStats
        ),
      }))
      .sort((a, b) => b.score - a.score);

    /* ---------------- FETCH INTERNAL SHOWS (PROMOTIONAL) ---------------- */

    
    // const internalShows = await fetchInternalShows();

    const internalPool = internalShows.map((show) => ({
      ...show,
      is_internal: true,
    }));

    /* ---------------- INTERLEAVE: inject 1 internal every N external ---------------- */

    const mixed = [];
    let internalIndex = 0;

    for (let i = 0; i < rankedExternal.length; i++) {
      mixed.push(rankedExternal[i]);

      
      if ((i + 1) % INTERNAL_INJECT_EVERY === 0 && internalPool.length > 0) {
        mixed.push(internalPool[internalIndex % internalPool.length]);
        internalIndex++;
      }
    }

    /* ---------------- PAGINATION ---------------- */

    const start = (page - 1) * limit;
    const end = start + limit;

    const paginatedData = mixed
      .slice(start, end)
      .map(formatContent);

    return res.json({
      page,
      limit,
      hasMore: end < mixed.length,
      total: mixed.length,
      data: paginatedData,
    });

  } catch (error) {
    console.error("Recommend API failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { recommend };