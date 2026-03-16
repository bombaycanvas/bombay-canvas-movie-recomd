const weights = require("../utils/weights");
const { MOOD_PROFILES } = require("../utils/moodProfiles");

/**
 * Calculate a relevance score for a single content item.
 *
 * @param {object} item      - TMDB (or internal) content object
 * @param {object} context   - Request-level context: { language, mood }
 * @param {object} userStats - User behavior data from getUserStats()
 * @returns {number} score
 */
function calculateScore(item, context = {}, userStats = {}) {
  let score = 0;

  const { language, mood } = context;

  const {
    likedGenres = [],
    skippedGenres = [],
    preferredLanguages = [],
    avgWatchTime = 0,
    skipRate = 0,
  } = userStats;

  const genreIds = (item.genre_ids || []).map(Number);

  /* ---------------- BASE SCORING (QUALITY) ---------------- */

  if (item.vote_average) {
    score += (item.vote_average / 10) * weights.RATING_WEIGHT;
  }

  if (item.popularity) {
    // Log scale prevents very popular titles from drowning out everything else.
    // log10(1000)=3, log10(10000)=4 — dividing by 5 keeps this in a 0–1 range
    // across the real TMDB popularity distribution.
    score += (Math.log10(Math.max(item.popularity, 1)) / 5) * weights.POPULARITY_WEIGHT;
  }

  /* ---------------- LANGUAGE PREFERENCE ---------------- */

  if (preferredLanguages.length && preferredLanguages.includes(item.original_language)) {
    // Learned preference from user history — strongest signal
    score += weights.LANGUAGE_MATCH;
  } else if (language && item.original_language === language) {
    // Matches the request language but not yet a learned preference
    score += weights.LANGUAGE_MATCH * 0.5;
  }

  /* ---------------- MOOD SCORING ---------------- */

  if (mood && MOOD_PROFILES[mood]) {
    const moodConfig = MOOD_PROFILES[mood];

    // Rating threshold for this mood
    if (item.vote_average >= moodConfig.minRating) {
      score += weights.MOOD_MATCH;
    }

    // Genre match for mood (e.g. "thrilling" → action/thriller genre IDs)
    // Add MOOD_GENRE_BOOST to your weights file if not already present
    if (moodConfig.preferredGenres?.length) {
      const moodGenreMatch = moodConfig.preferredGenres.some(g =>
        genreIds.includes(Number(g))
      );
      if (moodGenreMatch) score += weights.MOOD_GENRE_BOOST;
    }

    score += moodConfig.popularityBias * weights.MOOD_POPULARITY_BOOST;
  }

  /* ---------------- BEHAVIOR-BASED PERSONALIZATION ---------------- */

  // Boost for each genre the user has previously liked
  likedGenres.forEach((g) => {
    if (genreIds.includes(Number(g))) {
      score += weights.GENRE_LIKE_BOOST;
    }
  });

  // Penalty for each genre the user has previously skipped
  skippedGenres.forEach((g) => {
    if (genreIds.includes(Number(g))) {
      score -= weights.GENRE_SKIP_PENALTY;
    }
  });

  // Reward content that matches the user's typical session length
  if (avgWatchTime > 0) {
    score += Math.min(avgWatchTime / 30, 1) * weights.WATCH_TIME_BOOST;
  }

  // Penalize content for users who habitually skip — they're hard to satisfy
  if (skipRate > 0.4) {
    score -= weights.HIGH_SKIP_PENALTY;
  }

  return score;
}

module.exports = { calculateScore };