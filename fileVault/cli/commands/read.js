const FileService = require('../../services/file_service');
module.exports = (program) => {
  program.command('read <file_id>')
    .description('Read file metadata')
    .action((file_id) => {
      try {
        FileService.read(file_id);
      } catch (err) {
        console.error(err.message);
      }
    });
};