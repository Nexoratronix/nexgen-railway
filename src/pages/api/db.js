import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
console.log("MONGODB_URI:", uri);

let client;
let clientPromise;

if (!uri) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Ensure database connection only happens on the server
if (typeof window !== "undefined") {
  console.warn("❌ Warning: MongoDB should not be used on the client side!");
  throw new Error("MongoDB client should not be initialized on the client side!");
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client
    .connect()
    .then(() => {
      console.log("✅ Connected to MongoDB");
      return client;
    })
    .catch((err) => {
      console.error("❌ Connection failed:", err);
      throw err;
    });
}

clientPromise = global._mongoClientPromise;

export async function connectToDatabase() {
  const client = await clientPromise;
  const db = client.db(process.env.DB_NAME);
  console.log("📌 Database selected:", db.databaseName);
  return { db, client };
}
