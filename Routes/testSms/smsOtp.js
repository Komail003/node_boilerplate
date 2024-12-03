import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import crypto from 'crypto';
// import { isValidPhoneNumber } from 'libphonenumber-js';

dotenv.config();

const router = express.Router();
const otpSmsStore = new Map();

// POST /otp - Generate and send OTP
router.post('/', async (req, res) => {
    const { phoneNumber } = req.body;

    // Validate input
    if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    // if (!isValidPhoneNumber(phoneNumber)) {
    //     return res.status(400).json({ message: "Invalid phone number format" });
    // }

    try {
        // Generate a 6-digit OTP
        const otp = crypto.randomInt(100000, 999999);

        // Store OTP with expiration time (30 mins)
        const expiresAt = Date.now() + 30 * 60 * 1000;
        otpSmsStore.set(phoneNumber, { otp, expiresAt });

        // Prepare Infobip message payload
        const messageData = {
            messages: [
                {
                    to: phoneNumber,
                    text: `Your OTP code is: ${otp}`,
                    from: process.env.INFOBIP_SENDER_ID // Sender ID from .env
                }
            ]
        };

        // Send OTP via Infobip API
        const response = await axios.post(
            process.env.INFOBIP_API_URL, // Infobip API URL from .env
            messageData,
            {
                headers: {
                    'Authorization': `App ${process.env.INFOBIP_API_KEY}`, // API Key from .env
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        // Respond to client
        return res.status(200).json({
            message: "OTP sent successfully",
            infobipResponse: response.data, // Optional: include Infobip response for debugging
        });
    } catch (error) {
        console.error("Error sending OTP:", error.response?.data || error.message);

        // Handle Infobip API errors
        if (error.response) {
            return res.status(error.response.status).json({
                message: error.response.data.requestError?.serviceException?.text || "Failed to send OTP",
                details: error.response.data,
            });
        }

        // Handle network or unknown errors
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
});

export default router;
