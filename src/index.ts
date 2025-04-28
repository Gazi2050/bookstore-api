import express, { Request, Response, NextFunction } from 'express';
import knex from 'knex';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';
import { ErrorRequestHandler } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());

// Initialize Database connection
const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

// Type definitions
interface ApiError extends Error {
    statusCode?: number;
}

// Async handler wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Validation middleware
const validate = (validations: ReturnType<typeof body>[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
            return;
        }

        res.status(400).json({ errors: errors.array() });
    };
};

// Custom error handler middleware
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.error('Error Handler Invoked:');
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    console.error('Request URL:', req.originalUrl);
    console.error('Request Method:', req.method);

    const statusCode = (err as ApiError).statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    if (res && typeof res.status === 'function') {
        res.status(statusCode).json({
            error: message
        });
    } else {
        console.error('Invalid response object in error handler');
        if (process.env.NODE_ENV !== 'production') {
            console.error('Response object:', res);
        }
    }

    next();
};

// Create a custom error class
class HttpError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Bookstore API',
            version: '1.0.0',
            description: 'API for managing authors and books',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
            },
        ],
    },
    apis: ['./src/index.ts'], // Adjust if needed (e.g., ['./index.ts'] if in root)
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Welcome Route
/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome to the Bookstore API
 *     description: Returns a welcome message with API details and available endpoints
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 version:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to the Bookstore API',
        version: '1.0.0',
        documentation: 'API Documentation at /api-docs',
        endpoints: {
            authors: {
                get_all: 'GET /authors',
                get_one: 'GET /authors/:id',
                create: 'POST /authors',
                update: 'PUT /authors/:id',
                delete: 'DELETE /authors/:id',
                get_books: 'GET /authors/:id/books'
            },
            books: {
                get_all: 'GET /books',
                get_all_by_author: 'GET /books?author=:authorId',
                get_one: 'GET /books/:id',
                create: 'POST /books',
                update: 'PUT /books/:id',
                delete: 'DELETE /books/:id'
            }
        }
    });
});

// Routes
// --- Author Routes ---
const authorRoutes = express.Router();

/**
 * @swagger
 * /authors:
 *   get:
 *     summary: Get all authors
 *     description: Retrieve a list of all authors
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   bio:
 *                     type: string
 *                   birthdate:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error
 */
authorRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
    const authors = await db('authors').select('*');
    res.json(authors);
}));

