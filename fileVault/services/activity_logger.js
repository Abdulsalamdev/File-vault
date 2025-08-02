const logger = require("../utils/logger");

const ActivityLogger = {
  log(userId, action, meta = {}) {
    logger.info(`User ${userId || "anonymous"} performed ${action}`, {
      userId: userId || "guest",
      action,
      ...meta,
    });
  },
  error(userId, action, err) {
    logger.error(`Error during ${action} by user ${userId}`, {
      userId,
      action,
      error: err.message,
      stack: err.stack,
    });
  }
};

module.exports = ActivityLogger;