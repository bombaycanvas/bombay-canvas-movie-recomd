const weights = require("../utils/weights");
const { MOOD_PROFILES } = require("../utils/moodProfiles");

/**
 * item      -> TMDB content object
 * context   -> merged personalization context
 */
function calculateScore(item, context = {}) {
  let score = 0;

  const {
    language,
    mood,
    likedGenres = [],
    skippedGenres = [],
    preferredLanguages = [],
    avgWatchTime = 0,
    skipRate = 0
  } = context;

  const genreIds = (item.genre_ids || []).map(Number);

  /* ---------------- BASE SCORING (QUALITY) ---------------- */

  if (item.vote_average) {
    score += (item.vote_average / 10) * weights.RATING_WEIGHT;
  }

  if (item.popularity) {
    score += Math.min(item.popularity / 1000, 1) * weights.POPULARITY_WEIGHT;
  }

  /* ---------------- LANGUAGE PREFERENCE ---------------- */

  if (
    preferredLanguages.length &&
    preferredLanguages.includes(item.original_language)
  ) {
    score += weights.LANGUAGE_MATCH;
  } else if (language && item.original_language === language) {
    score += weights.LANGUAGE_MATCH * 0.5; // weaker than learned behavior
  }

  /* ---------------- MOOD SCORING ---------------- */

  if (mood && MOOD_PROFILES[mood]) {
    const moodConfig = MOOD_PROFILES[mood];

    if (item.vote_average >= moodConfig.minRating) {
      score += weights.MOOD_MATCH;
    }

    score += moodConfig.popularityBias * weights.MOOD_POPULARITY_BOOST;
  }

  /* ---------------- BEHAVIOR-BASED PERSONALIZATION ---------------- */

  // Boost liked genres
  likedGenres.forEach((g) => {
    if (genreIds.includes(Number(g))) {
      score += weights.GENRE_LIKE_BOOST;
    }
  });

  // Penalize skipped genres
  skippedGenres.forEach((g) => {
    if (genreIds.includes(Number(g))) {
      score -= weights.GENRE_SKIP_PENALTY;
    }
  });

  // Watch-time intent
  if (avgWatchTime > 0) {
    score += Math.min(avgWatchTime / 30, 1) * weights.WATCH_TIME_BOOST;
  }

  // Aggressive skipper penalty
  if (skipRate > 0.4) {
    score -= weights.HIGH_SKIP_PENALTY;
  }
  /* ---------------- INTERNAL CONTENT BOOST ---------------- */

// Only boost if it's Bombay Canvas content
if (item.is_internal) {

  // Safer multiplier (keeps personalization intact)
  score *= 1.10;

  // Optional: small base boost to ensure visibility
  // score += 1;
}

return score;
}

module.exports = { calculateScore };
