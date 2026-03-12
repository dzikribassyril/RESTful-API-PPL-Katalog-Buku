'use strict';

require('dotenv').config();
const initSqlJs = require('sql.js');

const dummyBooks = [
  { isbn: '978-0-7432-7356-5', judul: 'The Great Gatsby',                pengarang: 'F. Scott Fitzgerald', penerbit: 'Scribner',           tahun_terbit: 1925, genre: 'Novel',        stok: 10 },
  { isbn: '978-0-06-112008-4', judul: 'To Kill a Mockingbird',           pengarang: 'Harper Lee',           penerbit: 'HarperCollins',      tahun_terbit: 1960, genre: 'Novel',        stok: 7  },
  { isbn: '978-0-14-028329-7', judul: '1984',                            pengarang: 'George Orwell',        penerbit: 'Penguin Books',      tahun_terbit: 1949, genre: 'Dystopia',     stok: 5  },
  { isbn: '978-0-7432-7357-2', judul: 'Pride and Prejudice',             pengarang: 'Jane Austen',          penerbit: 'Penguin Classics',   tahun_terbit: 1813, genre: 'Romance',      stok: 8  },
  { isbn: '978-0-618-68000-9', judul: 'The Lord of the Rings',           pengarang: 'J.R.R. Tolkien',       penerbit: 'Houghton Mifflin',   tahun_terbit: 1954, genre: 'Fantasy',      stok: 12 },
  { isbn: '978-0-7432-7000-7', judul: 'Harry Potter and the Sorcerers Stone', pengarang: 'J.K. Rowling', penerbit: 'Scholastic',       tahun_terbit: 1997, genre: 'Fantasy',      stok: 20 },
  { isbn: '978-0-14-303943-3', judul: 'The Catcher in the Rye',          pengarang: 'J.D. Salinger',        penerbit: 'Little, Brown',      tahun_terbit: 1951, genre: 'Novel',        stok: 6  },
  { isbn: '978-0-374-52815-0', judul: 'Brave New World',                 pengarang: 'Aldous Huxley',        penerbit: 'Harper Perennial',   tahun_terbit: 1932, genre: 'Dystopia',     stok: 9  },
  { isbn: '978-0-14-028054-8', judul: 'Animal Farm',                     pengarang: 'George Orwell',        penerbit: 'Penguin Books',      tahun_terbit: 1945, genre: 'Satire',       stok: 4  },
  { isbn: '978-0-7432-7001-4', judul: 'The Da Vinci Code',               pengarang: 'Dan Brown',            penerbit: 'Doubleday',          tahun_terbit: 2003, genre: 'Thriller',     stok: 14 },
  { isbn: '978-0-7432-7002-1', judul: 'The Alchemist',                   pengarang: 'Paulo Coelho',         penerbit: 'HarperOne',          tahun_terbit: 1988, genre: 'Fiction',      stok: 11 },
  { isbn: '978-0-06-093546-9', judul: 'To Kill a Kingdom',               pengarang: 'Alexandra Christo',    penerbit: 'Feiwel and Friends', tahun_terbit: 2018, genre: 'Fantasy',      stok: 3  },
  { isbn: '978-0-385-54734-9', judul: 'The Subtle Art of Not Giving a Fck', pengarang: 'Mark Manson',    penerbit: 'HarperOne',          tahun_terbit: 2016, genre: 'Self-Help',    stok: 15 },
  { isbn: '978-1-5011-1360-7', judul: 'Sapiens A Brief History of Humankind', pengarang: 'Yuval Noah Harari', penerbit: 'Harper',        tahun_terbit: 2011, genre: 'Non-Fiction',  stok: 18 },
  { isbn: '978-0-525-55360-5', judul: 'The Midnight Library',            pengarang: 'Matt Haig',            penerbit: 'Viking',             tahun_terbit: 2020, genre: 'Fiction',      stok: 13 },
];

async function seed() {
  const path = require('path');
  const fs   = require('fs');
  const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/books.db');

  const SQL = await initSqlJs();
  let db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      isbn TEXT UNIQUE NOT NULL,
      judul TEXT NOT NULL,
      pengarang TEXT NOT NULL,
      penerbit TEXT NOT NULL,
      tahun_terbit INTEGER NOT NULL,
      genre TEXT,
      stok INTEGER NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  let count = 0;
  for (const b of dummyBooks) {
    try {
      db.run(
        'INSERT OR IGNORE INTO books (isbn, judul, pengarang, penerbit, tahun_terbit, genre, stok) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [b.isbn, b.judul, b.pengarang, b.penerbit, b.tahun_terbit, b.genre, b.stok]
      );
      count++;
    } catch (e) { /* skip duplikat */ }
  }

  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
  db.close();
  console.log(`✅ Seed selesai: ${count} buku berhasil di-insert ke ${DB_PATH}`);
}

seed().catch(console.error);
