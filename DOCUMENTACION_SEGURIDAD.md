# Documentación de Seguridad - Proyecto COSITAS

## 1. Protección de cabeceras
Implementado middleware `helmet` en el servidor principal para prevenir ataques XSS, Clickjacking y otros.

## 2. Hashing de contraseñas
Utilizamos la librería `bcryptjs` con un factor de costo de 10 (`genSalt(10)`) para el cifrado asimétrico de credenciales antes de ser almacenadas en la base de datos MySQL.

## 3. Integridad de dependencias
Se realizó una auditoría de seguridad utilizando `npm audit` para asegurar que las librerías utilizadas estén libres de vulnerabilidades conocidas.