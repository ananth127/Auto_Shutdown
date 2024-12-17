# #!/usr/bin/env bash
# # Install dependencies and ensure PyInstaller is available
# apt-get update && apt-get install -y python3 python3-pip && pip3 install pyinstaller &&  npm install
#!/bin/bash

# Install required Python dependencies
pip3 install -r requirements.txt

# Install Node.js dependencies
npm install

# Build the Python executable with PyInstaller
python3 -m PyInstaller --onefile ./shut.py

pip3 install pyinstaller requests && npm install