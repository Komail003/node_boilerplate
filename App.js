// const express = require('express');

import express from 'express';
import mongoose from 'mongoose';
import formRoutes from './Routes/formRoutes.js';
import dotenv from 'dotenv';


dotenv.config();



const App = express();
const PORT = process.env.PORT || 5000;
// Middleware
App.use(express.json()); // Body parser for JSON requests

// Use routes
App.get('/', (req, res) => {
  res.send('Welcome, Enaam Backend is running...');
});
App.get('/api', (req, res) => {
  res.send('Hello, This Is Enaam Backend!');
});
// test api
App.use('/api/forms', formRoutes);






// Connect to MongoDB (adjust the connection string as needed)
mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

// Start the server
// const port = 7000;
App.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
