const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Horizon Trails Backend is running!");
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});
// Booking route
app.post("/api/inquiry", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      destination,
      travelDate,
      numberOfTravelers,
      travelType,
      notes,
    } = req.body;

    // Validate required fields
    if (
      !fullName ||
      !email ||
      !phone ||
      !destination ||
      !travelDate ||
      !numberOfTravelers ||
      !travelType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Email YOU receive
    const ownerMail = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVE_EMAIL,
      subject: `New Horizon Trails Booking - ${fullName}`,
      html: `
                <h2>New Horizon Trails Booking</h2>

                <p><strong>Name:</strong> ${fullName}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Destination:</strong> ${destination}</p>
                <p><strong>Travel Date:</strong> ${travelDate}</p>
                <p><strong>Number of Travelers:</strong> ${numberOfTravelers}</p>
                <p><strong>Travel Type:</strong> ${travelType}</p>
                <p><strong>Notes:</strong> ${notes || "No additional notes"}</p>
            `,
    };

    // Confirmation email CUSTOMER receives
    const customerMail = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Horizon Trails - Booking Request Received",
      html: `
                <h2>Thank You, ${fullName}!</h2>

                <p>
                    We have received your booking request for Horizon Trails.
                </p>

                <p>
                    Our team will review your request and contact you soon.
                </p>

                <h3>Booking Details</h3>

                <p><strong>Destination:</strong> ${destination}</p>
                <p><strong>Travel Date:</strong> ${travelDate}</p>
                <p><strong>Travelers:</strong> ${numberOfTravelers}</p>
                <p><strong>Travel Type:</strong> ${travelType}</p>

                <p>
                    Thank you for choosing Horizon Trails!
                </p>
            `,
    };

    // Send both emails
    await transporter.sendMail(ownerMail);
    await transporter.sendMail(customerMail);

    res.status(200).json({
      success: true,
      message: "Booking request submitted successfully!",
    });
  } catch (error) {
    console.error("Email error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to send booking request.",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Horizon Trails backend running on port ${PORT}`);
});
