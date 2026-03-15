#!/bin/bash
set -e

echo "🚀 Building and deploying YOLO Detection WebApp..."

# Build and start containers
docker-compose up --build -d

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📱 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost:5001"
echo ""
echo "📋 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
