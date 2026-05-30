// c:\Users\emili\OneDrive\Desktop\COSITAS\backend\src\controllers\productoController.test.js
import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { validarPrecio, validarContenidoApropiado, crearProducto } from './productoController';
import pool from '../config/database'; // Usamos la base de datos REAL

// Setup a minimal Express app to test the controller
const app = express();
app.use(express.json());
// Mock authMiddleware for testing purposes
app.use((req, res, next) => {
    req.user = { id_usuario: 1, tipo_usuario: 'artesano' }; // Mock authenticated user
    next();
});
app.post('/productos', crearProducto);

describe('validarPrecio (Unit Test)', () => {
    it('should return true for a valid positive price without dollar symbols', () => {
        const result = validarPrecio(100);
        expect(result.valido).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it('should return false and an error for a price with "$" symbol', () => {
        const result = validarPrecio(100, '$100');
        expect(result.valido).toBe(false);
        expect(result.error).toBe('El precio debe estar en pesos COP, no en dólares');
    });

    it('should return false and an error for a price with "USD" keyword', () => {
        const result = validarPrecio(200, '200 USD');
        expect(result.valido).toBe(false);
        expect(result.error).toBe('El precio debe estar en pesos COP, no en dólares');
    });

    it('should return false and an error for a price with "DOLAR" keyword', () => {
        const result = validarPrecio(50, '50 DOLAR');
        expect(result.valido).toBe(false);
        expect(result.error).toBe('El precio debe estar en pesos COP, no en dólares');
    });

    it('should return false and an error for a price of 0', () => {
        const result = validarPrecio(0);
        expect(result.valido).toBe(false);
        expect(result.error).toBe('El precio debe ser mayor a 0');
    });

    it('should return false and an error for a negative price', () => {
        const result = validarPrecio(-10);
        expect(result.valido).toBe(false);
        expect(result.error).toBe('El precio debe ser mayor a 0');
    });
});

describe('validarContenidoApropiado (Unit Test)', () => {
    const palabrasProhibidas = [
        'fraude', 'estafa', 'engaño', 'robo', 'droga', 'arma', 'ilegal',
        'violencia', 'odio', 'discriminación', 'racismo', 'porno', 'obsceno'
    ];

    it('should return true for appropriate content', () => {
        const result = validarContenidoApropiado('Este es un producto de artesanía');
        expect(result.valido).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it.each(palabrasProhibidas)('should return false and an error for content containing "%s"', (palabra) => {
        const result = validarContenidoApropiado(`Este producto contiene ${palabra} oculto`);
        expect(result.valido).toBe(false);
        expect(result.error).toBe(`Contenido no permitido detectado: "${palabra}". Por favor revisa el contenido del producto`);
    });

    it('should be case-insensitive', () => {
        const result = validarContenidoApropiado('VENDO DROGA');
        expect(result.valido).toBe(false);
        expect(result.error).toBe('Contenido no permitido detectado: "droga". Por favor revisa el contenido del producto');
    });

    it('should trim whitespace', () => {
        const result = validarContenidoApropiado('   estafa   ');
        expect(result.valido).toBe(false);
        expect(result.error).toBe('Contenido no permitido detectado: "estafa". Por favor revisa el contenido del producto');
    });
});

describe('crearProducto (Real DB Integration)', () => {
    
    // Limpiamos el producto de la base de datos real después de insertarlo
    afterEach(async () => {
        try {
            const conn = await pool.getConnection();
            await conn.query('DELETE FROM productos WHERE titulo = ?', ['Producto de prueba']);
            conn.release();
        } catch (error) {
            console.log("Error al limpiar BD:", error);
        }
    });

    it('should return 400 if Joi validation fails (e.g., missing titulo)', async () => {
        const res = await request(app)
            .post('/productos')
            .send({
                precio: 100,
                cantidad_disponible: 10,
                id_categoria: 1,
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain('"titulo" is required');
    });

    it('should return 400 if precio validation fails (e.g., price is 0)', async () => {
        const resInvalidPrice = await request(app)
            .post('/productos')
            .send({
                titulo: 'Producto Test',
                precio: 0, // This will trigger the `precio <= 0` error
                cantidad_disponible: 10,
                descripcion: 'Descripción',
                id_categoria: 1,
                fotos: []
            });
        expect(resInvalidPrice.statusCode).toEqual(400);
        expect(resInvalidPrice.body.success).toBe(false);
        // Joi's error message for .positive() when 0 is passed
        expect(resInvalidPrice.body.errors).toContain('"precio" must be a positive number');
    });

    it('should return 400 if titulo contains prohibited content', async () => {
        const res = await request(app)
            .post('/productos')
            .send({
                titulo: 'Producto con droga',
                precio: 100,
                cantidad_disponible: 10,
                descripcion: 'Descripción',
                id_categoria: 1,
                fotos: []
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.success).toBe(false);
        expect(res.body.errors).toContain('Contenido no permitido detectado: "droga". Por favor revisa el contenido del producto');
    });

    it('should create a product successfully in real DB', async () => {
        const res = await request(app)
            .post('/productos')
            .send({
                titulo: 'Producto de prueba',
                precio: 150,
                cantidad_disponible: 5,
                descripcion: 'Una descripción genial',
                id_categoria: 2,
                fotos: ['url1.jpg', 'url2.png']
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Producto creado');
        expect(res.body.id_producto).toBeDefined(); // Como es base real, solo verificamos que exista un ID
    });
});