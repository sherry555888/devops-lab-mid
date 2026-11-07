const express = require('express');
const app = express();

app.use(express.json());
app.use(express.static('public'));

let submissions = [];

// Validation Helper Function
function validateSubmission(data) {
    if (!data) {
        return { valid: false, message: 'No payload provided.' };
    }

    const { name, regNo, title, url } = data;

    // Check required fields (Name, Registration Number, Title, URL)
    if (!name || !regNo || !title || !url) {
        return { valid: false, message: 'Missing required fields (Registration Number required).' };
    }

    // Standard URL Validation Pattern
    const urlPattern = new RegExp('^(https?:\\/\\/)?'+ 
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
        '(\\#[-a-z\\d_]*)?$','i');
    
    if (urlPattern.test(url)) {
        return { valid: false, message: 'Invalid submission URL format.' };
    }

    return { valid: true, message: 'Submission is valid.' };
}

// API Routes
app.post('/api/submit', (req, res) => {
    const validation = validateSubmission(req.body);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.message });
    }
    submissions.push(req.body);
    return res.status(200).json({ message: 'Saved successfully', submissions });
});

app.get('/api/submissions', (req, res) => {
    res.status(200).json(submissions);
});

// Server Execution (Only runs when executed directly)
const PORT = 3000;
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = { app, validateSubmission };