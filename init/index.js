import mongoose from "mongoose";
import dotenv from "dotenv";
import { initData } from "./data.js";
import { Listing } from "../models/Listing.js";

dotenv.config();

const DB_URL = process.env.ATLAS_DB_URL;

async function main() {
  await mongoose.connect(DB_URL);
  console.log("Connected to DB");

  await initDB();
  console.log("Data was initialized...");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const updatedData = initData.map((obj, idx) => {
    const ownerId =
      idx % 2 === 0
        ? new mongoose.Types.ObjectId("685d20eb8e23fe00b6c0ac83")
        : new mongoose.Types.ObjectId("685d5b79cb70852b66bd02ff");
    return { ...obj, owner: ownerId };
  });

  await Listing.insertMany(updatedData);
};

main().catch((err) => {
  console.error("DB connection error:", err);
});
