const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = 'foodify/misc';
    if (file.fieldname === 'logo' || file.fieldname === 'coverImage') {
      folder = 'foodify/partners';
    } else if (file.fieldname === 'images') {
      folder = 'foodify/food';
    }
    return {
      folder,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 1000, quality: 'auto' }],
    };
  },
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };