import postgres from "postgres";

export const db = postgres({
    host: process.env.DB_HOST || 'locahost',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'plaintext.app',
    username: process.env.DB_USER || 'plaintext.app',
    password: process.env.DB_PASS || 'password'
});