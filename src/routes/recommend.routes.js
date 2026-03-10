const express = require("express");
const router = express.Router();
const { recommend } = require("../controllers/recommend.controller");

const { getContentDetails } = require("../controllers/content.controller");

router.get("/content/:type/:id", getContentDetails);

router.post("/", recommend);
// router.post("/event", trackEvent);

module.exports = router;
