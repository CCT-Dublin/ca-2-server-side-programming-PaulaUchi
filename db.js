

//import the mysql library 
const mysql = require("mysql2/promise");

// create a connection 
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Obachan2424-",        
  database: "ca_2",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});



// ensure table exists
async function ensureSchema() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS mysql_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      first_name VARCHAR(20),
      second_name VARCHAR(20),
      email VARCHAR(100),
      phone_number VARCHAR(10),
      eircode VARCHAR(6)
    )
  `);
}

module.exports = { db, ensureSchema };
