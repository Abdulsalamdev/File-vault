// fileVault/api/server.js
require("dotenv").config();
const express = require("express");
const connectDB = require("../storage/db");
const fileRoutes = require('./routes/file_routes');
const authRoutes = require("./routes/auth_routes"); 

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes); 
app.use('/api', fileRoutes);

(async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API Server listening on port ${PORT}`));
})();
