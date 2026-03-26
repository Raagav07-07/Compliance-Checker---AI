# ChromaDB Setup Guide

## Option 1: Docker Compose (Recommended)

### Prerequisites
- Docker Desktop must be running on your machine
- On Windows/Mac, open Docker Desktop application before running commands

### Steps
```bash
# Start ChromaDB server
docker-compose up -d

# Check if it's running
docker ps | grep chromadb

# View logs
docker-compose logs -f chromadb

# Stop when done
docker-compose down
```

The ChromaDB will be available at `http://localhost:8000`

---

## Option 2: Standalone Python Server (Alternative)

If Docker Desktop isn't running or you prefer direct Python execution:

### Prerequisites
```bash
pip install chromadb
```

### Start ChromaDB Server
```bash
chroma run --path ./chroma-data --port 8000
```

This will:
- Start ChromaDB server on `http://localhost:8000`
- Store data in `./chroma-data` directory (persistent)

---

## Option 3: In-Memory Mode (Development Only)

If you don't want to run a separate server, the app will use in-memory ephemeral mode by default.
**Warning**: Data will be lost when the app restarts.

To use this mode, make sure `CHROMA_SERVER_URL` is NOT set in your `.env` file.

---

## Verify ChromaDB is Running

Test the connection:
```bash
curl http://localhost:8000/api/v1/heartbeat
```

Expected response: `{"status":"ok"}`

---

## Environment Setup

Add to your `.env` file:
```
CHROMA_SERVER_URL="http://localhost:8000"
```

Then start the Next.js app:
```bash
npm run dev
```

---

## Troubleshooting

### "Cannot connect to Docker daemon"
- **Solution**: Start Docker Desktop application

### Port 8000 already in use
- **Solution**: Change the port in docker-compose.yml or kill the process:
  ```bash
  # Windows
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -i :8000
  kill -9 <PID>
  ```

### ChromaDB connection refused
- **Solution**: Make sure `CHROMA_SERVER_URL` is set correctly in `.env`
- Test: `curl http://localhost:8000/api/v1/heartbeat`
