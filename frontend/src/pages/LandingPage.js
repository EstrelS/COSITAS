import { Link } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* 1. SECCIÓN HERO (Carrusel como fondo, texto y buscador flotando encima) */}
            <section className="relative w-full h-[600px] md:h-[700px] overflow-hidden">
                
                {/* Carrusel de fondo - Ocupa todo el alto y ancho de la sección */}
                <div className="absolute inset-0 w-full h-full z-0">
                    <BannerCarousel />
                </div>

                {/* Capa de oscurecimiento (Overlay) para que el texto resalte siempre */}
                <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>

                {/* Contenido Principal (Título, Buscador, Párrafo y Botón flotando en el centro) */}
                <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-20">
                    
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-lg">
                        Descubre Artesanías Únicas
                    </h1>
                    
                    <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl drop-shadow-md">
                        Conectamos artesanos locales con clientes de todo el mundo. Productos handmade de calidad.
                    </p>

                    {/* Barra de búsqueda */}
                    <div className="flex w-full max-w-2xl mb-8 shadow-2xl">
                        <input 
                            type="text" 
                            placeholder="Buscar vasijas, textiles, joyería..." 
                            className="w-full px-6 py-4 rounded-l-lg focus:outline-none text-gray-800 text-lg"
                        />
                        <button className="bg-red-600 text-white px-8 py-4 rounded-r-lg font-bold text-lg hover:bg-red-700 transition-colors">
                            Buscar
                        </button>
                    </div>

                    {/* Botón Explorar */}
                    <Link 
                        to="/productos" 
                        className="bg-white text-red-600 font-bold py-4 px-10 rounded-lg hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-2xl mt-4"
                        style={{ fontSize: '1.2rem' }}
                    >
                        Explorar Catálogo
                    </Link>

                </div>
            </section>
            
            {/* 2. SECCIÓN DE BENEFICIOS (Intacta) */}
            <section className="py-20 bg-gray-50 text-center px-4">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">¿Por qué elegir COSITAS?</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Tarjeta 1 */}
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
                        <div className="text-4xl mb-4">🖐️</div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Hecho a Mano</h3>
                        <p className="text-gray-600 leading-relaxed">Cada producto es único, elaborado con dedicación y técnicas tradicionales.</p>
                    </div>
                    
                    {/* Tarjeta 2 */}
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
                        <div className="text-4xl mb-4">🌱</div>
                        <h3 className="text-xl font-semibold mb-3 text-gray-800">Apoyo Local</h3>
                        <p className="text-gray-600 leading-relaxed">Tu compra ayuda directamente a artesanos y sus comunidades.</p>
                    </div>
                    
                    {/* Tarjeta 3 */}
                    <div className="p-8 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 relative">
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