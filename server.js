/**
 * Pharma Inventory Management Backend with Node.js, Express, and SQLite
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const DBSOURCE = 'pharma_inventory.db';

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Could not open database', err);
  } else {
    console.log('Connected to SQLite database');
    db.run(`CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      expiry TEXT NOT NULL,
      batch TEXT NOT NULL
    )`, (err) => {
      if (err) {
        console.error('Table creation error:', err);
      }
    });
  }
});

// API Endpoints

// Get all inventory items
app.get('/api/inventory', (req, res) => {
  const sql = 'SELECT * FROM inventory ORDER BY id DESC';
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({error: err.message});
      return;
    }
    res.json(rows);
  });
});

// Add new inventory item
app.post('/api/inventory', (req, res) => {
  const { name, quantity, expiry, batch } = req.body;
  if (!name || !quantity || !expiry || !batch) {
    res.status(400).json({error: 'Please provide all required fields'});
    return;
  }
  const sql = 'INSERT INTO inventory (name, quantity, expiry, batch) VALUES (?, ?, ?, ?)';
  const params = [name, quantity, expiry, batch];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({error: err.message});
      return;
    }
    res.status(201).json({id: this.lastID, name, quantity, expiry, batch});
  });
});

// Update existing inventory item
app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const { name, quantity, expiry, batch } = req.body;
  if (!name || !quantity || !expiry || !batch) {
    res.status(400).json({error: 'Please provide all required fields'});
    return;
  }
  const sql = 'UPDATE inventory SET name = ?, quantity = ?, expiry = ?, batch = ? WHERE id = ?';
  const params = [name, quantity, expiry, batch, id];
  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({error: err.message});
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({error: 'Inventory item not found'});
      return;
    }
    res.json({id: Number(id), name, quantity, expiry, batch});
  });
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM inventory WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      res.status(500).json({error: err.message});
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({error: 'Inventory item not found'});
      return;
    }
    res.json({message: 'Deleted successfully', id: Number(id)});
  });
});

// Serve the frontend file statically (optional)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(port, () => {
  console.log(`Pharma Inventory API server running on port ${port}`);
});

