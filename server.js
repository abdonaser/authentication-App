//#region  Public Requires
// Load environment variables from a .env file into process.env
// Enables the use of variables defined in the .env file throughout the application
require('dotenv').config();

// Define the server port (default to 3000 if not specified in .env)
const PORT = process.env.PORT || 3000;

const express = require('express');
const app = express();

const connectDB = require('./Config/dbConnect');
const mongoose = require('mongoose');

//' Middleware for enabling Cross-Origin Resource Sharing (CORS)
const cors = require('cors');
const corsOptions = require('./Config/corsOptions');
app.use(cors(corsOptions)); // Enable CORS with specified options to allow cross-origin requests

const cookieParser = require('cookie-parser');
const path = require('path');
//#endregion

//#region Middlewares
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname + '/Public')));

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse JSON payloads and URL-encoded data in requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//#endregion

//#region routes
//' entry point
app.use('/', require('./Routes/Root'));

//' Auth Route
app.use('/auth', require('./Routes/Auth'));

//' users
app.use('/users', require('./Routes/userRoutes'));

// Handling 404 errors
app.use('*', (req, res) => {
  res.status(404);

  // If the request comes from a browser
  if (req.accepts('html')) {
    res.render('404.ejs');
  }
  // If the request comes from mobile/postman
  else if (req.accepts('json')) {
    res.json({ message: '404 page not found' });
  }
  // Default response if the request comes from other sources
  else {
    res.type('txt').send('404 Not Found');
  }
});
//#endregion

//#region  Server Creation
// Connect to the database
connectDB();
// Don't start the server until the database connection is established
mongoose.connection.once('open', () => {
  app.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
  );
});

// Log errors if the database connection fails
mongoose.connection.on('error', (error) =>
  console.log('Database connection error:', error)
);

// Optional: Uncomment this line to log when the database connection is established successfully
mongoose.connection.on('open', () =>
  console.log('Database connected successfully')
);
//#endregion
