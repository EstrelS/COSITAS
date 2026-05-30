import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.test.js'], // Patrón para encontrar tus archivos de prueba
    environment: 'node',       // Ejecutar pruebas en entorno Node.js
    testTimeout: 10000,        // Tiempo de espera global para las pruebas (10 segundos)
    // setupFiles: ['./vitest.setup.js'], // Opcional: para configuraciones globales antes de las pruebas
  },
});