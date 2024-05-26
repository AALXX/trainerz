import mysql from 'mysql2';
import config from './config';
import logging from './logging';
import express from 'express';

const params = {
    multipleStatements: true,
    user: config.mysql.user,
    password: config.mysql.password,
    host: config.mysql.host,
    database: config.mysql.database,
};

interface CustomRequest extends express.Request {
    pool?: mysql.Pool;
}

const createPool = () => {
    const pool = mysql.createPool({
        connectionLimit: 10, // Adjust the connection limit as needed
        multipleStatements: true,
        waitForConnections: true,
        user: config.mysql.user,
        password: config.mysql.password,
        host: config.mysql.host,
        database: config.mysql.database,
    });

    // Optional: Handle connection errors
    pool.on('error', (err) => {
        console.error('MySQL Pool Error:', err.message);
    });

    return pool;
};
const query = async (connection: any, queryString: string, values?: any[]): Promise<any> => {
    const NAMESPACE = 'MYSQL_QUERY_FUNC';
    try {
        const dbresult = await connection.query(queryString, values);
        const result = JSON.parse(JSON.stringify(dbresult));
        connection.release();
        return result[0];
    } catch (error: any) {
        logging.error(NAMESPACE, error.message);
    }
};

/**
 * connects to an sql server
 * @return {Promise<mysql.Connection>}
 */
const connect = async (pool: mysql.Pool) => {
    try {
        // Get a connection from the pool
        return await pool.promise().getConnection();
    } catch (error) {
        return null;
    }
};

/**
 * connects to an sql server
 * @return {Promise<mysql.Connection>}
 */
const oldConnect = async () =>
    new Promise<mysql.Connection>((resolve, reject) => {
        const connection = mysql.createConnection(params);
        connection.connect((error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(connection);
        });
    });

/**
 * query an sql string
 * @param {mysql.Connection} connection
 * @param {string} query
 * @returns
 */
const oldQuery = async (connection: mysql.Connection, query: string) =>
    new Promise((resolve, reject) => {
        connection.query(query, connection, (err, result) => {
            if (err) {
                reject(err);
            }
            resolve(result);
        });
    });

export { oldConnect, oldQuery, query, createPool, connect, CustomRequest };
