const FileService = require('../../services/file_service');
module.exports = (program) => {
  // Define the delete command
  program.command('delete <file_id>')
    .description('Delete a file')
    .action(async (file_id) => {
      try {
        await FileService.delete(file_id);
        console.log('File deleted successfully!');
        process.exit(0);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
};