import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; 

const BannerCarousel = () => {
    return (
        <div className="w-full" style={{ maxHeight: '400px', overflow: 'hidden' }}>
            <Carousel 
                autoPlay 
                infiniteLoop 
                showThumbs={false} 
                showStatus={false}
                interval={3000}
                dynamicHeight={false}
            >
                {/* Contenedores con altura fija de 400px para que no se vea gigante */}
                <div style={{ height: '400px' }}>
                    <img 
                        src="/assets/banner1.webp" 
                        alt="Artesanía 1" 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                    />
                </div>
                <div style={{ height: '400px' }}>
                    <img 
                        src="/assets/banner2.webp" 
                        alt="Artesanía 2" 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                    />
                </div>
                <div style={{ height: '400px' }}>
                    <img 
                        src="/assets/banner3.webp" 
                        alt="Artesanía 3" 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                    />
                </div>
                <div style={{ height: '400px' }}>
                    <img 
                        src="/assets/banner4.webp" 
                        alt="Artesanía 4" 
                        style={{ height: '100%', width: '100%', objectFit: 'cover' }} 
                    />
                </div>
            </Carousel>
        </div>
    );
};

export default BannerCarousel;