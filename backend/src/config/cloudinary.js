const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require('dotenv').config();

// Configuramos Cloudinary con tus llaves del .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Le decimos a Multer que guarde las cosas en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cositas_app', // Así se llamará la carpeta dentro de tu Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'], // Formatos permitidos
  },
});

const upload = multer({ storage: storage });

module.exports = { cloudinary, upload };