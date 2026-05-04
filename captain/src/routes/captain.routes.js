const express = require("express");
const captainController = require("../controllers/captain.controllers");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", captainController.register);
router.post("/login", captainController.login);
router.get("/logout", captainController.logout);
router.get("/profile", authMiddleware.useAuth, captainController.profile);
router.put("/toggle-availability", authMiddleware.useAuth, captainController.toggleAvailability);
router.get('/new-ride', authMiddleware.useAuth, captainController.waitForNewRide);

module.exports = router;