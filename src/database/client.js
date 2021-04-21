const knex = require('knex');
module.exports = async () => {
    global.pg = knex({
        client: "pg",
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
    });
}