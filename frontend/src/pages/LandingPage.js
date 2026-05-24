import { Link } from 'react-router-dom';
import BannerCarousel from '../components/BannerCarousel';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <BannerCarousel />
            <section className="hero">
                <div className="hero-inner">
                    <h1>Descubre Artesanías Únicas</h1>
                    <p>Conectamos artesanos locales con clientes de todo el mundo. Productos handmade de calidad.</p>
                    <div className="mt-8 text-center">
                        <Link to="/productos" className="btn-register" style={{ fontSize: '1.2rem', padding: '15px 30px', display: 'inline-block' }}>
                            Explorar Catálogo
                        </Link>
                    </div>
                </div>
            </section>
            
            <section className="py-16 bg-gray-50 text-center px-4">
                <h2 className="text-3xl font-bold mb-4">¿Por qué elegir COSITAS?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Hecho a Mano</h3>
                        <p className="text-gray-600">Cada producto es único, elaborado con dedicación y técnicas tradicionales.</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Apoyo Local</h3>
                        <p className="text-gray-600">Tu compra ayuda directamente a artesanos y sus comunidades.</p>
                    </div>
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
                        <p className="text-gray-600">Revisamos los más altos estándares para que recibas lo mejor.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;