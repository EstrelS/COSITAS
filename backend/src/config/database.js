const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

console.log('DB_NAME:', process.env.DB_NAME);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Prueba de conexión
pool.getConnection().then(conn => {
    console.log('Conexión a MySQL exitosa');
    conn.release();
    }).catch(err => {
        console.error('Error de conexión a MySQL COMPLETO:', err);
        process.exit(1);
    });

module.exports = pool;
