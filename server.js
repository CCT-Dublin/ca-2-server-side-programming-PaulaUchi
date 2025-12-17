
//server set up/loading environments
require("dotenv").config();
const express = require("express");
const path = require("path");
const helmet = require("helmet");
const { db, ensureSchema } = require("./db");

const app = express();

// importing security middleware
app.use(express.json());
app.use(helmet());

//Serve static files (HTML + CSS)
app.use(express.static(__dirname));

//root to route
app.get("/", (req, res) => { 
  res.sendFile(path.join(__dirname, "form.html"));
});

app.post("/api/submit", async (req, res) => {         // to process the data sent to the api
  try {
    const r = req.body;

// server validation

function validate(r) {
  return (
    /^[a-z0-9]{1,20}$/i.test(r.first_name) &&
    /^[a-z0-9]{1,20}$/i.test(r.second_name) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email) &&
    /^\d{10}$/.test(r.phone_number) &&
    /^[0-9][a-z0-9]{5}$/i.test(r.eircode)
  );
}

    // validation and security

    if (!validate(r)) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // schema check before inserting data

    await ensureSchema();

    // query for database
    await db.query(
      `INSERT INTO mysql_table
       (first_name, second_name, email, phone_number, eircode)
       VALUES (?, ?, ?, ?, ?)`,
      [r.first_name, r.second_name, r.email, r.phone_number, r.eircode]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);

server.on("error", (err) => {     //check error and gives a message
  if (err.code === "EADDRINUSE") { //por alredy in use
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error("Server error:", err.message);
  }
});
