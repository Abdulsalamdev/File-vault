require("dotenv").config();
const express = require("express");
const connectDB = require("../storage/db");
const helmet = require("helmet");
const fileRoutes = require('./routes/file_routes');
const authRoutes = require("./routes/auth_routes"); 
const cors = require("cors"); 

const app = express();
app.use(express.json());

// Secure HTTP headers
app.use(helmet());
// === Security Middlewares ===
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*", // specify allowed origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));



app.use("/api/auth", authRoutes); 
app.use('/api', fileRoutes);

// === Redirect HTTP to HTTPS in production ===
if (process.env.NODE_ENV === "production") {
  app.use((req, res, next) => {
    if (req.headers["x-forwarded-proto"] !== "https") {
      return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
  });
}

(async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`API Server listening on port ${PORT}`));
})();
