const path = require("path");
const fs = require("fs");
const thumbnailQueue = require("../queues/thumbnailQueue");

//handles thumbnail generation jobs
const generate = async (fileId, sourcePath) => {
  const outputPath = path.join(__dirname, "../storage/thumbnails", `${fileId}.jpg`);

  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // Add job to queue
  await thumbnailQueue.add("generateThumbnail", {
    fileId,
    sourcePath,
    outputPath,
  });

  console.log("Thumbnail generation job queued.");
};

module.exports = { generate };
