const express = require("express");
const { trackEvent } = require("../controllers/event.controller");

const router = express.Router();

router.post("/", trackEvent);

module.exports = router;
