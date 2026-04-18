const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/upload - Upload image to Cloudinary
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No image file provided' });

        // Convert buffer to base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'makeustrip/deals'
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Image upload failed' });
    }
});

module.exports = router;
