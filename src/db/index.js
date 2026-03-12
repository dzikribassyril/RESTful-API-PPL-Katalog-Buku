'use strict';

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/books.db');
const IS_MEMORY = DB_PATH === ':memory:';

let db = null;

/**
 * Inisialisasi database secara synchronous-like dengan flag ready
 */
let ready = false;
let readyPromise = null;

function getReadyPromise() {
  if (readyPromise) return readyPromise;

  readyPromise = initSqlJs().then((SQL) => {
    if (IS_MEMORY) {
      db = new SQL.Database();
    } else {
      // Pastikan folder ada
      const dir = path.dirname(DB_PATH);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Load existing atau buat baru
      if (fs.existsSync(DB_PATH)) {
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
      } else {
        db = new SQL.Database();
      }
    }

    // Buat tabel
    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        isbn        TEXT    UNIQUE NOT NULL,
        judul       TEXT    NOT NULL,
        pengarang   TEXT    NOT NULL,
        penerbit    TEXT    NOT NULL,
        tahun_terbit INTEGER NOT NULL,
        genre       TEXT,
        stok        INTEGER NOT NULL DEFAULT 0,
        created_at  TEXT    DEFAULT (datetime('now'))
      );
    `);

    ready = true;
    return db;
  });

  return readyPromise;
}

/**
 * Simpan database ke file (panggil setelah operasi write)
 */
function persist() {
  if (!IS_MEMORY && db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Helper: jalankan query SELECT dan kembalikan semua baris sebagai array of object
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

/**
 * Helper: jalankan query SELECT dan kembalikan satu baris
 */
function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Helper: jalankan query INSERT/UPDATE/DELETE
 */
function run(sql, params = []) {
  db.run(sql, params);
  persist();
  // Kembalikan last insert rowid
  const result = queryOne('SELECT last_insert_rowid() AS id');
  return { lastInsertRowid: result ? result.id : null };
}

module.exports = { getReadyPromise, queryAll, queryOne, run };
