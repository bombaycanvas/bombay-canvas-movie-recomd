// src/utils/moodProfiles.js

const MOOD_PROFILES = {
  chill: {
    minRating: 6,
    popularityBias: 0.5,
  },
  feel_good: {
    minRating: 7,
    popularityBias: 0.8,
  },
  dark: {
    minRating: 7,
    popularityBias: 0.4,
  },
  intense: {
    minRating: 6.5,
    popularityBias: 0.7,
  },
  romantic: {
    minRating: 6.5,
    popularityBias: 0.6,
  },
};

module.exports = { MOOD_PROFILES };
