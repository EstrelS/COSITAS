const path = require('path');

const subirImagenes = async (req, res) => {
    try {
        // soporta múltiples archivos en req.files o un archivo en req.file
        const files = req.files || (req.file ? [req.file] : []);
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const urls = files.map(f => {
        // si UPLOAD_DIR es relativo, servidor ya expone /uploads
        return `${baseUrl}/uploads/${path.basename(f.path)}`;
        });
        res.status(201).json({ success: true, urls });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { subirImagenes };
