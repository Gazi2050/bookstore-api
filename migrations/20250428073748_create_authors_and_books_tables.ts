import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
    // Create authors table first
    await knex.schema.createTable('authors', (table) => {
        table.increments('id').primary(); // auto-increment primary key
        table.string('name').notNullable();
        table.text('bio');
        table.date('birthdate').notNullable();
    });

    // Create books table second
    await knex.schema.createTable('books', (table) => {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.date('published_date').notNullable();
        table
            .integer('author_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('authors')
            .onDelete('CASCADE'); // if author deleted, delete their books
    });
}

export async function down(knex: Knex): Promise<void> {
    // Drop books first (because it depends on authors)
    await knex.schema.dropTableIfExists('books');
    await knex.schema.dropTableIfExists('authors');
}
