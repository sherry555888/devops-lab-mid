const express = require('express');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Gmail Credentials
const SENDER_EMAIL = 'msheharyar064@gmail.com';
const APP_PASSWORD = 'bnchiavcdidbxfwp'; // 👈 Yahan Google se generate kia hua 16-character App Password likhein (bina space ke)
const TARGET_EMAIL = 'msheharyar064@gmail.com';  // Jahan email receive karni hai

// Gmail SMTP Transport Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDER_EMAIL,
        pass: APP_PASSWORD
    }
});

app.post('/report', (req, res) => {
    const reportData = req.body;

    // 1. JSON Report Save Karein
    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    console.log("✅ Test report received and saved to test-report.json");

    const status = reportData.summary ? reportData.summary.overallStatus : 'UNKNOWN';
    const isPassed = status === 'PASSED';

    // 2. Dynamic Email Content Prepare Karein
    const mailOptions = {
        from: `"DevOps CI/CD Bot" <${SENDER_EMAIL}>`,
        to: TARGET_EMAIL,
        subject: `[CI/CD Notification] Pipeline Run #${reportData.pipelineRunId || '1'} - Status: ${status}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: ${isPassed ? '#2e7d32' : '#c62828'};">
                    ${isPassed ? '✅ CI/CD Pipeline Passed' : '❌ CI/CD Pipeline Failed'}
                </h2>
                <p><strong>Repository:</strong> ${reportData.repository}</p>
                <p><strong>Branch:</strong> ${reportData.branch}</p>
                <p><strong>Commit SHA:</strong> <code>${reportData.commitSHA}</code></p>
                <p><strong>Timestamp:</strong> ${reportData.timestamp}</p>
                
                <hr style="border: none; border-top: 1px solid #eee;" />
                
                <h3>Execution Summary</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 8px; text-align: left;">Total Tests</th>
                        <th style="padding: 8px; text-align: left;">Passed</th>
                        <th style="padding: 8px; text-align: left;">Failed</th>
                    </tr>
                    <tr>
                        <td style="padding: 8px;">${reportData.summary ? reportData.summary.total : 0}</td>
                        <td style="padding: 8px; color: green;">${reportData.summary ? reportData.summary.passed : 0}</td>
                        <td style="padding: 8px; color: red;">${reportData.summary ? reportData.summary.failed : 0}</td>
                    </tr>
                </table>

                <h3>Individual Test Results</h3>
                <ul>
                    ${(reportData.tests || []).map(t => `
                        <li>
                            <strong>${t.name}</strong>: 
                            <span style="color: ${t.result === 'PASSED' ? 'green' : 'red'};">${t.result}</span>
                            ${t.failureMessage ? `<br/><small style="color: red;">Error: ${t.failureMessage}</small>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `
    };

    // 3. Email Send Execution
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("❌ Email sending failed:", error.message);
        } else {
            console.log("📧 Email sent successfully! Message ID:", info.messageId);
        }
    });

    res.status(200).json({ status: 'Report processed and email dispatched' });
});

app.listen(4000, () => {
    console.log("Local Receiver active on http://localhost:4000");
});