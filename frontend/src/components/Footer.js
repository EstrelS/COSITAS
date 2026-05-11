
import { FaEnvelope, FaFacebook, FaInstagram, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-grid">
          <div>
            <h2>COSITAS</h2>
            <p>Plataforma de artesanías handmade conectando talento local con el mundo.</p>
          </div>

          <div>
            <h3>Navegación</h3>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/">Productos</Link></li>
              <li><Link to="/">Categorías</Link></li>
              <li><Link to="/">Artesanos</Link></li>
            </ul>
          </div>

          <div>
            <h3>Legal</h3>
            <ul>
              <li><a href="#/">Términos de Servicio</a></li>
              <li><a href="#/">Política de Privacidad</a></li>
              <li><a href="#/">Devoluciones</a></li>
              <li><a href="#/">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3>Contacto</h3>
            <ul>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#d1d5db' }}>
                <FaPhone size={14} />
                <span>+1 (234) 567-8900</span>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#d1d5db' }}>
                <FaEnvelope size={14} />
                <a href="mailto:contacto@cositas.com" style={{ color: '#d1d5db', textDecoration: 'none' }}>contacto@cositas.com</a>
              </li>
              <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: '#d1d5db' }}>
                <FaMapMarkerAlt size={14} style={{ marginTop: '0.125rem' }} />
                <span>Calle Principal 123<br/>Ciudad, País</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-divider">
          <div className="footer-bottom">
            <div className="social-links">
              <a href="/" title="Instagram">
                <FaInstagram />
              </a>
              <a href="/" title="Facebook">
                <FaFacebook />
              </a>
              <a href="mailto:contacto@cositas.com" title="Email">
                <FaEnvelope />
              </a>
            </div>
            <div className="copyright">
              © {new Date().getFullYear()} COSITAS. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
