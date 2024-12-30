const { Router } =  require ("express");
const express = require ("express")
const oracledb = require("oracledb");
const multer = require("multer");
const { dbConfig } = require ("../../db.js");
const path = require("path");
const fs = require("fs");

const routers = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'api/routes/public/images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage }).single("uploads");
routers.use(express.static(path.join(__dirname, 'public')));

routers.post("/upload", upload, async (req, res) => {
  const connection = await oracledb.getConnection(dbConfig);

  try {
    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const { originalname, path: filePath } = req.file;
    const relativePath = filePath.replace("public", ""); // Save the relative path in DB

    // Insert the file information into Oracle DB
    const result = await connection.execute(
      `INSERT INTO images (image_id, image_name, image_url)
       VALUES (image_id_s.nextval, :name, :url)`,
      { name: originalname, url: relativePath },
      { autoCommit: true }
    );

    res
      .status(200)
      .send({ message: "Image uploaded successfully!", id: result.lastRowid });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to upload image" });
  } finally {
    await connection.close();
  }
});

// GET route to fetch an image by ID
routers.get("/image/:id", async (req, res) => {
  const connection = await oracledb.getConnection(dbConfig);

  try {
    const { id } = req.params;

    // Query the image details (name and URL) from the database
    const result = await connection.execute(
      `SELECT image_name, image_url FROM images WHERE image_id = :id`,
      [id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (result.rows.length === 0) {
      return res.status(404).send({ error: "Image not found" });
    }

    const { IMAGE_NAME, IMAGE_URL } = result.rows[0];

    // Send the image as a response from the 'public' directory
    res.setHeader("Content-Type", "image/jpeg"); // Adjust MIME type as needed
    res.setHeader("Content-Disposition", `inline; filename="${IMAGE_NAME}"`);
    res.sendFile(path.join(__dirname, 'public', IMAGE_URL)); // Serve the image file
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Failed to fetch image" });
  } finally {
    await connection.close();
  }
});

// Ensure the 'public/images' directory exists
if (!fs.existsSync('public/images')) {
  fs.mkdirSync('public/images', { recursive: true });
}

module.exports = routers;
