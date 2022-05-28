const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

/***
 *
 *
 * Middleware
 *
 */
app.use(cors());
app.use(express.json());
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
    //   db collections
    const productsCollection = client.db("langelDB").collection("products");
    // review collection
    const reviewsCollection = client.db("langelDB").collection("reviews");
    const usersCollection = client.db("langelDB").collection("users");

    //   REST API
    //   products API
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    //   single product
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productsCollection.findOne(query);
      res.send(product);
    });

    // Reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // post review

    // users
    app.post("/users", async (req, res) => {
      const users = req.body;
      const query = {
        name: users.name,
        email: users.email,
        gitHub: users.gitHub,
        linkedIn: users.linkedIn,
        url: users.url,
      };
      const exists = await usersCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, users: exists });
      }
      const result = usersCollection.insertOne(users);
      return res.send(result);
    });
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await usersCollection.findOne(filter);
      res.send(user);
    });
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
