import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an asynchronous route handler and forwards any errors to the next middleware.
 *
 * @param {Function} fn - The asynchronous Express route handler function.
 * @returns {Function} A new function that wraps the original and handles rejected promises.
 *
 * @example
 * router.get('/endpoint', asyncHandler(async (req, res) => {
 *   const data = await someAsyncOperation();
 *   res.json(data);
 * }));
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
