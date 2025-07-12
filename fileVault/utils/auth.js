const fs = require("fs");
const path = require("path");
const redis = require("../redis_client");

const sessionPath = path.join(process.cwd(), ".session");

async function getAuthenticatedUser() {
  if (!fs.existsSync(sessionPath)) return null;
  const token = fs.readFileSync(sessionPath, "utf-8").trim();
  const userId = await redis.get(`session:${token}`);
  return userId || null;
}

module.exports = { getAuthenticatedUser };