// require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
// const { MongoClient, ObjectId } = require("mongodb");

// const uri = process.env.MONGODB_URI;
// if (!uri) {
//   console.error("ERROR: MONGODB_URI not set in .env");
//   process.exit(1);
// }

// const MODEL_LABEL = "A Series";

// async function run() {
//   const client = new MongoClient(uri);
//   try {
//     await client.connect();
//     console.log("Connected to MongoDB");

//     const db = client.db();

//     const model = await db
//       .collection("productmodels")
//       .findOne({ label: MODEL_LABEL });
//     if (!model) {
//       console.error(`ERROR: No model found with label "${MODEL_LABEL}"`);
//       process.exit(1);
//     }
//     console.log(`Found model "${MODEL_LABEL}" → _id: ${model._id}`);

//     const before = await db
//       .collection("products")
//       .countDocuments({ model: MODEL_LABEL });
//     console.log(`Products with string "${MODEL_LABEL}": ${before}`);

//     if (before === 0) {
//       console.log("Nothing to update.");
//       return;
//     }

//     const result = await db
//       .collection("products")
//       .updateMany(
//         { model: MODEL_LABEL },
//         { $set: { model: new ObjectId(model._id) } },
//       );
//     console.log(
//       `Updated — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`,
//     );

//     const remaining = await db
//       .collection("products")
//       .countDocuments({ model: MODEL_LABEL });
//     console.log(`Products still with string "${MODEL_LABEL}": ${remaining}`);

//     console.log("Done.");
//   } finally {
//     await client.close();
//   }
// }

// run().catch((err) => {
//   console.error("FAILED:", err.message);
//   process.exit(1);
// });

console.log("Helo world");
