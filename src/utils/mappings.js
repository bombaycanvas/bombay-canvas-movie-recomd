const GENRE_MAP = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  science_fiction: 878,
  thriller: 53,
  war: 10752,
};

// Only the genres where TV uses a different ID than movies
const TV_GENRE_OVERRIDE = {
  action: 10759,
  adventure: 10759,
  fantasy: 10765,
  science_fiction: 10765,
  war: 10768,
  horror: 9648,
};

const LANGUAGE_MAP = {
  english: "en",
  hindi: "hi",
  japanese: "ja",
  korean: "ko",
  spanish: "es",
};

module.exports = { GENRE_MAP, TV_GENRE_OVERRIDE, LANGUAGE_MAP };