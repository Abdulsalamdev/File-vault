// fileVault/api/routes/auth.routes.js
const express = require("express");
const AuthController = require("../controllers/auth_controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/whoami", authMiddleware, AuthController.whoami);

module.exports = router;
