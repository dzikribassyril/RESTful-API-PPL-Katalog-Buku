# RESTful API Katalog Buku

![CI](https://github.com/dzikribassyril/RESTful-API-PPL/actions/workflows/ci.yml/badge.svg)
![CS](https://github.com/dzikribassyril/RESTful-API-PPL/actions/workflows/cs.yml/badge.svg)
![CD](https://github.com/dzikribassyril/RESTful-API-PPL/actions/workflows/cd.yml/badge.svg)

---

## 📋 Deskripsi Project

API ini memungkinkan pengguna untuk mengelola data katalog buku (CRUD) mencakup informasi ISBN, judul, pengarang, penerbit, tahun terbit, genre, dan stok. Data disimpan menggunakan SQLite (file-based) sehingga tidak memerlukan server database terpisah.

## 📡 Dokumentasi API

Base URL: `http://localhost:3000/api/books`

### Endpoints

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/books` | Ambil semua buku |
| GET | `/api/books/:id` | Ambil buku berdasarkan ID |
| POST | `/api/books` | Tambah buku baru |
| PUT | `/api/books/:id` | Update data buku |
| DELETE | `/api/books/:id` | Hapus buku |

---

### GET `/api/books`

**Respons Sukses (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "isbn": "978-0-7432-7356-5",
      "judul": "The Great Gatsby",
      "pengarang": "F. Scott Fitzgerald",
      "penerbit": "Scribner",
      "tahun_terbit": 1925,
      "genre": "Novel",
      "stok": 10,
      "created_at": "2024-01-01 00:00:00"
    }
  ]
}
```

---

### GET `/api/books/:id`

**Respons Sukses (200):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "isbn": "978-0-7432-7356-5",
    "judul": "The Great Gatsby",
    "pengarang": "F. Scott Fitzgerald",
    "penerbit": "Scribner",
    "tahun_terbit": 1925,
    "genre": "Novel",
    "stok": 10,
    "created_at": "2024-01-01 00:00:00"
  }
}
```

**Respons Error (404):**
```json
{
  "status": "error",
  "message": "Buku tidak ditemukan."
}
```

---

### POST `/api/books`

**Request Body:**
```json
{
  "isbn": "978-0-1234-5678-9",
  "judul": "Judul Buku Baru",
  "pengarang": "Nama Pengarang",
  "penerbit": "Nama Penerbit",
  "tahun_terbit": 2024,
  "genre": "Fiksi",
  "stok": 10
}
```

**Respons Sukses (201):**
```json
{
  "status": "success",
  "message": "Buku berhasil ditambahkan.",
  "data": {
    "id": 16,
    "isbn": "978-0-1234-5678-9",
    "judul": "Judul Buku Baru",
    "pengarang": "Nama Pengarang",
    "penerbit": "Nama Penerbit",
    "tahun_terbit": 2024,
    "genre": "Fiksi",
    "stok": 10,
    "created_at": "2024-01-01 00:00:00"
  }
}
```

**Respons Error (400) - Field wajib kosong:**
```json
{
  "status": "error",
  "message": "Field isbn, judul, pengarang, penerbit, dan tahun_terbit wajib diisi."
}
```

**Respons Error (409) - ISBN duplikat:**
```json
{
  "status": "error",
  "message": "ISBN '978-0-1234-5678-9' sudah terdaftar."
}
```

---

### PUT `/api/books/:id`

**Request Body** (semua field opsional, hanya field yang dikirim yang diupdate):
```json
{
  "stok": 20,
  "genre": "Klasik"
}
```

**Respons Sukses (200):**
```json
{
  "status": "success",
  "message": "Buku berhasil diperbarui.",
  "data": { "id": 1, "stok": 20, "genre": "Klasik", "..." : "..." }
}
```

---

### DELETE `/api/books/:id`

**Respons Sukses (200):**
```json
{
  "status": "success",
  "message": "Buku dengan id 1 berhasil dihapus.",
  "data": null
}
```

---

## Alur Kerja Git

### Strategi Branch

```
main
  └── develop
        ├── feature/setup-project
        ├── feature/database-sqlite
        ├── feature/crud-books
        ├── feature/unit-tests
        ├── feature/docker
        ├── feature/github-actions
        └── feature/dokumentasi
```

### Conventional Commits

Format: `<type>: <deskripsi singkat>`

| Type | Kegunaan |
|------|----------|
| `feat` | Fitur baru |
| `fix` | Perbaikan bug |
| `test` | Menambah/memperbaiki test |
| `ci` | Perubahan konfigurasi CI/CD |
| `chore` | Konfigurasi, tooling |
| `docs` | Dokumentasi |

**Contoh commit:**
```
feat: add SQLite connection and books table migration
feat: add GET /api/books endpoint
feat: add POST /api/books with ISBN validation
test: add unit tests for books CRUD endpoints
ci: add GitHub Actions CI workflow
ci: add Trivy security scan workflow
ci: add SSH deployment workflow to Debian server
chore: add Dockerfile and docker-compose
docs: add complete API documentation to README
```

---

## Status GitHub Actions

### CI - Unit Test (`ci.yml`)
- **Trigger:** Push & Pull Request ke `main` dan `develop`
- **Tool:** Jest + Supertest
- **Fungsi:** Menjalankan semua unit test secara otomatis, memastikan tidak ada kode rusak yang masuk ke branch utama.

### CS - Security Scan (`cs.yml`)
- **Trigger:** Push & Pull Request ke `main` dan `develop`
- **Tool:** [Trivy](https://github.com/aquasecurity/trivy) oleh Aqua Security
- **Fungsi:** Memindai kerentanan keamanan pada dependencies (filesystem) dan base image Docker. Hasil diunggah ke tab **Security → Code Scanning** di GitHub.

### CD - Deploy ke Debian (`cd.yml`)
- **Trigger:** Push ke `main` saja
- **Tool:** [appleboy/ssh-action](https://github.com/appleboy/ssh-action)
- **Fungsi:** Deploy otomatis ke server Debian via SSH. Melakukan `git pull` + `docker compose up -d --build`.
- **Secrets yang dibutuhkan (Settings → Secrets → Actions):**
  | Secret | Contoh | Keterangan |
  |--------|--------|------------|
  | `SSH_HOST` | `192.168.1.1` | IP/domain server |
  | `SSH_USER` | `debian` | Username SSH |
  | `SSH_PRIVATE_KEY` | `-----BEGIN...` | Private key SSH |
  | `SSH_PORT` | `22` | Port SSH (opsional) |
