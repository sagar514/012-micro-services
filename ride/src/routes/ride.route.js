const express = require("express");
const authMiddleare = require("../middleware/auth.middleware");
const rideController = require("../controllers/ride.controller");

const router = express.Router();

router.post("/create-ride", authMiddleare.userAuth, rideController.createRide);
router.put("/accept-ride", authMiddleare.captainAuth, rideController.acceptRide);

module.exports = router;