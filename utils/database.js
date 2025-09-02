import mysql from "mysql2/promise";
import { loadEnv } from "./load-env.js";

let pool;

export async function getDatabase() {
  if (pool) return pool; 

  await loadEnv();
  const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    port: DB_PORT || 3306,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
  });

  return pool;
}