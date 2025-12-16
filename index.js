
//server set up
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { pool, ensureSchema } = require("./db");

const CSV_FILE = process.argv[2]; // checks for the file

if (!CSV_FILE) {  // check the user forgot to provide a file
  console.error("Usage: node index.js <file.csv>");
  process.exit(1);
}

// validation

function isAlnumMax20(s) {
  return typeof s === "string" && /^[a-z0-9]+$/i.test(s) && s.length <= 20;
}
function isEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}
function isPhone10(s) {
  return typeof s === "string" && /^\d{10}$/.test(s);
}
function isEircode6(s) {
  return typeof s === "string" && /^[0-9][a-z0-9]{5}$/i.test(s);
}


//validate a CSV file headers.must match
const EXPECTED_HEADERS = [
  "firstName",
  "secondName",
  "email",
  "phone",
  "eircode"
];

//validation of each row in the database-returns error
function validateDbRow(r) {
  const errors = [];
  if (!isAlnumMax20(r.first_name)) errors.push("first_name invalid");
  if (!isAlnumMax20(r.second_name)) errors.push("second_name invalid");
  if (!isEmail(r.email)) errors.push("email invalid");
  if (!isPhone10(r.phone_number)) errors.push("phone_number invalid");
  if (!isEircode6(r.eircode)) errors.push("eircode invalid");
  return errors;
}

//ensure the schema and the file are ok 

(async () => {
  await ensureSchema();

  const filePath = path.resolve(CSV_FILE);
  if (!fs.existsSync(filePath)) {
    console.error("CSV file not found:", filePath);
    process.exit(1);
  }
})


  //Reading the file from row 1 and increasing
fs.createReadStream(filePath)
  .pipe(csv())                            // to become a javascript object on each row
  .on("data", async (csvRow) => {
    const dbRow = mapRow(csvRow);
    
    try {                          //insert valid rows into the database
      await pool.query(              //mysql statement
        `INSERT INTO mysql_table                   
         (first_name, second_name, email, phone_number, eircode)
         VALUES (?,?,?,?,?)`,
        [
          dbRow.first_name,
          dbRow.second_name,
          dbRow.email,
          dbRow.phone_number,
          dbRow.eircode
        ]
      );
    } catch (e) {                          //database errors
      console.error("Insert failed:", e.message);
    }
  })
  .on("end", () => {                                    //When the cvs is fully processed
    console.log("CSV import complete");
    process.exit(0);
  })
  .on("error", e => {                             //file or convertion errors
    console.error("CSV error:", e.message);
    process.exit(1);
  });
