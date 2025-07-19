require("dotenv").config();
const { Queue } = require("bullmq");
const Redis = require("ioredis");

// Ensure REDIS_URL is set in your environment variables
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl);

// Create a queue for thumbnail generation
const thumbnailQueue = new Queue("thumbnail-generation", {
  connection,
});

module.exports = thumbnailQueue;
