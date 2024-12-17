const express = require('express');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');

const app = express();
const port = process.env.PORT || 10000;

app.use(express.json()); // to parse JSON bodies

app.post('/generate', async (req, res) => {
    const { uniqueId } = req.body;
    console.log("Received Unique ID for exe:", uniqueId);

    const pythonScriptPath = path.resolve(__dirname, 'shut.py');
    const modifiedScriptPath = path.join(os.tmpdir(), 'modified_shutdown_script.py');
    const exeOutputPath = path.join(os.tmpdir(), 'dist', 'modified_shutdown_script.exe');

    try {
        // Verify base Python script exists
        if (!fs.existsSync(pythonScriptPath)) {
            console.error("Base Python script file not found:", pythonScriptPath);
            return res.status(500).send('Base Python script file not found.');
        }

        // Read and modify the Python script
        let scriptContent = fs.readFileSync(pythonScriptPath, 'utf8');
        scriptContent = scriptContent.replace('USER_ID_PLACEHOLDER', uniqueId);

        // Write the modified script
        fs.writeFileSync(modifiedScriptPath, scriptContent);

        // Ensure the modified script was successfully created
        if (!fs.existsSync(modifiedScriptPath)) {
            console.error("Failed to create modified script file.");
            return res.status(500).send('Failed to create modified script file.');
        }

        // Run PyInstaller to generate the executable
        exec(`pyinstaller --onefile "${modifiedScriptPath}" --log-level=DEBUG`, async (err, stdout, stderr) => {
            if (err) {
                console.error("PyInstaller error:", stderr);
                return res.status(500).send(`Error generating executable: ${stderr}`);
            }

            console.log("PyInstaller output:", stdout);

            // Verify the executable file exists
            if (!fs.existsSync(exeOutputPath)) {
                console.error("Executable file not found after PyInstaller process.");
                return res.status(500).send('Executable file not found.');
            }

            // Send the executable file to the client
            res.download(exeOutputPath, 'shutdown_script.exe', (err) => {
                if (err) {
                    console.error("Error sending .exe file:", err);
                    return;
                }

                // Clean up: Remove temporary files after successful download
                console.log("Download completed successfully. Cleaning up files...");
                try {
                    fs.unlinkSync(modifiedScriptPath);
                    fs.unlinkSync(exeOutputPath);
                } catch (cleanupError) {
                    console.error("Error during cleanup:", cleanupError);
                }
            });
        });
    } catch (error) {
        console.error("Error in /generate endpoint:", error);
        res.status(500).send('Error generating executable');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
