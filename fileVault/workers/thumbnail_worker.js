require("dotenv").config();
const { Worker } = require("bullmq");
const sharp = require("sharp");
const Redis = require("ioredis");
const fs = require("fs");
const path = require("path");

// Redis connection with BullMQ-safe options
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});


// Create a worker for processing thumbnail generation jobs
const worker = new Worker(
  "thumbnail-generation",
  async (job) => {
    const { sourcePath, outputPath } = job.data;
    // Ensure output directory exists
    console.log("🧪 Thumbnail job started");
    console.log("📂 Source:", sourcePath);
    console.log("📁 Output:", outputPath);

    try {
      if (!fs.existsSync(sourcePath)) {
        throw new Error(`File not found: ${sourcePath}`);
      }
      // Ensure the output directory exists
      await sharp(sourcePath).resize(100, 100).toFile(outputPath);

      console.log(` Thumbnail created at: ${outputPath}`);
    } catch (err) {
      console.error(" Thumbnail generation failed:", err.message);
    }
  },
  { connection }
);

// Log errors if job fails
worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err.message);
});
