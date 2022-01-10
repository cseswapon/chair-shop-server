const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-adminsdk-fn8u6-.json");
// middle war

app.use(cors());
app.use(express.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ifldk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// verify
async function verification(req, res, next) {
  if (req?.headers?.authorization?.startsWith("Bearer ")) {
    const idToken = req?.headers?.authorization?.split(" ")[1];
    try {
      const decoder = await admin.auth().verifyIdToken(idToken);
      req.decoderUser = decoder.email;
    } catch {
      res.json({ message: "error" });
    }
  }
  next();
}
async function run() {
  try {
    await client.connect();
    console.log("Connected Database");
    const database = client.db("Chair");
    const productCollection = database.collection("Product");
    const productReview = database.collection("Review");
    const orderCollection = database.collection("Order");
    const usersCollection = database.collection("Users");
    // product GET
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    });
    // single product GET
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const cursor = { _id: ObjectId(id) };
      const result = await productCollection.findOne(cursor);
      res.json(result);
    });
    // product dlt
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(filter);
      res.json(result);
    });
    // add product
    app.post("/products", async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data);
      res.json(result);
    });
    // add order
    app.post("/order", async (req, res) => {
      const data = req.body;
      const result = await orderCollection.insertOne(data);
      res.json(result);
    });
    // get product
    app.get("/order", async (req, res) => {
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });
    app.get("/orders", verification, async (req, res) => {
      const email = req.query.email;
      if (req.decoderUser === email) {
        const filter = { email };
        const result = await orderCollection.find(filter).toArray();
        res.send(result);
      } else {
        res.status(401).json({ message: "not yet" });
      }
    });
    // put order
    app.put("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(filter);
      res.send(result);
    });
    // delete order
    app.delete("/order/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(filter);
      res.json(result);
    });
    // review GET
    app.get("/reviews", async (req, res) => {
      const result = await productReview.find({}).toArray();
      res.json(result);
    });
    // review post
    app.post("/reviews", async (req, res) => {
      const data = req.body;
      const result = await productReview.insertOne(data);
      res.json(result);
    });
    // user get
    app.get("/users", async (req, res) => {
      const cursor = req.query.email;
      const filter = { email: cursor };
      const result = await usersCollection.findOne(filter);
      let isAdmin = false;
      if (result?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    // user add
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    // user put
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const upDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, upDoc, options);
      res.send(result);
    });
    // use to admin role
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const upDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, upDoc, options);
      res.send(result);
    });
  } finally {
    //    await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  console.log("Server Side is running");
  res.send("I am ready to go");
});

app.listen(port, () => {
  console.log("Server is listening on port", port);
});
