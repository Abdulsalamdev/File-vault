const FileService = require('../../services/file_service');

module.exports = (program) => {
  program
    .command("unpublish <fileId>")
    .description("Make a file or folder private")
    .action(async (fileId) => {
      try {
        await FileService.unpublish(fileId);
      } catch (err) {
        console.error("🚨 Error:", err.message);
      } finally {
        process.exit(0);
      }
    });
};
