require("dotenv").config();
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { pool, ensureSchema } = require("./db");

const CSV_FILE = process.argv[2]; // e.g. node index.js data.csv
if (!CSV_FILE) {
  console.error("Usage: node index.js <file.csv>");
  process.exit(1);
}

// --- Validation rules (same as spec) ---
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
  return typeof s === "string" && /^[0-9][a-z0-9]{5}$/i.test(s); // starts with number, alnum, len 6
}

// --- Adjust these to your CSV headers ---
const EXPECTED_HEADERS = ["firstName", "secondName", "email", "phone", "eircode"];

// Map CSV row -> DB row (snake_case columns!)
function mapRow(csvRow) {
  return {
    first_name: (csvRow.firstName ?? "").trim(),
    second_name: (csvRow.secondName ?? "").trim(),
    email: (csvRow.email ?? "").trim(),
    phone_number: String(csvRow.phone ?? "").trim(),
    eircode: (csvRow.eircode ?? "").trim(),
  };
}

function validateDbRow(r) {
  const errors = [];
  if (!isAlnumMax20(r.first_name)) errors.push("first_name invalid");
  if (!isAlnumMax20(r.second_name)) errors.push("second_name invalid");
  if (!isEmail(r.email)) errors.push("email invalid");
  if (!isPhone10(r.phone_number)) errors.push("phone_number invalid");
  if (!isEircode6(r.eircode)) errors.push("eircode invalid");
  return errors;
}

async function insertValidRows(validRows) {
  if (validRows.length === 0) return { inserted: 0 };

  // Parameterized bulk insert to avoid SQL injection
  const cols = ["first_name", "second_name", "email", "phone_number", "eircode"];
  const values = validRows.map(r => cols.map(c => r[c]));
  const sql = `
    INSERT INTO mysql_table (${cols.join(", ")})
    VALUES ${values.map(() => "(?,?,?,?,?)").join(", ")}
  `;

  const flat = values.flat();
  const [res] = await pool.query(sql, flat);
  return { inserted: res.affectedRows ?? validRows.length };
}

(async () => {
  try {
    // (C) Ensure schema is correct BEFORE saving anything
    await ensureSchema();

    const filePath = path.resolve(CSV_FILE);
    if (!fs.existsSync(filePath)) {
      console.error("CSV file not found:", filePath);
      process.exit(1);
    }

    let rowNumber = 1; // header is row 1 in most spreadsheets
    const valid = [];
    const invalid = [];

    const stream = fs.createReadStream(filePath).pipe(csv());

    stream.on("headers", (headers) => {
      // Optional: enforce expected headers
      const missing = EXPECTED_HEADERS.filter(h => !headers.includes(h));
      if (missing.length) {
        console.error("CSV missing headers:", missing.join(", "));
        stream.destroy(new Error("Bad CSV headers"));
      }
    });

    stream.on("data", (csvRow) => {
      rowNumber += 1; // first data row becomes 2
      const dbRow = mapRow(csvRow);
      const errs = validateDbRow(dbRow);

      if (errs.length) {
        invalid.push({ row: rowNumber, errors: errs });
        console.error(`Row ${rowNumber} invalid: ${errs.join("; ")}`);
      } else {
        valid.push(dbRow);
      }
    });

    stream.on("error", (err) => {
      console.error("CSV read error:", err.message);
      process.exit(1);
    });

    stream.on("end", async () => {
      try {
        const result = await insertValidRows(valid);
        console.log(`Done. Inserted ${result.inserted} valid rows.`);
        console.log(`Rejected ${invalid.length} invalid rows.`);
        process.exit(0);
      } catch (e) {
        console.error("Insert error:", e.message);
        process.exit(1);
      }
    });
  } catch (e) {
    console.error("Fatal:", e.message);
    process.exit(1);
  }
})();
