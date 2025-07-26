import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

connectDB();

// Updated CORS for production
const allowedOrigins = [
  'http://localhost:5173',
  'https://login-page-jet-eta.vercel.app/', // Replace with your actual Vercel domain
  process.env.FRONTEND_URL
];

app.use(express.json());
app.use(cookieParser());
app.use(cors({ 
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true 
}));

// API Endpoints
app.get("/", (req, res) => res.send("API Working"));
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

// Export for Vercel
export default app;

// Only listen in development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => console.log(`Server started on PORT:${port}`));
}