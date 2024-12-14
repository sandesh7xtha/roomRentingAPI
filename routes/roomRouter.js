const express = require("express");
const router = express.Router();
const Joi = require("joi"); // Use Joi for schema validation
const mysqlconnection = require("../model/db"); // Assuming mysqlconnection is set up

// ** Add Building API **
router.post("/add-building", (req, res) => {
  // Validate incoming data using Joi
  const schema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    address: Joi.string().min(5).max(500).required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { name, address } = req.body;

  // Insert building details into the database
  const query = "INSERT INTO Building (Name, Address) VALUES (?, ?)";
  mysqlconnection.query(query, [name, address], (err, result) => {
    if (err) {
      console.error("Error inserting building:", err);
      return res.status(500).send({ message: "Error adding building" });
    }
    res.status(200).send({
      message: "Building added successfully",
      buildingId: result.insertId,
    });
  });
});

// ** List Buildings API **
router.get("/list-buildings", (req, res) => {
  const query = "SELECT * FROM Building";

  mysqlconnection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving buildings:", err);
      return res.status(500).send({ message: "Error fetching building list" });
    }
    res.status(200).send({ buildings: results });
  });
});

router.post("/add-room", (req, res) => {
  // Validate incoming data using Joi
  const schema = Joi.object({
    buildingId: Joi.number().integer().required(),
    roomType: Joi.string().min(3).max(100).required(),
    pricePerMonth: Joi.number().min(0).required(),
    maxOccupancy: Joi.number().integer().min(1).required(),
    availability: Joi.boolean().required(),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  const { buildingId, roomType, pricePerMonth, maxOccupancy, availability } =
    req.body;

  // Insert room details into the database (removed roomName)
  const query = `
        INSERT INTO Room (BuildingID, RoomType, PricePerMonth, Availability, MaxOccupancy)
        VALUES (?, ?, ?, ?, ?)
      `;

  mysqlconnection.query(
    query,
    [buildingId, roomType, pricePerMonth, availability, maxOccupancy],
    (err, result) => {
      if (err) {
        console.error("Error inserting room:", err);
        return res.status(500).send({ message: "Error adding room" });
      }
      res.status(200).send({
        message: "Room added successfully",
        roomId: result.insertId, // Returning the inserted room ID
      });
    }
  );
});

// ** List Rooms API (Optional for testing purposes) **
router.get("/list-rooms", (req, res) => {
  const query = "SELECT * FROM Room";

  mysqlconnection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving rooms:", err);
      return res.status(500).send({ message: "Error fetching room list" });
    }
    res.status(200).send({ rooms: results });
  });
});

// ** List Rooms by Availability API **
router.get("/list-rooms-by-availability", (req, res) => {
  const { availability } = req.query; // Get availability from query parameters

  // Validate availability value
  if (availability !== "true" && availability !== "false") {
    return res
      .status(400)
      .send({ message: "Availability must be 'true' or 'false'" });
  }

  const availabilityBool = availability === "true"; // Convert to boolean

  // SQL query to select rooms with the given availability status
  const query = `
    SELECT 
        r.RoomID,
        r.RoomType,
        r.PricePerMonth,
        r.MaxOccupancy,
        r.Availability,
        b.Name AS BuildingName,
        b.Address AS BuildingAddress
    FROM 
        Room r
    JOIN 
        Building b ON r.BuildingID = b.BuildingID
    WHERE 
        r.Availability = ?
  `;

  // Execute the query
  mysqlconnection.query(query, [availabilityBool], (err, results) => {
    if (err) {
      console.error("Error retrieving rooms by availability:", err);
      return res.status(500).send({ message: "Error fetching room list" });
    }

    // If no rooms are found, send a message
    if (results.length === 0) {
      return res
        .status(404)
        .send({ message: `No rooms found with availability ${availability}` });
    }

    res.status(200).send({ rooms: results });
  });
});

// Backend example for updating availability
router.patch("/room/update-availability/:roomId", (req, res) => {
  const { roomId } = req.params;
  const { availability } = req.body;

  const query = "UPDATE Room SET Availability = ? WHERE RoomID = ?";
  mysqlconnection.query(query, [availability, roomId], (err, result) => {
    if (err) {
      return res.status(500).send({ message: "Error updating availability" });
    }
    res.status(200).send({ message: "Room availability updated" });
  });
});

// ** API to list rooms with building details **
router.get("/list-rooms-with-buildings", (req, res) => {
  const query = `
    SELECT 
        r.RoomID,
        r.RoomType,
        r.PricePerMonth,
        r.MaxOccupancy,
         r.Availability,
        b.Name AS BuildingName,
        b.Address AS BuildingAddress
    FROM 
        Room r
    JOIN 
        Building b ON r.BuildingID = b.BuildingID
  `;

  mysqlconnection.query(query, (err, results) => {
    if (err) {
      console.error("Error retrieving rooms with building details:", err);
      return res.status(500).send({ message: "Error fetching room list" });
    }
    res.status(200).send({ rooms: results });
  });
});

module.exports = router;
