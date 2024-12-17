FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    python3-pip \
    python3-dev \
    gcc \
    libffi-dev \
    libc-dev \
    curl \
    nodejs \
    npm

# Install PyInstaller and Python dependencies
RUN pip install pyinstaller requests

# Set working directory
WORKDIR /app

# Copy application code
COPY . .

# Install Node.js dependencies
RUN npm install

# Expose port
EXPOSE 10000

# Command to run the Node.js app
CMD ["node", "app.js"]
