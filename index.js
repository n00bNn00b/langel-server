const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");
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

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Access Forbidden!" });
    }
    req.decoded = decoded;
    next();
  });
};

const run = async () => {
  try {
    await client.connect();
    console.log("DB Connected!");
    //   db collections
    const productsCollection = client.db("langelDB").collection("products");
    // review collection
    const reviewsCollection = client.db("langelDB").collection("reviews");
    const usersCollection = client.db("langelDB").collection("users");
    const ordersCollection = client.db("langelDB").collection("orders");

    //   REST API
    //   products API
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });
    app.post("/products", async (req, res) => {
      const products = req.body;
      const query = {
        name: products.name,
        description: products.description,
        image: products.image,
        minOrder: products.minOrder,
        quantity: products.quantity,
        price: products.price,
      };
      const exists = await productsCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, products: exists });
      }
      const result = await productsCollection.insertOne(products);
      return res.send(result);
    });
    // users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const users = await cursor.toArray();
      res.send(users);
    });
    app.get("/orders", async (req, res) => {
      const query = {};
      const cursor = ordersCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // order filter by email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const cursor = ordersCollection.find(filter);
      const orders = await cursor.toArray();
      res.send(orders);
    });
    // admin get api
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role == "admin";
      res.send({ admin: isAdmin });
    });
    // admin
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const updateUser = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateUser);
      res.send(result);
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
    //
    app.post("/login", (req, res) => {
      const user = req.body;
      console.log(user);
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
    // order post
    app.post("/order", async (req, res) => {
      const orders = req.body;
      const query = {
        name: orders.name,
        email: orders.email,
        order: orders.minorder,
        address: orders.address,
        productName: orders.productName,
        price: orders.price,
        totalPrice: Number(parseFloat(orders.totalPrice)),
      };
      const exists = await ordersCollection.findOne(query);
      if (exists) {
        return res.send({ success: true, orders: orders });
      }
      const result = await ordersCollection.insertOne(orders);
      return res.send(result);
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
