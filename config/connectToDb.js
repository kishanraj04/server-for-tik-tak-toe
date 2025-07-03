import mongoose from "mongoose";
(async () => {
  try {
    // Example: connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/tiktaktoe');
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();
