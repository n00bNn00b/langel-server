const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

/***
 *
 *
 * Middleware
 *
 */

/*
 *
 *=====================================
 *
 *      MongoDB Configurartion
 *
 *=====================================
 *
 */
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3ovwm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    console.log("DB Connected!");
    // const productsCollection = client.db("langelDB").collection("products");
  } finally {
    //
  }
};

run().catch(console.dir);

// server root api
app.get("/", (req, res) => {
  res.send("Langel server is running!");
});

app.listen(port, () => {
  console.log("Listening to the port: ", port);
});
