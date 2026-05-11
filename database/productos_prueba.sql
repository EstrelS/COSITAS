-- Limpiar datos de prueba anteriores (opcional)
DELETE FROM productos WHERE id_vendedor = 1;
DELETE FROM perfil_artesano WHERE id_usuario = 1;

-- Insertar perfil artesano para el usuario Juan
INSERT INTO perfil_artesano (id_usuario, especialidad, decripcion_taller, verificado_artesano) VALUES (1, 'Cerámica', 'Cerámica artesanal de calidad', 1);

-- Insertar productos
INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES (1, 'Tazón Artesanal', 'Hermoso tazón hecho a mano con cerámica de alta calidad', 50.00, 10, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES (1, 'Plato Decorativo', 'Plato con diseños tradicionales y colores vibrantes', 35.00, 8, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES (1, 'Servilletero', 'Servilletero de cerámica pintado a mano', 25.00, 15, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES (1, 'Jarrón Vintage', 'Jarrón decorativo con acabado vintage', 60.00, 5, 'disponible', 1);

INSERT INTO productos (id_vendedor, titulo, decripcion, precio, cantidad_disponible, estado_producto, id_categoria) VALUES (1, 'Taza de Café', 'Taza personalizada para café o té', 18.00, 20, 'disponible', 1);
