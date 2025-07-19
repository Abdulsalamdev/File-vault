const redis = require("../storage/redis_client");

// create a session repository to handle session-related database operations
const SessionRepository = {
  set: (token, userId) => redis.set(`session:${token}`, userId),
  get: (token) => redis.get(`session:${token}`),
  del: (token) => redis.del(`session:${token}`),
};

module.exports = SessionRepository;
