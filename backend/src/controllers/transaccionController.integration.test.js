// c:\Users\emili\OneDrive\Desktop\COSITAS\backend\src\controllers\transaccionController.integration.test.js
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { crearTransaccion } from './transaccionController';
import pool from '../config/database'; // Real database pool

// Setup a minimal Express app to test the controller
const app = express();
app.use(express.json());
// Mock authMiddleware for testing purposes
app.use((req, res, next) => {
    req.user = { id_usuario: 100, tipo_usuario: 'comprador' }; // Mock authenticated user
    next();
});
app.post('/transacciones', crearTransaccion);

// Global variables for test data
let testCompradorId = 100; // Matches the id_usuario in the mock authMiddleware
let testProductId;
let testSellerId = 200; // Assuming a seller exists
let initialStock = 10;

describe('crearTransaccion (Real DB Integration)', () => {
    let connection;

    beforeEach(async () => {
        // IMPORTANT: In a real scenario, you would use a dedicated TEST DATABASE here
        // to avoid polluting your development database.
        // For this example, we assume `pool` connects to a database where we can freely
        // insert and delete test data.
        connection = await pool.getConnection();

        // Clean up previous test data to ensure test isolation
        await connection.query('DELETE FROM transacciones WHERE id_comprador = ? OR id_vendedor = ?', [testCompradorId, testSellerId]);
        await connection.query('DELETE FROM productos WHERE titulo = ?', ['Producto de Prueba para Transacción']);
        await connection.query('DELETE FROM usuarios WHERE id_usuario = ?', [testCompradorId]);
        await connection.query('DELETE FROM usuarios WHERE id_usuario = ?', [testSellerId]);

        // Insert test user (comprador)
        await connection.query('INSERT INTO usuarios (id_usuario, nombre, email, password_hash, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
            [testCompradorId, 'Test Comprador', 'comprador@test.com', 'hashedpassword', 'comprador']);
        // Insert test user (vendedor)
        await connection.query('INSERT INTO usuarios (id_usuario, nombre, email, password_hash, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
            [testSellerId, 'Test Vendedor', 'vendedor@test.com', 'hashedpassword', 'artesano']);

        // Insert a product for testing
        const [productResult] = await connection.query(
            'INSERT INTO productos (id_vendedor, titulo, precio, cantidad_disponible, decripcion, id_categoria, estado_producto) VALUES (?, ?, ?, ?, ?, ?, "activo")',
            [testSellerId, 'Producto de Prueba para Transacción', 50, initialStock, 'Descripción de prueba', 1, 'activo']
        );
        testProductId = productResult.insertId;
        connection.release();
    });

    afterEach(async () => {
        connection = await pool.getConnection();
        // Clean up after each test
        await connection.query('DELETE FROM transacciones WHERE id_comprador = ? OR id_vendedor = ?', [testCompradorId, testSellerId]);
        await connection.query('DELETE FROM productos WHERE id_producto = ?', [testProductId]);
        await connection.query('DELETE FROM usuarios WHERE id_usuario = ?', [testCompradorId]);
        await connection.query('DELETE FROM usuarios WHERE id_usuario = ?', [testSellerId]);
        connection.release();
    });

    it('should create a transaction and update product stock successfully', async () => {
        const quantityToBuy = 3;
        const res = await request(app)
            .post('/transacciones')
            .send({
                id_producto: testProductId,
                cantidad: quantityToBuy
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Transacción creada');
        expect(res.body.id_transacciones).toBeDefined();

        // Verify product stock in DB
        const conn = await pool.getConnection();
        const [products] = await conn.query('SELECT cantidad_disponible FROM productos WHERE id_producto = ?', [testProductId]);
        conn.release();
        expect(products[0].cantidad_disponible).toEqual(initialStock - quantityToBuy);

        // Verify transaction in DB
        const conn2 = await pool.getConnection();
        const [transactions] = await conn2.query('SELECT * FROM transacciones WHERE id_transacciones = ?', [res.body.id_transacciones]);
        conn2.release();
        expect(transactions.length).toBeGreaterThan(0);
        expect(transactions[0].id_producto).toBe(testProductId);
        expect(transactions[0].id_comprador).toBe(testCompradorId);
        expect(transactions[0].cantidad).toBe(quantityToBuy);
        expect(Number(transactions[0].monto_total)).toBe(50 * quantityToBuy); // Convert to Number for comparison
    });

    it('should return 400 for insufficient stock', async () => {
        const quantityToBuy = initialStock + 1; // More than available
        const res = await request(app)
            .post('/transacciones')
            .send({
                id_producto: testProductId,
                cantidad: quantityToBuy
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Producto no disponible o stock insuficiente');

        // Verify product stock in DB remains unchanged
        const conn = await pool.getConnection();
        const [products] = await conn.query('SELECT cantidad_disponible FROM productos WHERE id_producto = ?', [testProductId]);
        conn.release();
        expect(products[0].cantidad_disponible).toEqual(initialStock);
    });

    it('should return 400 if Joi validation fails (e.g., missing id_producto)', async () => {
        const res = await request(app)
            .post('/transacciones')
            .send({
                cantidad: 1
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain('"id_producto" is required');
    });
});