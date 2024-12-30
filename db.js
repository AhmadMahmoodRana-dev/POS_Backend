const oracledb = require("oracledb");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Define the database configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION_STRING,
};

// Function to establish a connection with Oracle DB
const getConnection = async () => {
    try {
        const connection = await oracledb.getConnection(dbConfig);
        console.log("Successfully connected to Oracle DB!");
        return connection;
    } catch (err) {
        console.error("Error connecting to Oracle DB:", err);
        throw err;
    }
};

// Export the dbConfig and getConnection function
module.exports = {
    dbConfig,
    getConnection,
};
