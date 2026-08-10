# Book Catalog REST API

A RESTful API for managing a book catalog — ISBN, title, author, publisher, year, genre, and stock — with unit tests, a security-scan workflow, and automated deployment.

[![CI](https://github.com/dzikribassyril/book-catalog-rest-api/actions/workflows/ci.yml/badge.svg)](https://github.com/dzikribassyril/book-catalog-rest-api/actions/workflows/ci.yml)
[![Security Scan](https://github.com/dzikribassyril/book-catalog-rest-api/actions/workflows/cs.yml/badge.svg)](https://github.com/dzikribassyril/book-catalog-rest-api/actions/workflows/cs.yml)
[![CD](https://github.com/dzikribassyril/book-catalog-rest-api/actions/workflows/cd.yml/badge.svg)](https://github.com/dzikribassyril/book-catalog-rest-api/actions/workflows/cd.yml)
![Node](https://img.shields.io/badge/Node.js-20-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- Full CRUD: ISBN, title, author, publisher, publication year, genre, and stock
- Search books by title or author via `?search=`
- File-backed SQLite storage (sql.js WASM), persisted on every write
- Unit tests with Jest + Supertest, enforced in CI
- Security-scan workflow and self-hosted deploy workflow
- Docker image with a named volume so data survives restarts

## Tech Stack

| Area | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Database | SQLite via sql.js (WASM), file-backed |
| Testing | Jest, Supertest |
| CI/CD | GitHub Actions (unit test, security scan, deploy) |
| Container | Docker + Docker Compose |

## Project Structure

```text
.
├── src/
│   ├── server.js                    # Entry point (port from PORT, default 3000)
│   ├── routes/books.js              # /api/books routes
│   ├── controllers/bookController.js
│   └── db/
│       ├── index.js                 # sql.js init, schema, persistence
│       └── seed.js                  # Seed data (npm run seed)
├── tests/books.test.js              # Supertest integration tests
├── .github/workflows/               # ci.yml, cs.yml (security), cd.yml (deploy)
├── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Local

```bash
npm install
npm run seed      # optional: load the sample catalog
npm run dev       # nodemon, or: npm start
```

### Docker

```bash
docker compose up --build
```

The API listens on `http://localhost:3000`.

## API Reference

All responses use a `status` / `data` envelope.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/books` | List all books, or `?search=keyword` to filter by title or author |
| GET | `/api/books/:id` | Get one book |
| POST | `/api/books` | Add a book |
| PUT | `/api/books/:id` | Update a book |
| DELETE | `/api/books/:id` | Delete a book |

Example response (`GET /api/books/1`):

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

## Tests

```bash
npm test
```

## License

MIT — see [LICENSE](LICENSE).
