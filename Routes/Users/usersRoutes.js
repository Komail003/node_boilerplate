import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Users from "../../Models/Users/users.js";
import userValidationSchema from "../../Schemas/userSchema/userschema.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
const router = express.Router();
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.APP_PASSKEY,
    // pass: 'szmb rvdp fuhg ydpb'
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateHtmlTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            text-align: center;
            margin: 20px;
        }
		.container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
      border: 1px solid #4CAF50;
      border-radius: 5px;
    }

        h1 {
            color: #3498db;
        }

        p {
            color: #555;
        }

        .code-container {
            background-color: #ecf0f1;
            padding: 10px;
            margin: 20px;
            border-radius: 5px;
        }

        .code {
            font-size: 20px;
            color: #2c3e50;
        }
    </style>
</head>
<body>
	<div class="container">
    <h1>Password Reset</h1>
    <p>We received a request to reset your password. Use the following code to complete the process:</p>
    
    <div class="code-container">
        <p class="code">Your reset code: ${otp}</p>
    </div>

    <p>If you did not request a password reset, please ignore this email.</p>
</div>
</body>
</html>

`;

const otpStore = new Map();

router.post("/verify", async (req, res) => {
  // console.log("im here")
  const { error } = userValidationSchema(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  try {
    let User = await Users.findOne({ email: req.body.email });
    let phoneNumber = await Users.findOne({
      phoneNumber: req.body.phoneNumber,
    });
    if (User || phoneNumber) {
      return res.status(400).send("User already exists.");
    }

    const otp = crypto.randomInt(100000, 999999);
    const expiresAt = Date.now() + 30 * 60 * 1000;

    otpStore.set(req.body.email, { otp, expiresAt });
    const mailOptions = {
      from: process.env.SMTP_USER || "komailabbas376@gmail.com",
      to: req.body.email,
      subject: "Password Reset",
      html: generateHtmlTemplate(otp), // Include the HTML content here
    };

    try {
      // Send email
      // console.log('Email sent:');

      const info = await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${req.body.email}`, info.response);
      res.send("Email sent");
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Error sending email");
    }

    // let newUser = req.body;
    // let hashedPwd = await bcrypt.hash(newUser.password, 10);
    // newUser.password = hashedPwd;
    // newUser = new Users(req.body);
    // await newUser.save();
    // res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/add", async (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;
  try {
    const storedOtpDetails = otpStore.get(email);
    if (!storedOtpDetails) {
      return res.status(400).send({ message: "OTP not found or expired" });
    }
    const { otp: storedOtp, expiresAt } = storedOtpDetails;
    // Check if OTP is expired
    if (Date.now() > expiresAt) {
      otpStore.delete(email); // Cleanup expired OTP
      return res.status(400).send({ message: "OTP has expired" });
    }

    if (parseInt(otp, 10) !== storedOtp) {
      return res.status(400).send({ message: "Invalid OTP" });
    } else {
      console.log("otp Verified");
    }
    otpStore.delete(email);
    let newUser = req.body;
    let hashedPwd = await bcrypt.hash(newUser.password, 10);
    newUser.password = hashedPwd;
    newUser = new Users(req.body);
    await newUser.save();
    res
      .status(200)
      .send({ message: "OTP verified successfully and user added", newUser });
    // res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/get", async (req, res) => {
  try {
    const users = await Users.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// login for user
router.post("/login", async (req, res) => {
  // console.log("goku")
  try {
    const userCredentials = req.body;
    console.log(userCredentials);

    const foundUser = await Users.findOne({
      email: userCredentials.email,
    });
    if (foundUser) {
      const passwordMatch = await bcrypt.compare(
        userCredentials.password,
        foundUser.password
      );
      if (passwordMatch) {
        return res
          .status(200)
          .send({ message: "Login successful", user: foundUser });
      } else {
        return res.status(400).send("Email or password is incorrect");
      }
    } else {
      return res.status(400).send("Email or password is incorrect");
    }
  } catch (err) {
    return res.status(500).send("Error: " + err);
  }
});

router.patch("/update/:id", async (req, res) => {
  const { id } = req.params;
  // console.log("i am running ")
  const { error } = userValidationSchema(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const updatedUser = await Users.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch("/updatePassword", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ message: "Email and new password are required" });
  }

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete user
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const deletedForm = await Users.findByIdAndDelete(id);
    if (!deletedForm) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully", deletedForm });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
