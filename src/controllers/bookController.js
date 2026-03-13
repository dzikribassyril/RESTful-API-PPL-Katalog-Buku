'use strict';

const { getReadyPromise, queryAll, queryOne, run } = require('../db');

// Respons helper
const success = (res, data, statusCode = 200, message = null) => {
  const body = { status: 'success' };
  if (message) body.message = message;
  body.data = data;
  return res.status(statusCode).json(body);
};

const error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ status: 'error', message });
};

// Middleware: pastikan DB sudah siap sebelum request diproses
const withDb = (handler) => async (req, res) => {
  try {
    await getReadyPromise();
    return await handler(req, res);
  } catch (err) {
    console.error(err);
    return error(res, 'Terjadi kesalahan internal pada server.', 500);
  }
};

// GET /api/books
const getAllBooks = withDb(async (req, res) => {
  const { search } = req.query;

  let books = [];
  if (search) {
    // Cari berdasarkan judul atau pengarang
    const keyword = `%${search}%`;
    books = queryAll('SELECT * FROM books WHERE judul LIKE ? OR pengarang LIKE ? ORDER BY id ASC', [keyword, keyword]);
  } else {
    // Ambil semua jika tidak ada search query
    books = queryAll('SELECT * FROM books ORDER BY id ASC');
  }

  return success(res, books);
});

// GET /api/books/:id
const getBookById = withDb(async (req, res) => {
  const { id } = req.params;
  const book = queryOne('SELECT * FROM books WHERE id = ?', [id]);
  if (!book) return error(res, 'Buku tidak ditemukan.', 404);
  return success(res, book);
});

// POST /api/books
const createBook = withDb(async (req, res) => {
  const { isbn, judul, pengarang, penerbit, tahun_terbit, genre, stok } = req.body;

  if (!isbn || !judul || !pengarang || !penerbit || !tahun_terbit) {
    return error(res, 'Field isbn, judul, pengarang, penerbit, dan tahun_terbit wajib diisi.', 400);
  }

  // Cek ISBN duplikat
  const existing = queryOne('SELECT id FROM books WHERE isbn = ?', [isbn]);
  if (existing) return error(res, `ISBN '${isbn}' sudah terdaftar.`, 409);

  try {
    const result = run(
      'INSERT INTO books (isbn, judul, pengarang, penerbit, tahun_terbit, genre, stok) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [isbn, judul, pengarang, penerbit, Number(tahun_terbit), genre || null, stok !== undefined ? Number(stok) : 0],
      'isbn',
      isbn
    );
    const newBook = queryOne('SELECT * FROM books WHERE id = ?', [result.lastInsertRowid]);
    return success(res, newBook, 201, 'Buku berhasil ditambahkan.');
  } catch (err) {
    return error(res, 'Gagal menambahkan buku.', 500);
  }
});

// PUT /api/books/:id
const updateBook = withDb(async (req, res) => {
  const { id } = req.params;
  const existing = queryOne('SELECT * FROM books WHERE id = ?', [id]);
  if (!existing) return error(res, 'Buku tidak ditemukan.', 404);

  const { isbn, judul, pengarang, penerbit, tahun_terbit, genre, stok } = req.body;

  // Cek ISBN duplikat jika diubah
  if (isbn && isbn !== existing.isbn) {
    const dup = queryOne('SELECT id FROM books WHERE isbn = ? AND id != ?', [isbn, id]);
    if (dup) return error(res, `ISBN '${isbn}' sudah digunakan buku lain.`, 409);
  }

  run(
    `UPDATE books SET
      isbn         = ?,
      judul        = ?,
      pengarang    = ?,
      penerbit     = ?,
      tahun_terbit = ?,
      genre        = ?,
      stok         = ?
    WHERE id = ?`,
    [
      isbn         ?? existing.isbn,
      judul        ?? existing.judul,
      pengarang    ?? existing.pengarang,
      penerbit     ?? existing.penerbit,
      tahun_terbit !== undefined ? Number(tahun_terbit) : existing.tahun_terbit,
      genre        ?? existing.genre,
      stok         !== undefined ? Number(stok) : existing.stok,
      Number(id),
    ]
  );

  const updatedBook = queryOne('SELECT * FROM books WHERE id = ?', [id]);
  return success(res, updatedBook, 200, 'Buku berhasil diperbarui.');
});

// DELETE /api/books/:id
const deleteBook = withDb(async (req, res) => {
  const { id } = req.params;
  const existing = queryOne('SELECT * FROM books WHERE id = ?', [id]);
  if (!existing) return error(res, 'Buku tidak ditemukan.', 404);

  run('DELETE FROM books WHERE id = ?', [Number(id)]);
  return success(res, null, 200, `Buku dengan id ${id} berhasil dihapus.`);
});

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook };
