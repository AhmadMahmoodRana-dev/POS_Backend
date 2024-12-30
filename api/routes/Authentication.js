const {dbConfig} = require ("../../db.js");
const express = require ("express")
const oracledb = require("oracledb");
const bcrypt = require("bcrypt");

const Auth = express.Router()

Auth.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(
        `INSERT INTO users (username, email, password, role) VALUES (:username, :email, :password, :role)`,
        { username, email, password: hashedPassword, role },
        { autoCommit: true }
      );
  
      res.status(201).json({ message: "User registered successfully!" });
      await connection.close();
    } catch (error) {
      res.status(500).json({ error: "Failed to register user." });
      console.error(error);
    }
  });
  
  Auth.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const connection = await oracledb.getConnection(dbConfig);
      const result = await connection.execute(
        `SELECT * FROM users WHERE email = :email`,
        { email }
      );
  
      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ error: "User not found." });
      }
  
      const [id, username, userEmail, hashedPassword, role] = user;
      const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
  
      res.json({ message: "Login successful!", user: { id, username, email: userEmail, role } });
      await connection.close();
    } catch (error) {
      res.status(500).json({ error: "Failed to login." });
      console.error(error);
    }
  });

  module.exports =Auth; 