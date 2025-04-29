import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

/**
 * Middleware to validate request bodies using express-validator.
 *
 * @param {Array<ReturnType<typeof body>>} validations - An array of validation chains.
 * @returns {(req: Request, res: Response, next: NextFunction) => Promise<void>} Middleware function to run validations.
 *
 * If validations pass, the request proceeds to the next middleware.
 * If validations fail, a 400 response with error details is returned.
 */
export const validate = (validations: ReturnType<typeof body>[]) => {
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
