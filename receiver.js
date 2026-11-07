const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json());

app.post('/report', (req, res) => {
    const reportData = req.body;
    fs.writeFileSync('test-report.json', JSON.stringify(reportData, null, 2));
    console.log('✅ Test report received and saved to test-report.json');
    res.status(200).send({ message: 'Report saved successfully' });
});

app.listen(4000, () => {
    console.log('Local Receiver active on http://localhost:4000/report');
});