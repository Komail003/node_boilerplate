// const express = require('express');

import express from "express";
import mongoose from "mongoose";
import formRoutes from "./Routes/formRoutes.js";
import userRoutes from "./Routes/Users/usersRoutes.js";
import otpMail from "./Routes/Mailer/otpMail.js";
import smsMail from "./Routes/testSms/smsOtp.js";
import crypto from "crypto";
import { request as httpsRequest } from "https";

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

App.post("/send-otp", (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);

    const options = {
      method: "POST",
      hostname: "kqpw1n.api.infobip.com",
      path: "/sms/2/text/advanced",
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`, // API Key from .env
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      maxRedirects: 20,
    };

    const reqInfobip = httpsRequest(options, function (infobipRes) {
      let chunks = [];

      infobipRes.on("data", function (chunk) {
        chunks.push(chunk);
      });

      infobipRes.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log("Response from Infobip:", body.toString());
      });

      infobipRes.on("error", function (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({ message: "Error sending OTP", error });
      });
    });

    // Prepare the message payload
    const postData = JSON.stringify({
      messages: [
        {
          destinations: [{ to: `+${phoneNumber}` }], // Add '+' for international format
          from: process.env.INFOBIP_SENDER_ID, // Replace with your Infobip sender ID
          text: `Your OTP code is: ${otp}`,
        },
      ],
    });

    reqInfobip.write(postData);
    reqInfobip.end();

    // Respond to the client that OTP has been sent
    res.status(200).json({
      message: "OTP sent successfully",
      otp, // You can return OTP here for debugging or testing
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

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

App.use("/api/sms", smsMail);

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
