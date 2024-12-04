// const express = require('express');

import express from "express";
import mongoose from "mongoose";
import formRoutes from "./Routes/formRoutes.js";
import userRoutes from "./Routes/Users/usersRoutes.js";
import otpMail from "./Routes/Mailer/otpMail.js";
import smsOtp from "./Routes/testSms/smsOtp.js";
import rewardsRoutes from "./Routes/Rewards/rewardsRoute.js";

import verifyJWT from "./MiddleWare/verifyJWT.js"
import dotenv from "dotenv";
// import verifyJWT from './MiddleWare/verifyJWT.js';
dotenv.config();
const App = express();
const PORT = process.env.PORT || 5000;
mongoose
  .connect("mongodb://localhost:27017/enaamDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
App.use(express.json());

// routes testing
App.get("/", (req, res) => {
  res.send("Welcome, Enaam Backend is running...");
});
App.get("/api", (req, res) => {
  res.send("Hello, This Is Enaam Backend!");
});

// test api for cru
App.use("/api/forms", formRoutes);

// Users
App.use("/api/users", userRoutes);

// user login with jwt
// App.use("/api/login",userLogin)

// forgot password
App.use("/api/email", otpMail);
App.use("/api/sms", smsOtp);
// rewards / tickets bonds
App.use("/api/rewards", rewardsRoutes);



// App.use(verifyJWT);
// if(verifyJWT){
//   console.log("jwt verified")
// }else{
//   console.log("jwt not verified")
// }

// Start the server
// const port = 7000;
App.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
