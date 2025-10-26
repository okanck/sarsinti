#!/bin/bash

# MongoDB Atlas Migration Script

echo "========================================="
echo "  🚀 Atlas'a Veri Transferi"
echo "========================================="
echo ""

ATLAS_URI="mongodb+srv://okanck_db_user:wdRktsSPeF7wJtli@cluster0.kirengo.mongodb.net/sarsinti?retryWrites=true&w=majority&appName=Cluster0"

docker-compose exec backend sh -c "ATLAS_URI='$ATLAS_URI' node src/scripts/migrateToAtlas.js"
