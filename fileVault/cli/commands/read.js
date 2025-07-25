const FileService = require('../../services/file_service');

module.exports = (program) => {
  // Define the read command
  program.command('read <file_id>')
    .description('Read file metadata')
    .action(async (file_id) => {
      try {
        await FileService.read(file_id);
        process.exit(0);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
};