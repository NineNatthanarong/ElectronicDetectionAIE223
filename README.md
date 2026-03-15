# YOLO Detection WebApp

Object detection web application with YOLOv8 backend (Python/Flask) and React frontend.

## Quick Deploy (1 Command)

```bash
cd /Users/nine/Documents/Electronic_Parts/yolo-detection-webapp
./deploy.sh
```

Or manually:
```bash
docker-compose up --build -d
```

## Access

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5001

## Development

### Backend Only
```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Backend**: Flask + YOLOv8 + OpenCV (Port 5000/5001)
- **Frontend**: React + Vite + Tailwind (Port 80 via nginx)
- **Proxy**: nginx routes `/api/*` to backend

## Docker Structure

```
yolo-detection-webapp/
├── backend/
│   ├── Dockerfile
│   ├── app.py
│   ├── best.pt
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── ...
└── docker-compose.yml
```

## Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Build and start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
