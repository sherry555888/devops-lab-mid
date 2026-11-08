const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

let submissions = [];

// Dynamic & Strict Validation Helper Function
function validateSubmission(data) {
    if (!data) {
        return { valid: false, message: 'No payload provided.' };
    }

    let { name, regNo, title, url } = data;

    // 1. Missing Field Checks
    if (!name || name.trim() === '') {
        return { valid: false, message: 'Missing required field: Name is required.' };
    }
    if (!regNo || regNo.trim() === '') {
        return { valid: false, message: 'Missing required field: Registration Number is required.' };
    }
    if (!title || title.trim() === '') {
        return { valid: false, message: 'Missing required field: Assignment Title is required.' };
    }
    if (!url || url.trim() === '') {
        return { valid: false, message: 'Missing required field: Submission URL is required.' };
    }

    regNo = regNo.trim();
    url = url.trim();

    // 2. Strict Registration Number Format Check (e.g., SP23-BCS-064, FA20-BCS-001)
    const regNoPattern = /^[A-Z]{2}\d{2}-[A-Z]{3}-\d{3}$/i;
    if (!regNoPattern.test(regNo)) {
        return { valid: false, message: 'Invalid Registration Number format. Expected format: SP23-BCS-064' };
    }

    // Auto-prefix http:// if missing protocol
    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    // 3. Native URL Parsing Validation
    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
            return { valid: false, message: 'Invalid submission URL format.' };
        }
    } catch (err) {
        return { valid: false, message: 'Invalid submission URL format.' };
    }

    return { valid: true, message: 'Submission is valid.', formattedUrl: url, formattedRegNo: regNo.toUpperCase() };
}

// API Routes
app.post('/api/submit', (req, res) => {
    const validation = validateSubmission(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
    }

    const newSubmission = {
        name: req.body.name.trim(),
        regNo: validation.formattedRegNo,
        title: req.body.title.trim(),
        url: validation.formattedUrl
    };

    submissions.push(newSubmission);
    return res.status(200).json({ message: 'Saved successfully', submissions });
});

app.get('/api/submissions', (req, res) => {
    res.status(200).json(submissions);
});

// Server Execution
const PORT = 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app, validateSubmission };