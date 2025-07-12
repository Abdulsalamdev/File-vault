const FileService = require('../../services/file_service');


module.exports = (program) => {
  // Define the upload command
  program.command('upload <filepath>')
    .description('Upload a file')
    .action(async (filepath) => {
      try {
        const id = await FileService.upload(filepath);
        console.log(`File uploaded successfully! ID: ${id}`);
        process.exit(0);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });
};