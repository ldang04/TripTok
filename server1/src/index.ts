import express from "express";

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
  res.send("Hello, World xxxfrom Server 1!");
});

app.listen(PORT, () => {
  console.log(`Server 1 is running at http://localhost:${PORT}`);
});
