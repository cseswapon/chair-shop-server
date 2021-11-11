const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

// middle war

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ifldk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Chair");
    const productCollection = database.collection("Product");
    const productReview = database.collection("Review");

    // product GET
    app.get("/products", async (req, res) => {
      const result = await productCollection.find({}).toArray();
      res.send(result);
    });
    // review GET
    app.get("/reviews", async (req, res) => {
      const result = await productReview.find({}).toArray();
      res.json(result);
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
