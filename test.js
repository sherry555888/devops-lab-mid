const { validateSubmission } = require('./server');
const axios = require('axios');

let results = [];
let passed = 0;
let failed = 0;

function runTest(name, fn) {
    try {
        fn();
        results.push({ name, result: 'PASSED', failureMessage: null });
        passed++;
    } catch (err) {
        results.push({ name, result: 'FAILED', failureMessage: err.message });
        failed++;
    }
}

// Test Case 1: Complete details and valid URL
runTest('Complete details and valid submission URL', () => {
    const res = validateSubmission({ name: 'Ali', regNo: 'FA20-BCS-001', title: 'Lab 1', url: 'https://github.com/repo' });
    if (!res.valid) throw new Error('Expected submission to be valid');
});

// Test Case 2: Missing registration number
runTest('Missing registration number', () => {
    const res = validateSubmission({ name: 'Ali', regNo: '', title: 'Lab 1', url: 'https://github.com/repo' });
    if (res.valid) throw new Error('Expected submission to be rejected due to missing registration number');
});

// Test Case 3: Invalid submission URL
runTest('Invalid submission URL', () => {
    const res = validateSubmission({ name: 'Ali', regNo: 'FA20-BCS-001', title: 'Lab 1', url: 'invalid-url-string' });
    if (res.valid) throw new Error('Expected submission to be rejected due to invalid URL');
});

// Summary Build
const report = {
    repository: process.env.GITHUB_REPOSITORY || 'Local Repo',
    branch: process.env.GITHUB_REF_NAME || 'main',
    commitSHA: process.env.GITHUB_SHA || 'Local Commit',
    pipelineRunId: process.env.GITHUB_RUN_ID || '1',
    timestamp: new Date().toISOString(),
    tests: results,
    summary: { total: results.length, passed, failed, overallStatus: failed === 0 ? 'PASSED' : 'FAILED' }
};

// Report Post to Receiver
axios.post('http://localhost:4000/report', report)
    .then(() => {
        console.log("Report payload sent to localhost receiver successfully.");
        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    })
    .catch(err => {
        console.error("Failed to send report to localhost receiver:", err.message);
        if (failed > 0) {
            process.exit(1);
        } else {
            process.exit(0);
        }
    });