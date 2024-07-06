import express from "express";

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello, World from Server 2!");
});

app.listen(PORT, () => {
  console.log(`Server 2 is running at http://localhost:${PORT}`);
});
