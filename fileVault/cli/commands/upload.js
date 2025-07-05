const FileService = require('../../services/file_service');
module.exports = (program) => {
  program.command('upload <filepath>')
    .description('Upload a file')
    .action(async (filepath) => {
      try {
        const id = await FileService.upload(filepath);
        console.log(`File uploaded successfully! ID: ${id}`);
      } catch (err) {
        console.error(err.message);
      }
    });
};