/**
 * @swagger
 * /authors/{id}:
 *   get:
 *     summary: Get author by ID
 *     description: Retrieve a single author by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 birthdate:
 *                   type: string
 *                   format: date
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
authorRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const author = await db('authors').where({ id: Number(id) }).first();

    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    res.json(author);
}));

/**
 * @swagger
 * /authors:
 *   post:
 *     summary: Create a new author
 *     description: Create a new author with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthdate
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 birthdate:
 *                   type: string
 *                   format: date
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
authorRoutes.post('/', validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('birthdate').isISO8601().toDate().withMessage('Birthdate must be a valid date'),
]), asyncHandler(async (req: Request, res: Response) => {
    const { name, bio, birthdate } = req.body;
    const [author] = await db('authors')
        .insert({ name, bio, birthdate })
        .returning('*');

    res.status(201).json(author);
}));

/**
 * @swagger
 * /authors/{id}:
 *   put:
 *     summary: Update an author
 *     description: Update an existing author's details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Author ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - birthdate
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               birthdate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 bio:
 *                   type: string
 *                 birthdate:
 *                   type: string
 *                   format: date
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
authorRoutes.put('/:id', validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('birthdate').isISO8601().toDate().withMessage('Birthdate must be a valid date'),
]), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, bio, birthdate } = req.body;

    const [author] = await db('authors')
        .where({ id: Number(id) })
        .update({ name, bio, birthdate })
        .returning('*');

    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    res.json(author);
}));

/**
 * @swagger
 * /authors/{id}:
 *   delete:
 *     summary: Delete an author
 *     description: Delete an author by their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Author ID
 *     responses:
 *       204:
 *         description: Author deleted successfully
 *       400:
 *         description: Cannot delete author with associated books
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
authorRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const books = await db('books').where({ author_id: Number(id) });
    if (books.length > 0) {
        throw new HttpError('Cannot delete author with associated books', 400);
    }

    const deleted = await db('authors').where({ id: Number(id) }).del();

    if (!deleted) {
        throw new HttpError('Author not found', 404);
    }

    res.status(204).send();
}));

/**
 * @swagger
 * /authors/{id}/books:
 *   get:
 *     summary: Get books by author
 *     description: Retrieve all books written by a specific author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Author ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     birthdate:
 *                       type: string
 *                       format: date
 *                 books:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       published_date:
 *                         type: string
 *                         format: date
 *                       author_id:
 *                         type: integer
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
authorRoutes.get('/:id/books', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const author = await db('authors').where({ id: Number(id) }).first();
    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    const books = await db('books').where({ author_id: Number(id) });
    res.json({ author, books });
}));

// --- Book Routes ---
const bookRoutes = express.Router();

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     description: Retrieve a list of all books, optionally filtered by author
 *     parameters:
 *       - in: query
 *         name: author
 *         schema:
 *           type: integer
 *         description: Author ID to filter books
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   published_date:
 *                     type: string
 *                     format: date
 *                   author_id:
 *                     type: integer
 *                   author_name:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
bookRoutes.get('/', asyncHandler(async (req: Request, res: Response) => {
    const { author } = req.query;

    let query = db('books')
        .select('books.*', 'authors.name as author_name')
        .leftJoin('authors', 'books.author_id', 'authors.id');

    if (author) {
        query = query.where({ author_id: Number(author) });
    }

    const books = await query;
    res.json(books);
}));

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Get book by ID
 *     description: Retrieve a single book by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 published_date:
 *                   type: string
 *                   format: date
 *                 author_id:
 *                   type: integer
 *                 author_name:
 *                   type: string
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
bookRoutes.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const book = await db('books')
        .select('books.*', 'authors.name as author_name')
        .leftJoin('authors', 'books.author_id', 'authors.id')
        .where('books.id', Number(id))
        .first();

    if (!book) {
        throw new HttpError('Book not found', 404);
    }

    res.json(book);
}));

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     description: Create a new book with the provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - published_date
 *               - author_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               published_date:
 *                 type: string
 *                 format: date
 *               author_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Book created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 published_date:
 *                   type: string
 *                   format: date
 *                 author_id:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Author not found
 *       500:
 *         description: Internal server error
 */
bookRoutes.post('/', validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('published_date').isISO8601().toDate().withMessage('Published date must be valid'),
    body('author_id').isInt().withMessage('Author ID must be an integer'),
]), asyncHandler(async (req: Request, res: Response) => {
    const { title, description, published_date, author_id } = req.body;

    const author = await db('authors').where({ id: author_id }).first();
    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    const [book] = await db('books')
        .insert({ title, description, published_date, author_id })
        .returning('*');

    res.status(201).json(book);
}));

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Update a book
 *     description: Update an existing book's details
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - published_date
 *               - author_id
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               published_date:
 *                 type: string
 *                 format: date
 *               author_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Book updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 published_date:
 *                   type: string
 *                   format: date
 *                 author_id:
 *                   type: integer
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Book or author not found
 *       500:
 *         description: Internal server error
 */
bookRoutes.put('/:id', validate([
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('published_date').isISO8601().toDate().withMessage('Published date must be valid'),
    body('author_id').isInt().withMessage('Author ID must be an integer'),
]), asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, published_date, author_id } = req.body;

    const author = await db('authors').where({ id: author_id }).first();
    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    const [book] = await db('books')
        .where({ id: Number(id) })
        .update({ title, description, published_date, author_id })
        .returning('*');

    if (!book) {
        throw new HttpError('Book not found', 404);
    }

    res.json(book);
}));

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Delete a book
 *     description: Delete a book by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       204:
 *         description: Book deleted successfully
 *       404:
 *         description: Book not found
 *       500:
 *         description: Internal server error
 */
bookRoutes.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await db('books').where({ id: Number(id) }).del();

    if (!deleted) {
        throw new HttpError('Book not found', 404);
    }

    res.status(204).send();
}));

// Register routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});

// Add proper error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;