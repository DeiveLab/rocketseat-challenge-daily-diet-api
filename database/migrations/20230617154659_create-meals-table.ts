import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('meals', table => {
        table.uuid('id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.boolean('is_on_diet').notNullable();
        table.string('session_id').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
}


export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('meals');
}

