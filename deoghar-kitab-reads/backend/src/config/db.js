const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas Connected:", conn.connection.host);
  } catch (error) {
    console.error("MongoDB Atlas connection failed:", error.message);

    if (process.env.NODE_ENV === "development") {
      console.log("Trying to connect to local MongoDB...");
      const localConn = await mongoose.connect(
        "mongodb://127.0.0.1:27017/deoghar_kitab"
      );
      console.log("Local MongoDB Connected:", localConn.connection.host);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
