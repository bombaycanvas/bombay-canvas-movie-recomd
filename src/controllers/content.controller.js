const { getWatchProviders, getTrailer } = require("../services/tmdb.service");

async function getContentDetails(req, res) {
  try {
    const { type, id } = req.params;

    // Internal show
   if (type === "internal") {
  // fetch internal show from client API again
  const response = await axios.get(
    "https://bombay-canvas-new-dev-v2-1018893063821.asia-south1.run.app/api/all-series"
  );

  const show = response.data.series.find(s => s.id === id);

  return res.json({
    trailer: show?.trailerUrl || null,
    watchProviders: {
      platform: "Bombay Canvas",
      inApp: true
    }
  });
}

    // TMDB content
    const [watchProviders, trailer] = await Promise.all([
      getWatchProviders(type, id),
      getTrailer(type, id)
    ]);

    return res.json({
      trailer,
      watchProviders
    });

  } catch (error) {
    console.error("Content details error:", error);
    return res.status(500).json({ error: "Failed to fetch content details" });
  }
}

module.exports = { getContentDetails };