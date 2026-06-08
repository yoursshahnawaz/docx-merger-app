require('dotenv').config();
const express = require('express');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const DocxMerger = require('docx-merger');
const path = require('path');

const app = express();

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '5')  * 1024 * 1024;
const MAX_FILES     = parseInt(process.env.MAX_FILES || '3');

const mergeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT || '30'),
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again in an hour.' }
});

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
    fileFilter: (_req, file, cb) => {
        const isDocx =
            file.originalname.toLowerCase().endsWith('.docx') ||
            file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        isDocx ? cb(null, true) : cb(new Error('Only .docx files are allowed.'));
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/merge', mergeLimiter, upload.array('files'), (req, res) => {
    if (!req.files || req.files.length < 2) {
        return res.status(400).json({ error: 'Please upload at least 2 .docx files.' });
    }

    const files = req.files.map(f => f.buffer.toString('binary'));

    try {
        const docx = new DocxMerger({}, files);
        docx.save('nodebuffer', (data) => {
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', 'attachment; filename="merged.docx"');
            res.send(Buffer.isBuffer(data) ? data : Buffer.from(data));
        });
    } catch (err) {
        res.status(500).json({ error: 'Merge failed: ' + err.message });
    }
});

// Multer error handler
app.use((err, _req, res, _next) => {
    if (err.code === 'LIMIT_FILE_SIZE')  return res.status(400).json({ error: `File too large. Max ${process.env.MAX_FILE_SIZE_MB || 10} MB per file.` });
    if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ error: `Too many files. Max ${MAX_FILES} files at once.` });
    res.status(400).json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`DOCX Merger running at http://localhost:${PORT}`));
