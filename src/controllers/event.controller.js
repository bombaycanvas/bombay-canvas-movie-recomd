const Event = require("../models/event.model");

async function trackEvent(req, res) {
  try {
    const { userId, contentId, type, event, duration } = req.body;

    // Validation
    if (!userId || !contentId || !type || !event) {
      return res.status(400).json({
        error: "userId, contentId, type, and event are required",
      });
    }

    if (event === "watch_time" && typeof duration !== "number") {
      return res.status(400).json({
        error: "duration is required for watch_time event",
      });
    }

    // 🔥 THIS MUST MATCH THE SCHEMA EXACTLY
    await Event.create({
      userId,
      contentId,
      type,
      event,
      duration: duration || 0,
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Event tracking failed:", error);
    res.status(500).json({ error: "Failed to track event" });
  }
}

module.exports = { trackEvent };
