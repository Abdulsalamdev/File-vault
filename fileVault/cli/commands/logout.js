const AuthService = require("../../services/auth_service");

module.exports = (program) => {
  program
   .command("logout")
    .description("Logout user and clear session")
    .action(async (user) => {
      try {
        const user = await AuthService.logout()
        process.exit(0);
      } catch (err) {
        console.error(err.message);}
        process.exit(1);
      }
    );
};