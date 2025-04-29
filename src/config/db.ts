/**
 * @module db
 * @description
 * Sets up and exports a configured instance of Knex for PostgreSQL.
 * Loads environment variables using dotenv to retrieve the database connection string.
 */

import knex from 'knex';
import dotenv from 'dotenv';

// Load environment variables from a .env file into process.env
dotenv.config();

/**
 * Represents the initialized Knex instance connected to a PostgreSQL database.
 *
 * @type {import('knex').Knex}
 */
const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
});

export default db;
