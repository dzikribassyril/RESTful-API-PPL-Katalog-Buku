'use strict';

process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../src/server');

// ─── Payload ──────────────────────────────────────────────────────────────────
const validBook = {
  isbn: '978-9-9999-0001-0',
  judul: 'Buku Test Pertama',
  pengarang: 'Penulis Tes',
  penerbit: 'Penerbit Tes',
  tahun_terbit: 2024,
  genre: 'Testing',
  stok: 5,
};

let createdId;

// ─── GET /api/books ────────────────────────────────────────────────────────────
describe('GET /api/books', () => {
  it('harus merespons 200 dan mengembalikan array', async () => {
    const res = await request(app).get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('harus bisa mencari buku berdasar keyword judul atau pengarang', async () => {
    // Search dengan keyword yang tidak mungkin ada agar array kosong
    const resEmpty = await request(app).get('/api/books?search=xyz123abc');
    expect(resEmpty.statusCode).toBe(200);
    expect(resEmpty.body.data.length).toBe(0);

    // Bikin buku baru khusus buat test ini di dalam memory db
    await request(app).post('/api/books').send({
      isbn: 'search-12345',
      judul: 'Belajar Pencarian Buku',
      pengarang: 'Bapak Budi',
      penerbit: 'Gramedia',
      tahun_terbit: 2024
    });

    const resHit = await request(app).get('/api/books?search=budi');
    expect(resHit.statusCode).toBe(200);
    expect(resHit.body.data.length).toBeGreaterThanOrEqual(1);
    expect(resHit.body.data[0].pengarang.toLowerCase()).toContain('budi');
  });
});

// ─── POST /api/books ───────────────────────────────────────────────────────────
describe('POST /api/books', () => {
  it('harus berhasil membuat buku baru (201)', async () => {
    const res = await request(app).post('/api/books').send(validBook);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.judul).toBe(validBook.judul);
    createdId = res.body.data.id;
  });

  it('harus mengembalikan 400 jika field wajib kosong', async () => {
    const res = await request(app).post('/api/books').send({ judul: 'Tanpa ISBN' });
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });

  it('harus mengembalikan 409 jika ISBN duplikat', async () => {
    const res = await request(app).post('/api/books').send(validBook);
    expect(res.statusCode).toBe(409);
    expect(res.body.status).toBe('error');
  });
});

// ─── GET /api/books/:id ────────────────────────────────────────────────────────
describe('GET /api/books/:id', () => {
  it('harus mengembalikan buku yang ada (200)', async () => {
    const res = await request(app).get(`/api/books/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.id).toBe(createdId);
  });

  it('harus mengembalikan 404 untuk id yang tidak ada', async () => {
    const res = await request(app).get('/api/books/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toMatch(/tidak ditemukan/i);
  });
});

// ─── PUT /api/books/:id ────────────────────────────────────────────────────────
describe('PUT /api/books/:id', () => {
  it('harus berhasil memperbarui buku (200)', async () => {
    const res = await request(app)
      .put(`/api/books/${createdId}`)
      .send({ stok: 99, genre: 'Updated Genre' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.stok).toBe(99);
    expect(res.body.data.genre).toBe('Updated Genre');
  });

  it('harus mengembalikan 404 untuk id yang tidak ada', async () => {
    const res = await request(app).put('/api/books/99999').send({ stok: 1 });
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });
});

// ─── DELETE /api/books/:id ─────────────────────────────────────────────────────
describe('DELETE /api/books/:id', () => {
  it('harus berhasil menghapus buku (200)', async () => {
    const res = await request(app).delete(`/api/books/${createdId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
  });

  it('harus mengembalikan 404 setelah buku dihapus', async () => {
    const res = await request(app).get(`/api/books/${createdId}`);
    expect(res.statusCode).toBe(404);
  });

  it('harus mengembalikan 404 untuk id yang tidak ada', async () => {
    const res = await request(app).delete('/api/books/99999');
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });
});
