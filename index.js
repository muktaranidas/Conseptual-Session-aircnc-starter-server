const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tdieq2y.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const homesCollection = client.db("airCnC-db").collection("homes");
    const usersCollection = client.db("airCnC-db").collection("users");
    const bookingsCollection = client.db("airCnC-db").collection("bookings");

    // Save user email & generate JWT
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      // console.log(result);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      // console.log(token);
      res.send({ result, token });
    });

    // Get a single user by email
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      console.log(user.role);
      res.send(user);
    });

    // save a booking
    app.post("/bookings", async (req, res) => {
      const bookingData = req.body;
      const result = await bookingsCollection.insertOne(bookingData);
      // console.log(result);
      res.send(result);
    });

    // Get All Bookings
    app.get("/bookings", async (req, res) => {
      let query = {};
      const email = req.query.email;
      if (email) {
        query = {
          guestEmail: email,
        };
      }
      const booking = await bookingsCollection.find(query).toArray();
      // console.log(booking);
      res.send(booking);
    });

    console.log("Database Connected...");
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Server is running...in session");
});

app.listen(port, () => {
  console.log(`Server is running...on ${port}`);
});
