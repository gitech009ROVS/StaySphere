import dotenv from "dotenv";
if (process.env.NODE_ENV != "production") {
  //as there is no NODE_ENV in the .env file so this is always true
  // once we deploy our app, there we will add a key called NODE_ENV in .env file which will automatically
  // disable the connection to .env file due to this if condition
  dotenv.config();
}
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "StaySphere_DEV",
    allowedFormats: ["png", "jpg", "jpeg"],
  },
});

export { cloudinary, storage };
