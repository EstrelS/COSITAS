const subirImagenes = async (req, res) => {
    try {
        // Soporta múltiples archivos en req.files o un archivo en req.file
        const files = req.files || (req.file ? [req.file] : []);
        
        // ¡MAGIA DE CLOUDINARY! 🪄
        // Ya no necesitamos armar la URL a mano ni usar 'path'. 
        // Cloudinary nos entrega el link permanente directo en f.path
        const urls = files.map(f => f.path);
        
        res.status(201).json({ success: true, urls });
    } catch (err) {
        console.error("Error al subir imágenes a Cloudinary:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { subirImagenes };