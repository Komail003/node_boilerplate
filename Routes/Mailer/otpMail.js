import Express from "express";
import nodemailer from "nodemailer";
import Users from "../../Models/Users/Users.js";
import dotenv from "dotenv";
import crypto from "crypto";
const router = Express.Router();
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

// const otp= Math.floor(100000 + Math.random() * 900000);
// HTML email template
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

// Email content

const otpStore = new Map();

router.post("/", async (req, res) => {
  // console.log("i am email");
  const myObj = req.body;
  const userEmail = req.body.email;

  // Find the existing User by email
  const user = await Users.findOne({ email: userEmail });
// console.log(user);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }

  const otp = crypto.randomInt(100000, 999999);
  const expiresAt = Date.now() + 30 * 60 * 1000;

  otpStore.set(userEmail, { otp, expiresAt });
  const mailOptions = {
    from: process.env.SMTP_USER || "komailabbas376@gmail.com",
    to: userEmail,
    subject: "Password Reset",
    html: generateHtmlTemplate(otp), // Include the HTML content here
  };
  try {
    // Send email
    // console.log('Email sent:');

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${userEmail}`, info.response);
    res.send("Email sent");
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error sending email");
  }
});

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Retrieve OTP details from memory
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

    // Validate OTP
    if (parseInt(otp, 10) !== storedOtp) {
      return res.status(400).send({ message: "Invalid OTP" });
    }
    

    // OTP is valid; delete from memory and proceed
    otpStore.delete(email);
    res.status(200).send({ message: "OTP verified successfully", email });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "OTP verification failed", error: error.message });
  }
});

export default router;
