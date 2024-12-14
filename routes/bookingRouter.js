const express = require("express");
const router = express.Router();
const mysqlconnection = require("../model/db"); // Assuming mysqlconnection is set up
const Joi = require("joi"); // For schema validation

// Joi schema for validating booking request
const bookingSchema = Joi.object({
  roomID: Joi.number().integer().required(),
  customerID: Joi.number().integer().required(),
  checkInDate: Joi.date().iso().required(),
  checkOutDate: Joi.date().iso().required(),
  totalAmount: Joi.number().positive().required(), // Adding totalAmount validation
});

// API to handle booking submission
router.post("/book-room", async (req, res) => {
  // Validate the request body using Joi
  const { error, value } = bookingSchema.validate(req.body);

  if (error) {
    return res
      .status(400)
      .send({ message: "Invalid booking details", details: error.details });
  }

  const { roomID, customerID, checkInDate, checkOutDate, totalAmount } = value;

  // Check if room exists and is available
  const roomQuery = "SELECT * FROM Room WHERE RoomID = ?";
  mysqlconnection.query(roomQuery, [roomID], (err, roomResults) => {
    if (err) {
      console.error("Error fetching room details:", err);
      return res.status(500).send({ message: "Error fetching room details" });
    }

    if (roomResults.length === 0) {
      return res.status(404).send({ message: "Room not found" });
    }

    const room = roomResults[0];

    // Check availability of room (check if the room is available for the selected dates)
    const bookingQuery = `
      SELECT * FROM Booking 
      WHERE RoomID = ? 
      AND ((CheckInDate BETWEEN ? AND ?) OR (CheckOutDate BETWEEN ? AND ?))
    `;
    mysqlconnection.query(
      bookingQuery,
      [roomID, checkInDate, checkOutDate, checkInDate, checkOutDate],
      (err, bookingResults) => {
        if (err) {
          console.error("Error checking room availability:", err);
          return res
            .status(500)
            .send({ message: "Error checking room availability" });
        }

        if (bookingResults.length > 0) {
          return res
            .status(400)
            .send({ message: "Room is already booked for the selected dates" });
        }

        // Proceed with booking if the room is available
        const insertBookingQuery = `
          INSERT INTO Booking (RoomID, CustomerID, CheckInDate, CheckOutDate, TotalAmount) 
          VALUES (?, ?, ?, ?, ?)
        `;
        mysqlconnection.query(
          insertBookingQuery,
          [roomID, customerID, checkInDate, checkOutDate, totalAmount],
          (err, bookingResult) => {
            if (err) {
              console.error("Error inserting booking:", err);
              return res.status(500).send({ message: "Error making booking" });
            }

            res.status(201).send({
              message: "Booking successful",
              bookingID: bookingResult.insertId,
              totalAmount,
            });
          }
        );
      }
    );
  });
});

// API to fetch the booking list
router.get("/bookings", (req, res) => {
  const bookingListQuery = `
    SELECT 
      b.BookingID, 
      u.Name AS UserName, 
      u.Email, 
      u.PhoneNumber, 
      build.Name AS BuildingName, 
       b.RoomID,
      r.RoomType, 
      b.CheckInDate, 
      b.CheckOutDate, 
      b.TotalAmount, 
      p.Amount AS PaymentAmount, 
      p.PaymentStatus
    FROM 
      Booking b
      JOIN Users u ON b.CustomerID = u.UserID
      JOIN Room r ON b.RoomID = r.RoomID
      JOIN Building build ON r.BuildingID = build.BuildingID
      LEFT JOIN Payment p ON b.BookingID = p.BookingID
  `;

  mysqlconnection.query(bookingListQuery, (err, results) => {
    if (err) {
      console.error("Error fetching bookings:", err);
      return res.status(500).send({ message: "Error fetching bookings" });
    }

    // If there are no bookings, return an empty array
    if (results.length === 0) {
      return res.status(200).send({ bookings: [] });
    }

    // Send the bookings data as a response
    res.status(200).send({ bookings: results });
  });
});

module.exports = router;
