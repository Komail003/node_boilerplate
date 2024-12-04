import  express  from "express";
import crypto from "crypto";
import { request as httpsRequest } from "https";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/send-otp", (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);

    // Options for the HTTPS request to Infobip
    const options = {
      method: "POST",
      hostname: "kqpw1n.api.infobip.com",
      path: "/sms/2/text/advanced",
      headers: {
        Authorization: `App ${process.env.INFOBIP_API_KEY}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    const reqInfobip = httpsRequest(options, (infobipRes) => {
      let chunks = [];

      infobipRes.on("data", (chunk) => {
        chunks.push(chunk);
      });

      infobipRes.on("end", () => {
        const body = Buffer.concat(chunks).toString();
        console.log("Response from Infobip:", body);
      });

      infobipRes.on("error", (error) => {
        console.error("Error occurred:", error);
        return res.status(500).json({ message: "Error sending OTP", error });
      });
    });

    // Prepare the message payload
    const postData = JSON.stringify({
      messages: [
        {
          destinations: [{ to: `+${phoneNumber}` }],
          from: process.env.INFOBIP_SENDER_ID,
          text: `We received a request to reset your password. Use the code to complete the process. Your OTP code is: ${otp}`,
        },
      ],
    });

    reqInfobip.write(postData);
    reqInfobip.end();

    // Respond to the client that OTP has been sent
    res.status(200).json({
      message: "OTP sent successfully",
      otp, // Only for testing remove in production
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

export default router;

// App.post("/api/send-otp", (req, res) => {
//   const { phoneNumber } = req.body;

//   if (!phoneNumber) {
//     return res.status(400).json({ message: "Phone number is required" });
//   }

//   try {
//     // Generate 6-digit OTP
//     const otp = crypto.randomInt(100000, 999999);

//     const options = {
//       method: "POST",
//       hostname: "kqpw1n.api.infobip.com",
//       path: "/sms/2/text/advanced",
//       headers: {
//         Authorization: `App ${process.env.INFOBIP_API_KEY}`, // API Key from .env
//         "Content-Type": "application/json",
//         Accept: "application/json",
//       },
//       maxRedirects: 20,
//     };

//     const reqInfobip = httpsRequest(options, function (infobipRes) {
//       let chunks = [];

//       infobipRes.on("data", function (chunk) {
//         chunks.push(chunk);
//       });

//       infobipRes.on("end", function () {
//         const body = Buffer.concat(chunks);
//         console.log("Response from Infobip:", body.toString());
//       });

//       infobipRes.on("error", function (error) {
//         console.error("Error occurred:", error);
//         return res.status(500).json({ message: "Error sending OTP", error });
//       });
//     });

//     // Prepare the message payload
//     const postData = JSON.stringify({
//       messages: [
//         {
//           destinations: [{ to: `+${phoneNumber}` }], // Add '+' for international format
//           from: process.env.INFOBIP_SENDER_ID, // Replace with your Infobip sender ID
//           text: `Your OTP code is: ${otp}`,
//         },
//       ],
//     });

//     reqInfobip.write(postData);
//     reqInfobip.end();

//     // Respond to the client that OTP has been sent
//     res.status(200).json({
//       message: "OTP sent successfully",
//       otp, // You can return OTP here for debugging or testing
//     });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       message: "Failed to send OTP",
//       error: error.message,
//     });
//   }
// });
