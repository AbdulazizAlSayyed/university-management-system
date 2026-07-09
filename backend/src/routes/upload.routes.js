const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const verifyToken = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// File serving — authenticated via query token (since window.open doesn't send Bearer header)
router.get('/files/:filename', (req, res) => {
  try {
    const decoded = require('jsonwebtoken').verify(req.query.token, process.env.JWT_SECRET || 'ums_secret_key');
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const filePath = path.join(uploadDir, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });
  res.download(filePath);
});

router.use(verifyToken);

router.post('/upload', authorize('professor', 'student'), upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ filename: req.file.filename, originalName: req.file.originalname, url: `/api/files/${req.file.filename}` });
});

module.exports = router;
