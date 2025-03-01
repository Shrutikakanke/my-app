const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET_KEY = "your_secret_key"; 

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Root#123",
  database: "expense_tracker_new",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected...");
});

// User Sign Up
app.post("/signup", (req, res) => {
  const { username, password } = req.body;
  const query = "INSERT INTO users (username, password) VALUES (?, ?)";
  db.query(query, [username, password], (err, result) => {
    if (err) return res.status(500).json({ error: "User already exists" });
    res.json({ message: "User registered successfully" });
  });
});


app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(query, [username, password], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1d" });
    res.json({ message: "Login successful", token });
  });
});


app.post("/expenses", (req, res) => {
  const { category, amount, comments } = req.body;
  const query = "INSERT INTO expenses (category, amount, comments) VALUES (?, ?, ?)";
  db.query(query, [category, amount, comments], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ id: result.insertId, category, amount, comments, created_at: new Date() });
  });
});

app.get("/expenses", (req, res) => {
  db.query("SELECT * FROM expenses ORDER BY created_at DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

app.put("/expenses/:id", (req, res) => {
  const { category, amount, comments } = req.body;
  const { id } = req.params;
  const query = "UPDATE expenses SET category=?, amount=?, comments=?, updated_at=NOW() WHERE id=?";
  db.query(query, [category, amount, comments, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Expense updated successfully" });
  });
});

app.delete("/expenses/:id", (req, res) => {
  db.query("DELETE FROM expenses WHERE id=?", [req.params.id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Expense deleted successfully" });
  });
});

app.listen(5000, () => console.log("Server running on port 5000"));
