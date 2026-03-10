const Event = require("../models/event.model");

/**
 * Derives user preferences from interaction events
 * @param {string} userId
 */
async function getUserStats(userId) {
  if (!userId) {
    return {
      likedGenres: [],
      skippedGenres: [],
      preferredLanguages: [],
      avgWatchTime: 0,
      skipRate: 0
    };
  }

  // Fetch recent events only (performance-safe)
  const events = await Event.find({ userId })
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  if (!events.length) {
    return {
      likedGenres: [],
      skippedGenres: [],
      preferredLanguages: [],
      avgWatchTime: 0,
      skipRate: 0
    };
  }

  const genreWatchTime = {};
  const genreSkips = {};
  const languageCount = {};

  let totalWatchTime = 0;
  let watchCount = 0;
  let skipCount = 0;

  for (const e of events) {
    // Language preference
    if (e.language) {
      languageCount[e.language] =
        (languageCount[e.language] || 0) + 1;
    }

    // Genre-based logic
    if (e.genreId) {
      if (e.eventType === "watch_time") {
        genreWatchTime[e.genreId] =
          (genreWatchTime[e.genreId] || 0) + (e.duration || 0);

        totalWatchTime += e.duration || 0;
        watchCount++;
      }

      if (e.eventType === "skip") {
        genreSkips[e.genreId] =
          (genreSkips[e.genreId] || 0) + 1;
        skipCount++;
      }
    }
  }

  // Top liked genres
  const likedGenres = Object.entries(genreWatchTime)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genreId]) => Number(genreId));

  // Most skipped genres
  const skippedGenres = Object.entries(genreSkips)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([genreId]) => Number(genreId));

  // Preferred languages
  const preferredLanguages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([lang]) => lang);

  const avgWatchTime =
    watchCount > 0 ? totalWatchTime / watchCount : 0;

  const skipRate =
    events.length > 0 ? skipCount / events.length : 0;

  return {
    likedGenres,
    skippedGenres,
    preferredLanguages,
    avgWatchTime,
    skipRate
  };
}

module.exports = { getUserStats };
