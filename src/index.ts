import express from 'express';
import dotenv from 'dotenv';
import authorRoutes from './routes/authorRoutes';
import bookRoutes from './routes/bookRoutes';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());

// Welcome Route
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

// Register routes
app.use('/authors', authorRoutes);
app.use('/books', bookRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;