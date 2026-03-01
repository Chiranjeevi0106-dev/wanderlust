const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  try {
    await Listing.deleteMany({});
    const mongoose = require("mongoose");
    initData.data = initData.data.map((obj) => ({...obj,owner: new mongoose.Types.ObjectId("6999c4463741ae49daa3dc82"),
}));
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
  } catch (err) {
    console.log(err);
  }
};

initDB();
