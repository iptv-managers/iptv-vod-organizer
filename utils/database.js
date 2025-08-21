import mysql from "mysql2/promise";

const {
    DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
} = process.env;

export const db = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
});