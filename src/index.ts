/**
 * Main entry point for the Bookstore API.
 * Sets up routes, middleware, error handling, and starts the Express server.
 */

import express from 'express';
import dotenv from 'dotenv';
import authorRoutes from './routes/authorRoutes';
import bookRoutes from './routes/bookRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

/**
 * @route GET /
 * @desc Welcome endpoint that provides API metadata and available endpoints
 * @access Public
 */
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the Bookstore API',
        version: '1.0.0',
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

// Author-related routes
app.use('/authors', authorRoutes);

// Book-related routes
app.use('/books', bookRoutes);

/**
 * @desc Fallback route for unmatched paths
 * @access Public
 */
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error-handling middleware
app.use(errorHandler);

const port = process.env.PORT || 3000;

/**
 * Start the Express server
 * @param {number|string} port - The port on which the server will listen
 */
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

/**
 * Handle unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
