// fileVault/api/middleware/auth.middleware.js
const SessionRepository = require("../../repositories/session_repository");
const UserRepository = require("../../repositories/user_repository");

const authMiddleware = async (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(401).json({ error: "Missing session token" });

  try {
    const userId = await SessionRepository.get(token);
    if (!userId) return res.status(403).json({ error: "Invalid or expired token" });

    const user = await UserRepository.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = authMiddleware;
