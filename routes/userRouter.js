const express = require("express");
const router = express.Router();
const Joi = require("joi"); // Use Joi for schema validation
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysqlconnection = require("../model/db");

const SECRET_KEY = "This is secret Key asdfg"; // It is recommended to store this securely
const SALT_ROUND = 10;

// Validation Schemas
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  userType: Joi.string().valid("Admin", "Tenant").required(),
  name: Joi.string().required(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[0-9]{10,20}$/)
    .required(), // Support international numbers
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

// Add User (Sign Up)
router.post("/signup", async (req, res) => {
  const { email, password, userType, name, phoneNumber } = req.body;

  // Validate input
  const { error } = userSchema.validate({
    email,
    password,
    userType,
    name,
    phoneNumber,
  });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUND);

    // Insert into Users table
    const query = `INSERT INTO Users (Email, PasswordHash, UserType, Name, PhoneNumber) VALUES (?, ?, ?, ?, ?)`;
    mysqlconnection.query(
      query,
      [email, hashedPassword, userType, name, phoneNumber],
      (err, results) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ error: "Email already exists" });
          }
          return res
            .status(500)
            .json({ error: "Database error", details: err });
        }
        res.status(201).json({
          message: "User registered successfully",
          userId: results.insertId,
        });
      }
    );
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  const { error } = loginSchema.validate({ email, password });
  if (error) return res.status(400).json({ error: error.details[0].message });

  try {
    // Query the user by email
    const query = `SELECT * FROM Users WHERE Email = ?`;
    mysqlconnection.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: "Database error", details: err });
      }

      // Check if user exists
      if (results.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const user = results[0];

      // Compare password with hashed password
      const isMatch = await bcrypt.compare(password, user.PasswordHash);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Check if account is locked
      if (user.AccountLocked) {
        return res
          .status(400)
          .json({ error: "Account is locked. Please contact admin." });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.UserID, userType: user.UserType },
        SECRET_KEY,
        {
          expiresIn: "1h", // Token expiration time
        }
      );

      // Send the response with additional user details
      res.status(200).json({
        message: "Login successful",
        token, // JWT token
        userId: user.UserID, // Add User ID to the response
        name: user.Name,
        email: user.Email,
        userType: user.UserType,
        phoneNumber: user.PhoneNumber, // Add Phone Number to the response
      });
    });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err });
  }
});

module.exports = router;
