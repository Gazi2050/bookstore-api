import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import db from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { HttpError } from '../utils/httpError';

const router = express.Router();

/**
 * @route GET /books
 * @desc Retrieve all books, optionally filtered by author ID
 * @access Public
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
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
 * @route GET /books/:id
 * @desc Retrieve a specific book by ID
 * @access Public
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
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
 * @route POST /books
 * @desc Create a new book
 * @access Public
 */
router.post(
    '/',
    validate([
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('published_date').isISO8601().toDate().withMessage('Published date must be valid'),
        body('author_id').isInt().withMessage('Author ID must be an integer'),
    ]),
    asyncHandler(async (req: Request, res: Response) => {
        const { title, description, published_date, author_id } = req.body;

        const author = await db('authors').where({ id: author_id }).first();
        if (!author) {
            throw new HttpError('Author not found', 404);
        }

        const [book] = await db('books')
            .insert({ title, description, published_date, author_id })
            .returning('*');

        res.status(201).json(book);
    })
);

/**
 * @route PUT /books/:id
 * @desc Update an existing book
 * @access Public
 */
router.put(
    '/:id',
    validate([
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('published_date').isISO8601().toDate().withMessage('Published date must be valid'),
        body('author_id').isInt().withMessage('Author ID must be an integer'),
    ]),
    asyncHandler(async (req: Request, res: Response) => {
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
    })
);

/**
 * @route DELETE /books/:id
 * @desc Delete a book by ID
 * @access Public
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const deleted = await db('books').where({ id: Number(id) }).del();

    if (!deleted) {
        throw new HttpError('Book not found', 404);
    }

    res.status(204).send();
}));

export default router;
