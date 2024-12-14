const express = require("express");
const router = express.Router();
const Joi = require("joi"); // Schema validation using Joi
const mysqlconnection = require("../model/db"); // Assuming mysqlconnection is set up

// Payment schema validation using Joi
const paymentSchema = Joi.object({
  bookingID: Joi.number().integer().required(),
  amount: Joi.number().precision(2).required(),
  paymentDate: Joi.date().required(),
  paymentStatus: Joi.string()
    .valid("Pending", "Completed", "Failed")
    .required(),
});

// Endpoint to handle payment processing
router.post("/process-payment", (req, res) => {
  // Validate the request body using Joi
  const { error, value } = paymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }

  const { bookingID, amount, paymentDate, paymentStatus } = value;

  // Insert payment record into the database
  const query = `
    INSERT INTO Payment (BookingID, Amount, PaymentDate, PaymentStatus)
    VALUES (?, ?, ?, ?)
  `;
  const values = [bookingID, amount, paymentDate, paymentStatus];

  mysqlconnection.query(query, values, (err, results) => {
    if (err) {
      console.error("Error processing payment:", err);
      return res.status(500).json({
        message: "Error processing payment. Please try again later.",
      });
    }

    // Update room availability to false after payment
    const updateRoomAvailabilityQuery = `
      UPDATE Room
      SET Availability = false
      WHERE RoomID IN (
        SELECT RoomID
        FROM Booking
        WHERE BookingID = ?
      )
    `;
    mysqlconnection.query(
      updateRoomAvailabilityQuery,
      [bookingID], // Update room availability based on the booking ID
      (updateErr) => {
        if (updateErr) {
          console.error("Error updating room availability:", updateErr);
          return res.status(500).json({
            message: "Error updating room availability.",
          });
        }

        // Send success response
        res.status(200).json({
          message:
            "Payment processed successfully and room availability updated.",
          paymentID: results.insertId,
        });
      }
    );
  });
});

module.exports = router;
