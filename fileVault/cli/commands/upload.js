// cli/commands/upload.js
const FileService = require("../../services/file_service");
const path = require("path");

module.exports = (program) => {
  program
    .command("upload <filePath> [parentId]")
    .description("Upload a file (optionally to a folder)")
    .action(async (filePath, parentId = null) => {
      try {
        await FileService.upload(filePath, parentId);
      } catch (err) {
        console.error("Error:", err.message);
      } finally {
        process.exit(0);
      }
    });
};
