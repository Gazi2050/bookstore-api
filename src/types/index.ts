/**
 * Represents a standardized structure for API-related errors.
 * Extends the built-in Error object with an optional HTTP status code.
 *
 * @interface ApiError
 * @extends Error
 */
export interface ApiError extends Error {
    /** Optional HTTP status code associated with the error */
    statusCode?: number;
}
