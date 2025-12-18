
//server set up
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { db: pool, ensureSchema } = require("./db");

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

const filePath = path.resolve(CSV_FILE);

//ensure the schema and the file are ok 

(async () => {
  await ensureSchema();

  if (!fs.existsSync(filePath)) {
    console.error("CSV file not found:", filePath);
    process.exit(1);
  }

  //Reading the file from row 1 and increasing

  let rowNumber = 1; 

fs.createReadStream(filePath)   // will read the file line by line
  .pipe(csv({
  mapHeaders: ({ header }) => header.replace(/^\uFEFF/, "").trim()    //removes the bom character              //converts to an js object
}))     
                 
  .on("data", async (csvRow) => {
    rowNumber++;

    const dbRow = {               //check every header to match the database    
      first_name: (csvRow.first_name || "").trim(),             // all headers must match the csv file
      second_name: (csvRow.last_name || "").trim(),
      email: (csvRow.email || "").trim(),
      phone_number: (csvRow.phone || "").trim(),
      eircode: (csvRow.eir_code || "").trim()
    };

    const errors = validateDbRow(dbRow);

    if (errors.length > 0) {
      console.error(`Row ${rowNumber} invalid: ${errors.join(", ")}`);
      return;                                        // skip invalid rows + rown number
    }
    try {
      await pool.query(                //if validation ok, it will insert the good rows in the table
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
    } catch (e) {
      console.error(`Row ${rowNumber} DB error:`, e.message);
    }
  });
})();
 