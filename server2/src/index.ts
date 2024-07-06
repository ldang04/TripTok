import express from "express";
import axios from "axios"; 
import { getInfo } from './videosController'; 
const app = express();
const PORT = process.env.PORT || 3002; 

// json parser middleware
app.use(express.json());

/**
 * @route POST /videos
 * @desc Processes a tiktok from a given URL and saves information to database
 */
app.post("/videos", getInfo);

/**
 * @route GET /
 * @desc Test route 
 */
app.get("/", (req, res) => {
  res.send("Hello, World from Server 2!");
});

app.listen(PORT, () => {
  console.log(`Server 2 is running at http://localhost:${PORT}`);
});
