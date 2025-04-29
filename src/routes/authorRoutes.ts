import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import db from '../config/db';
import { asyncHandler } from '../utils/asyncHandler';
import { validate } from '../middleware/validate';
import { HttpError } from '../utils/httpError';

const router = express.Router();

router.get('/', asyncHandler(async (req: Request, res: Response) => {
    const authors = await db('authors').select('*');
    res.json(authors);
}));

router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const author = await db('authors').where({ id: Number(id) }).first();

    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    res.json(author);
}));

router.post('/', validate([
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('birthdate').isISO8601().toDate().withMessage('Birthdate must be a valid date'),
]), asyncHandler(async (req: Request, res: Response) => {
    const { name, bio, birthdate } = req.body;
    const [author] = await db('authors')
        .insert({ name, bio, birthdate })
        .returning('*');

    res.status(201).json(author);
}));

router.put('/:id', validate([
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

router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
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

router.get('/:id/books', asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const author = await db('authors').where({ id: Number(id) }).first();
    if (!author) {
        throw new HttpError('Author not found', 404);
    }

    const books = await db('books').where({ author_id: Number(id) });
    res.json({ author, books });
}));

export default router;