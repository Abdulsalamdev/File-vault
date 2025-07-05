const FileService = require('../../services/file_service');
module.exports = (program) => {
  program.command('list')
    .description('List all uploaded files')
    .action(() => {
      try {
        FileService.list();
      } catch (err) {
        console.error(err.message);
      }
    });
};