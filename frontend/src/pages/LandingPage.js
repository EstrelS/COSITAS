import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';

const LandingPage = () => {
    // 1. Estado para guardar el texto de búsqueda
    const [busqueda, setBusqueda] = useState('');
    // 2. Hook para redireccionar a otra página
    const navigate = useNavigate();

    // 3. Función que se ejecuta al presionar "Buscar" o dar Enter
    const manejarBusqueda = (e) => {
        e.preventDefault(); // Evita que la página se recargue
        if (busqueda.trim() !== '') {
            // Redirige a /productos y le pasa el texto en la URL (ej: /productos?busqueda=vasija)
            navigate(`/productos?busqueda=${encodeURIComponent(busqueda.trim())}`);
        }
    };

    return (
        <div className="landing-page">
            {/* SECCIÓN HERO (Carrusel + Texto + Buscador) */}
            <section className="relative w-full h-[70vh] min-h-[500px]">
                {/* El carrusel queda al fondo */}
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <BannerCarousel />
                </div>

                {/* Capa oscura y contenido central */}
                <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center px-4 z-10">
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                        Descubre Artesanías Únicas
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl drop-shadow-md">
                        Conectamos artesanos locales con clientes de todo el mundo. Productos handmade de calidad.
                    </p>

                    {/* Formulario de búsqueda funcional */}
                    <form onSubmit={manejarBusqueda} className="flex w-full max-w-lg mb-8 shadow-lg">
                        <input 
                            type="text" 
                            placeholder="Buscar vasijas, textiles, joyería..." 
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full px-5 py-3 rounded-l focus:outline-none text-gray-800"
                        />
                        <button 
                            type="submit" 
                            className="bg-red-600 text-white px-6 py-3 rounded-r font-bold hover:bg-red-700 transition-colors"
                        >
                            Buscar
                        </button>
                    </form>

                    {/* Botón Explorar con tus estilos originales */}
                    <Link 
                        to="/productos" 
                        className="btn-register bg-white text-red-600 shadow-xl hover:bg-gray-100" 
                        style={{ fontSize: '1.2rem', padding: '15px 30px', display: 'inline-block', fontWeight: 'bold' }}
                    >
                        Explorar Catálogo
                    </Link>
                </div>
            </section>
            
            {/* SECCIÓN DE BENEFICIOS (Con Emojis y Sombras) */}
            <section className="py-20 bg-gray-50 text-center px-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">¿Por qué elegir COSITAS?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Tarjeta 1 */}
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="text-4xl mb-4">🖐️</div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Hecho a Mano</h3>
                        <p className="text-gray-600 leading-relaxed">Cada producto es único, elaborado con dedicación y técnicas tradicionales.</p>
                    </div>
                    
                    {/* Tarjeta 2 */}
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="text-4xl mb-4">🌱</div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Apoyo Local</h3>
                        <p className="text-gray-600 leading-relaxed">Tu compra ayuda directamente a artesanos y sus comunidades.</p>
                    </div>
                    
                    {/* Tarjeta 3 */}
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                        <div className="text-4xl mb-4">⭐</div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Calidad Garantizada</h3>
                        <p className="text-gray-600 leading-relaxed">Revisamos los más altos estándares para que recibas lo mejor.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;