const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const app = express();


// MongoDB connection setup
mongoose.connect('mongodb://localhost:27017/shutdownApp', { useNewUrlParser: true, useUnifiedTopology: true });
const User = mongoose.model('User', new mongoose.Schema({
  uniqueId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Route to serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle user creation and .exe generation
app.post('/create-user', async (req, res) => {

  const uniqueId = uuidv4(); // Generate a unique ID for the user
  console.log("created User: ",uniqueId);

  try {
    // Create a new user in the MongoDB database
    const newUser = new User({ uniqueId });
    await newUser.save();

    console.log(`Created user with unique ID: ${uniqueId}`);

    // Modify the Python script by inserting the unique user ID
    const pythonScriptPath = path.join(__dirname, 'shutdown_script.py');
    let pythonScriptContent = fs.readFileSync(pythonScriptPath, 'utf8');
    pythonScriptContent = pythonScriptContent.replace('USER_ID_PLACEHOLDER', uniqueId);

    // Save the modified Python script
    const modifiedScriptPath = path.join(__dirname, 'modified_shutdown_script.py');
    fs.writeFileSync(modifiedScriptPath, pythonScriptContent);

    // Use PyInstaller to generate the .exe file
    exec(`pyinstaller --onefile ${modifiedScriptPath}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error: ${stderr}`);
        return res.status(500).send('Error occurred while generating the executable.');
      }

      console.log(stdout);
      console.log('Executable generated.');

      // Send the .exe file to the user
      const exePath = path.join(__dirname, 'dist', 'modified_shutdown_script.exe');
      res.download(exePath, 'shutdown_script.exe', (err) => {
        if (err) {
          console.error(err);
        }
        // Clean up files after download (optional)
        fs.rmSync(modifiedScriptPath);
        fs.rmSync(exePath);
      });
    });
  } catch (error) {
    console.log("error");
    // console.error(error);
    res.status(500).send('Error creating user or generating executable.');
  }
});

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
