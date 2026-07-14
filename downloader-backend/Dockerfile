FROM python:3.10-slim

# Install ffmpeg for yt-dlp
RUN apt-get update && \
    apt-get install -y ffmpeg nodejs curl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Render sets $PORT dynamically, but standard is usually 10000 or 5000)
ENV PORT=5000
EXPOSE 5000

# Start Gunicorn
CMD gunicorn app:app -b 0.0.0.0:$PORT
