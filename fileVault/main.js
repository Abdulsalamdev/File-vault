#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const commandRouter = require("./cli/command_router");

require("dotenv").config(); // Load .env
const connectDB = require("./db");

(async () => {
  try {
    await connectDB(); // 

    const port = process.env.PORT || 3000;
    console.log(`Server running on port ${port}`);

    // CLI metadata
    program.name("vault").description("A simple CLI file manager").version("1.0.0");

    // Register commands
    commandRouter(program);

    // Parse user input
    program.parse(process.argv);
  } catch (err) {
    console.error(" Failed to start CLI:", err);
    process.exit(1);
  }
})();