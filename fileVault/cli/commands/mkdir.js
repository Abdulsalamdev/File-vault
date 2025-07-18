const FileService = require('../../services/file_service');

module.exports = (program) => {
  program
    .command('mkdir <folderName> [parentId]')
    .description('Create a new folder')
    .action(async (folderName, parentId = null) => {
      try {
        await FileService.mkdir(folderName, parentId);
      } catch (err) {
        console.error("🚨 Error:", err.message);
      } finally {
        process.exit(0);
      }
    });
};
