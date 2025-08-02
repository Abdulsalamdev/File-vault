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

      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserRepository.create({
        email,
        password: hashedPassword,
      });

      ActivityLogger.log(user._id, "REGISTER");

      return res.status(201).json({
        message: "User registered successfully",
        userId: user._id,
        email: user.email,
      });
    } catch (error) {
      ActivityLogger.error(null, "REGISTER_ERROR", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

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
    } catch (error) {
      ActivityLogger.error(null, "LOGIN_ERROR", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  logout: async (req, res) => {
    try {
      const token = req.token;
      await SessionRepository.del(token);
      ActivityLogger.log(req.user?._id, "LOGOUT");

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      ActivityLogger.error(req.user?._id, "LOGOUT_ERROR", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  },

  whoami: async (req, res) => {
    const user = req.user;
    res.json({ email: user.email, userId: user._id });
    ActivityLogger.log(user._id, "WHOAMI");
  },
};

module.exports = AuthController;
