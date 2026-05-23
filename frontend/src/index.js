import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initSecurityWarnings } from './utils/securityWarnings';

// Inicializar advertencias de seguridad
initSecurityWarnings();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
