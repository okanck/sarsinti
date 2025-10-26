#!/bin/bash

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🌍 Sarsıntı Development Environment  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Docker kontrolü
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker kurulu değil!${NC}"
    echo -e "${YELLOW}Docker kurulumu için: scripts/install-docker.sh${NC}"
    exit 1
fi

# Docker Compose kontrolü
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose kurulu değil!${NC}"
    echo -e "${YELLOW}Docker Compose kurulumu için: scripts/install-docker.sh${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker kontrolleri tamamlandı${NC}"
echo ""

# Servisleri başlat
echo -e "${YELLOW}🚀 Servisler başlatılıyor...${NC}"
docker-compose up -d

# Servislerin hazır olmasını bekle
echo ""
echo -e "${YELLOW}⏳ Servisler hazırlanıyor...${NC}"
sleep 5

# Health check
echo ""
echo -e "${GREEN}🏥 Health Check yapılıyor...${NC}"

# MongoDB check
if docker-compose exec -T mongodb mongosh --quiet -u admin -p sarsinti123 --authenticationDatabase admin --eval "db.adminCommand('ping')" sarsinti &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB hazır${NC}"
else
    echo -e "${RED}❌ MongoDB yanıt vermiyor${NC}"
fi

# Backend API check
sleep 3
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API hazır${NC}"
else
    echo -e "${YELLOW}⏳ Backend API henüz hazır değil (birkaç saniye bekleyin)${NC}"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Development Environment Hazır!    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📡 API:${NC}           http://localhost:3000"
echo -e "${YELLOW}📊 Mongo Express:${NC} http://localhost:8081 (admin/sarsinti123)"
echo -e "${YELLOW}🗄️  MongoDB:${NC}       mongodb://localhost:27017"
echo ""
echo -e "${GREEN}Komutlar:${NC}"
echo -e "  make logs          - Tüm logları izle"
echo -e "  make logs-backend  - Backend loglarını izle"
echo -e "  make etl           - ETL'i manuel çalıştır"
echo -e "  make down          - Servisleri durdur"
echo -e "  make help          - Tüm komutları gör"
echo ""
