import { ErrorRequestHandler } from 'express';
import { ApiError } from '../types';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
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