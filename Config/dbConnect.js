const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose
      .connect(process.env.DATABASER_URi)
      .then(console.log('MongoDB Database connected'));
  } catch (error) {
    console.log('Database connection error: ', err);
  }
};

module.exports = connectDB;
