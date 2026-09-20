const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { initDb, dbPath } = require('./init');

if (!fs.existsSync(dbPath)) {
  initDb();
}

const db = new sqlite3.Database(dbPath);
db.run("PRAGMA foreign_keys = ON;");

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

module.exports = { db, query, get, run };
