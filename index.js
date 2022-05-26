const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// server root api
app.get("/", (req, res) => {
  res.send("Langel server is running!");
});

app.listen(port, () => {
  console.log("Listening to the port: ", port);
});
