/**
 * Represents an HTTP error with a status code.
 * Useful for consistent error handling across routes and middleware.
 *
 * @extends Error
 */
export class HttpError extends Error {
    /** HTTP status code associated with the error */
    statusCode: number;

    /**
     * Creates a new HttpError instance.
     *
     * @param {string} message - Error message describing what went wrong.
     * @param {number} statusCode - HTTP status code to associate with the error.
     */
    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
