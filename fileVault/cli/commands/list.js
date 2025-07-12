const FileService = require('../../services/file_service');
module.exports = (program) => {
  // Define the list command
  program.command('list')
    .description('List all uploaded files')
    .action(async () => {
  try {
    await FileService.list();  // ✅ await the list function
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    process.exit(0); // Optional — wait for async calls to complete first
  }
});
};