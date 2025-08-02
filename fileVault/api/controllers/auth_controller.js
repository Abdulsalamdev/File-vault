// fileVault/api/controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const UserRepository = require("../../repositories/user_repository");
const SessionRepository = require("../../repositories/session_repository");
const logger = require("../../utils/logger");
const ActivityLogger = require("../../services/activity_logger");


const AuthController = {
  register: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Validate input
      if (!email || !password) {
        return res.status(400).json({ error: "Missing email or password" });
      }

      // 2. Check for existing user
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      // 3. Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4. Create user
      const user = await UserRepository.create({
        email,
        password: hashedPassword,
      });

      // 5. Return response (avoid sending password back!)
      return res.status(201).json({
        message: "User registered successfully",
        userId: user._id,
        email: user.email,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try{
 const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing credentials" });

    const user = await UserRepository.findByEmail(email);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid password" });

    const token = uuidv4();
    await SessionRepository.set(token, user._id.toString());

    ActivityLogger.log(user._id, "LOGIN");


    res.json({
      message: "Login successful",
      token,
      userId: user._id,
      email: user.email,
    });
    }
    catch (error) {
    ActivityLogger.error(null, "LOGIN_ERROR", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

logout: async (req, res) => {
  const token = req.token;
  const user = req.user; // ✅ Add this line

  await SessionRepository.del(token);
 ActivityLogger.log(req.user?._id, "LOGOUT");

  res.json({ message: "Logged out successfully" });
},

  whoami: async (req, res) => {
    const user = req.user;
    res.json({ email: user.email, userId: user._id });
  },
};

module.exports = AuthController;
