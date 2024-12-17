const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const app = express();

// Enable CORS for all routes
// app.use(cors({
//   origin: 'https://auto-shutdown-zgsd.vercel.app/',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

app.use(cors()); // Handle preflight requests for all routes


// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.mongodb_url)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if the connection fails
  });


// User Schema with Shutdown State
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  uniqueId: { type: String, required: true, unique: true },
  shutdown: { type: Boolean, default: false }, // Shutdown state
}));

// Register Endpoint
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const uniqueId = uuidv4();

  try {
    const user = new User({ username, password, uniqueId });
    await user.save();
    res.json({ uniqueId });
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).send('Invalid credentials');
    res.json({ uniqueId: user.uniqueId });
  } catch (error) {
    res.status(500).send('Error logging in');
  }
});

// Toggle Shutdown State
app.post('/toggle-shutdown', async (req, res) => {
  const { uniqueId, shutdown } = req.body;

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) return res.status(404).send('User not found.');

    // Update shutdown state
    user.shutdown = shutdown;
    await user.save();
    res.json({ message: 'Shutdown state updated', shutdown });

    console.log(`Shutdown set to ${shutdown} for user ${uniqueId}`);

    // Auto-reset shutdown to false after 1 minute
    if (shutdown) {
      setTimeout(async () => {
        user.shutdown = false;
        await user.save();
        console.log(`FALSEEE false faslse `);
        console.log(`Shutdown reset to false for user ${uniqueId}`);
      }, 11000); // 1 minute = 60000 ms
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error toggling shutdown state.');
  }
});

// Get Shutdown State
app.get('/get-shutdown/:uniqueId', async (req, res) => {
  const { uniqueId } = req.params;
  console.log(`Fetching shutdown state for user ${uniqueId}`);

  try {
    const user = await User.findOne({ uniqueId });
    if (!user) return res.status(404).send('User not found.');

    res.json({ shutdown: user.shutdown });
  } catch (error) {
    res.status(500).send('Error fetching shutdown state.');
  }
});


app.post('/generate', async (req, res) => {
    const { uniqueId } = req.body;
    console.log("Received Unique ID for exe:", uniqueId);




  

    const pythonScriptPath = path.resolve(__dirname, 'shut.py');

    const modifiedScriptPath = path.resolve(__dirname, '/tmp/modified_shutdown_script.py');
    const exeOutputPath = path.resolve(__dirname, '/tmp/dist', 'modified_shutdown_script.exe');

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
        exec(`pyinstaller --onefile "${modifiedScriptPath}"`, async (err, stdout, stderr) => {
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

  

// Start the Server
app.listen(5000, () => {
  console.log('Server running on http://192.168.137.8:5000');
});
