

//import the mysql library 

const mysql = require("mysql2/promise");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Obachan2424-",
  database: "ca_2",
});

async function ensureSchema() {             //function to check the schema
  const [rows] = await db.query(
    "SHOW TABLES LIKE 'mysql_table'"
  );

  if (rows.length === 0) {                                 
    throw new Error("mysql_table does not exist");                  //error no table
  }
}

module.exports = { db, ensureSchema };
