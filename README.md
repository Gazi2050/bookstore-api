# 📚 Bookstore API

A simple, RESTful API for managing authors and books. Built using **Node.js**, **Express**, **TypeScript**, **PostgreSQL**, and **Knex**.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Gazi2050/bookstore-api.git
cd bookstore-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_postgresql_connection_string
```

Or copy the example file:

```bash
cp .env.example .env
```

### 4. Run Migrations

```bash
npx knex migrate:latest
```

### 5. Start the Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

## 📘 API Documentation

### 🔹 Authors

- `GET /authors` — Retrieve all authors  
- `GET /authors/:id` — Get author by ID  
- `POST /authors` — Create a new author  

  **Example Request Body:**
  ```json
  {
    "name": "Jane Austen",
    "bio": "British novelist known for Pride and Prejudice",
    "birthdate": "1775-12-16"
  }
  ```

- `PUT /authors/:id` — Update an author  
- `DELETE /authors/:id` — Delete an author (only if no books are linked)  
- `GET /authors/:id/books` — List all books by the author  

### 🔹 Books

- `GET /books` — Retrieve all books  
  - Supports filter: `?author=1` (by author ID)

- `GET /books/:id` — Get book by ID  
- `POST /books` — Create a new book  

  **Example Request Body:**
  ```json
  {
    "title": "Pride and Prejudice",
    "description": "A classic novel about manners and marriage",
    "published_date": "1813-01-28",
    "author_id": 1
  }
  ```

- `PUT /books/:id` — Update a book  
- `DELETE /books/:id` — Delete a book  

## 📬 Postman Collection

Use the API with Postman:  
🔗 [Bookstore API Collection](https://www.postman.com/gazi2050/public-collection/collection/3c8q1ox/bookstore-api)

## 🛠 Tech Stack

### Backend
- **Node.js** – JavaScript runtime
- **Express** – Web framework
- **TypeScript** – Typed superset of JavaScript

### Database
- **PostgreSQL** – SQL database
- **Knex.js** – SQL query builder

### Validation
- **express-validator** – Request validation

### Environment
- **dotenv** – Manage environment variables

### Development
- **ts-node-dev** – Hot reload TypeScript
- **ts-node**, **nodemon**

### Linting & Formatting
- **ESLint**, **Prettier**
- **eslint-plugin-prettier**, **eslint-config-prettier**

### TypeScript Support
- **@types/node**, **@types/express**, **@types/knex**

## 📁 Project Structure
```bash
bookstore-api/
├─] .env (ignored)
├── .env.example
├── .gitignore
├── .prettierrc
├─] .vercel/ (ignored)
├─] dist/ (ignored)
├── eslint.config.mjs
├── knexfile.ts
├── migrations/
│   └── 20250428073748_create_authors_and_books_tables.ts
├─] node_modules/ (ignored)
├── package-lock.json
├── package.json
├── README.md
├── src/
│   ├── config/
│   │   └── db.ts
│   ├── index.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── validate.ts
│   ├── routes/
│   │   ├── authorRoutes.ts
│   │   └── bookRoutes.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── asyncHandler.ts
│       └── httpError.ts
├── tsconfig.json
└── vercel.json
```