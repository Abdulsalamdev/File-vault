// fileVault/api/routes/auth.routes.js
const express = require("express");
const AuthController = require("../controllers/auth_controller");
const authMiddleware = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { registerSchema, loginSchema  } = require("../../validators/authValidator");
const router = express.Router();

router.post("/register",validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema),AuthController.login);
router.post("/logout", authMiddleware, AuthController.logout);
router.get("/whoami", authMiddleware, AuthController.whoami);

module.exports = router;
