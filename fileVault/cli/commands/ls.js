const FileService = require('../../services/file_service');

module.exports = (program) => {
  program
    .command('ls [parentId]')
    .description('List files/folders inside a folder (default: root)')
    .action(async (parentId = null) => {
      try {
        await FileService.ls(parentId);
      } catch (err) {
        console.error("🚨 Error:", err.message);
      } finally {
        process.exit(0);
      }
    });
};
