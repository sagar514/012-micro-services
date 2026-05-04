const express = require("express");
const userController = require("../controllers/user.controllers");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", userController.logout);
router.get("/profile", authMiddleware.useAuth, userController.profile);
router.get('/accepted-ride',authMiddleware.useAuth, userController.acceptedRide);

module.exports = router;