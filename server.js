const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/simulate', (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'No code provided.' });
    }

    const uniqueId = crypto.randomBytes(8).toString('hex');
    const tmpDir = os.tmpdir();
    const verilogFile = path.join(tmpDir, `sim_${uniqueId}.v`);
    const compiledFile = path.join(tmpDir, `sim_${uniqueId}.out`);

    // Write code to file
    fs.writeFile(verilogFile, code, (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to write temporary file.' });
        }

        // Compile
        exec(`iverilog -o "${compiledFile}" "${verilogFile}"`, (compileErr, compileStdout, compileStderr) => {
            if (compileErr) {
                // Return synthesis/compilation errors
                let output = compileStderr || compileStdout || compileErr.message;
                cleanup([verilogFile]);
                return res.json({ success: false, output: `[Compilation Error]\n${output}` });
            }

            // Run Simulation
            exec(`vvp "${compiledFile}"`, (simErr, simStdout, simStderr) => {
                let output = simStdout + (simStderr ? `\n[Warnings/Errors]\n${simStderr}` : '');
                let success = !simErr;
                
                if (simErr && !simStdout) {
                     output = simStderr || simErr.message;
                }

                cleanup([verilogFile, compiledFile]);
                res.json({ success: success, output: output });
            });
        });
    });
});

function cleanup(files) {
    files.forEach(file => {
        fs.unlink(file, (err) => {
            if (err) console.error(`Failed to delete ${file}`);
        });
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
