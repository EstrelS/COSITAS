import { Link } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';

const LandingPage = () => {
    return (
        <div className="landing-page">
            {/* 1. SECCIÓN HERO (Carrusel arriba, contenido apilado abajo matching image_8.png structure with original gradient applied) */}
            <section className="w-full">
                {/* El carrusel queda arriba */}
                <div className="w-full overflow-hidden">
                    <BannerCarousel />
                </div>

                {/* Contenido Principal (Título y párrafo) below carousel with background removed to allow gradient below */}
                <div className="w-full flex flex-col items-center text-center py-10 px-4 bg-white border-b border-gray-100">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                        Descubre Artesanías Únicas
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-2xl">
                        Conectamos artesanos locales con clientes de todo el mundo. Productos handmade de calidad.
                    </p>
                </div>

                {/* LA BARRA REPARADA: Transición Rosa Mexicano -> Naranja Sempasuchilt containing search bar and Explora Link */}
                {/* Applying the desired gradient background using tailwind colors that match reference images */}
                <div className="w-full bg-gradient-to-r from-pink-600 to-orange-500 py-12 flex flex-col justify-center items-center text-center px-4 z-10 shadow-inner">
                    
                    {/* Barra de búsqueda funcional logic assumed correct from previous turns */}
                    <div className="flex w-full max-w-lg mb-8 shadow-xl">
                        <input 
                            type="text" 
                            placeholder="Buscar vasijas, textiles, joyería..." 
                            className="w-full px-5 py-3 rounded-l focus:outline-none text-gray-800"
                        />
                        {/* Assumed function maneja submit */}
                        <button className="bg-red-700 text-white px-6 py-3 rounded-r font-bold hover:bg-red-800 transition-colors">
                            Buscar
                        </button>
                    </div>

                    {/* Botón Explorar con tus estilos originales y contraste correcto */}
                    {/* image_8.png shows white button with red text */}
                    <div className="flex items-center justify-center">
                        <Link 
                            to="/productos" 
                            className="btn-register bg-white text-red-600 font-bold py-3 px-8 rounded hover:bg-gray-100 transition-transform transform hover:scale-105 shadow-2xl"
                            style={{ fontSize: '1.2rem', padding: '15px 30px', display: 'inline-block' }}
                        >
                            Explorar Catálogo
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* 2. SECCIÓN DE BENEFICIOS (remains as in previously provided code) */}
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