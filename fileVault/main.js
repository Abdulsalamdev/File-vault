#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const commandRouter = require("./cli/command_router");

require('dotenv').config(); // Load .env
const connectDB = require('./db');

connectDB();

const port = process.env.PORT || 3000;
console.log(`Server running on port ${port}`);
// console.log('Mongo URI:', process.env.MONGO_URI);
// Set CLI metadata
program.name("vault").description("A simple CLI file manager").version("1.0.0");

// Load and register all commands
commandRouter(program);

// passing command arguments
program.parse(process.argv);


