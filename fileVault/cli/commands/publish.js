const FileService = require('../../services/file_service');

module.exports = (program) => {
 program
    .command("publish <fileId>")
    .description("Make a file or folder public")
    .action(async (fileId) => {
      try {
        await FileService.publish(fileId);
      } catch (err) {
        console.error("🚨 Error:", err.message);
      } finally {
        process.exit(0);
      }
    });
};
