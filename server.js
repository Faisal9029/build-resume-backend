const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS
app.use(helmet()); // Add security headers
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueSuffix = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueSuffix);
    },
});
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Only images are allowed'));
        }
        cb(null, true);
    },
});

// In-memory storage for resumes (replace with a database in production)
const resumes = {};

// Routes
// Resume creation
app.post('/create-resume', upload.single('profilePicture'), (req, res) => {
    try {
        const { name, fname, cnic, email, phone, education, experience, skills } = req.body;
        const profilePicture = req.file ? `/uploads/${req.file.filename}` : null;

        if (!name || !email || !phone) {
            return res.status(400).json({ error: 'Name, email, and phone are required' });
        }

        // Create PDF
        const resumeId = uuidv4();
        const doc = new PDFDocument();
        const resumeFileName = `resume_${resumeId}.pdf`;

        doc.pipe(fs.createWriteStream(`resumes/${resumeFileName}`));

        doc.fontSize(20).text(`${name}'s Resume`, { align: 'center' });
        doc.fontSize(12).text(`Father's Name: ${fname}`);
        doc.text(`CNIC: ${cnic}`);
        doc.text(`Email: ${email}`);
        doc.text(`Phone: ${phone}`);
        doc.text(`Education: ${education}`);
        doc.text(`Experience: ${experience}`);
        doc.text(`Skills: ${skills}`);

        if (profilePicture) {
            doc.text(`Profile Picture: ${profilePicture}`);
        }

        doc.end();

        // Store resume data
        resumes[resumeId] = { name, fname, cnic, email, phone, education, experience, skills, profilePicture, resumeFileName };

        res.json({ url: `http://localhost:${PORT}/resume/${resumeId}` });
    } catch (error) {
        console.error('Error handling resume creation:', error);
        res.status(500).json({ error: 'Failed to create resume' });
    }
});

// View a specific resume
app.get('/resume/:id', (req, res) => {
    const resumeId = req.params.id;
    const resume = resumes[resumeId];

    if (resume) {
        res.send(`
            <h2>${resume.name}'s Resume</h2>
            <p><strong>Father's Name:</strong> ${resume.fname}</p>
            <p><strong>CNIC:</strong> ${resume.cnic}</p>
            <p><strong>Email:</strong> ${resume.email}</p>
            <p><strong>Phone:</strong> ${resume.phone}</p>
            <p><strong>Education:</strong> ${resume.education}</p>
            <p><strong>Experience:</strong> ${resume.experience}</p>
            <p><strong>Skills:</strong> ${resume.skills}</p>
            ${resume.profilePicture ? `<img src="${resume.profilePicture}" alt="Profile Picture" width="150" height="150"/>` : ''}
            <p><a href="/resumes/${resume.resumeFileName}" target="_blank">Download PDF</a></p>
        `);
    } else {
        res.status(404).send('Resume not found');
    }
});

// Serve the generated PDF file for download
app.get('/resumes/:fileName', (req, res) => {
    const filePath = path.join(__dirname, 'resumes', req.params.fileName);
    res.sendFile(filePath);
});

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        res.status(400).json({ error: 'File upload error' });
    } else if (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
