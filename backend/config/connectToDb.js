import mongoose from "mongoose";
(async () => {
  try {
    // Example: connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();
