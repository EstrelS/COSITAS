-- Insertar categorías de prueba
INSERT INTO categorias (nombre_categoria, descripcion, activa) VALUES ('Cerámica', 'Productos de cerámica artesanal', 1);
INSERT INTO categorias (nombre_categoria, descripcion, activa) VALUES ('Textiles', 'Productos textiles tejidos a mano', 1);
INSERT INTO categorias (nombre_categoria, descripcion, activa) VALUES ('Joyería', 'Joyería artesanal', 1);

-- Insertar usuario (artesano)
INSERT INTO usuarios (nombre, apellido_paterno, email, password_hash, tipo_usuario, estado_de_cuenta, verificado) VALUES ('Juan', 'Artesano', 'juan@cositas.com', SHA2('password123', 256), 'artesano', 'activo', 1);

-- Insertar perfil artesano
INSERT INTO perfil_artesano (id_usuario, especialidad, decripcion_taller, verificado_artesano) VALUES ((SELECT id_usuario FROM usuarios WHERE email='juan@cositas.com' LIMIT 1), 'Cerámica', 'Cerámica artesanal de calidad', 1);

-- Insertar productos
INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES 
((SELECT id_usuario FROM usuarios WHERE email='juan@cositas.com' LIMIT 1), 'Tazón Artesanal', 'Hermoso tazón hecho a mano con cerámica de alta calidad', 50.00, 10, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES 
((SELECT id_usuario FROM usuarios WHERE email='juan@cositas.com' LIMIT 1), 'Plato Decorativo', 'Plato con diseños tradicionales y colores vibrantes', 35.00, 8, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES 
((SELECT id_usuario FROM usuarios WHERE email='juan@cositas.com' LIMIT 1), 'Servilletero', 'Servilletero de cerámica pintado a mano', 25.00, 15, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES 
((SELECT id_usuario FROM usuarios WHERE email='juan@cositas.com' LIMIT 1), 'Jarrón Vintage', 'Jarrón decorativo con acabado vintage', 60.00, 5, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES 
((SELECT id_usuario FROM usuarios WHERE email='juan@cositas.com' LIMIT 1), 'Taza de Café', 'Taza personalizada para café o té', 18.00, 20, 'disponible', 1);
