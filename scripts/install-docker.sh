#!/bin/bash

# Docker ve Docker Compose kurulum scripti (Ubuntu/Debian)
# Kullanım: sudo bash scripts/install-docker.sh

# Renkler
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Docker & Docker Compose Kurulumu    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Root kontrolü
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Bu script'i root olarak çalıştırmalısınız!${NC}"
    echo -e "${YELLOW}Kullanım: sudo bash scripts/install-docker.sh${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Sistem güncelleniyor...${NC}"
apt-get update -qq

echo -e "${YELLOW}📦 Gerekli paketler yükleniyor...${NC}"
apt-get install -y -qq \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Docker GPG key ekle
echo -e "${YELLOW}🔑 Docker GPG key ekleniyor...${NC}"
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Docker repository ekle
echo -e "${YELLOW}📝 Docker repository ekleniyor...${NC}"
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Repoları güncelle
apt-get update -qq

# Docker'ı yükle
echo -e "${YELLOW}🐳 Docker yükleniyor...${NC}"
apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker servisini başlat
echo -e "${YELLOW}🚀 Docker servisi başlatılıyor...${NC}"
systemctl start docker
systemctl enable docker

# Mevcut kullanıcıyı docker grubuna ekle
CURRENT_USER=${SUDO_USER:-$USER}
echo -e "${YELLOW}👤 Kullanıcı ($CURRENT_USER) docker grubuna ekleniyor...${NC}"
usermod -aG docker $CURRENT_USER

# Docker Compose'u yükle (standalone)
echo -e "${YELLOW}🐳 Docker Compose yükleniyor...${NC}"
DOCKER_COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Kurulum kontrolü
echo ""
echo -e "${GREEN}🏥 Kurulum kontrol ediliyor...${NC}"
docker --version
docker-compose --version

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Kurulum Tamamlandı!               ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  ÖNEMLİ:${NC} Terminal'i kapatıp yeniden açın veya şu komutu çalıştırın:"
echo -e "${YELLOW}    newgrp docker${NC}"
echo ""
echo -e "${GREEN}Test etmek için:${NC}"
echo -e "    docker run hello-world"
echo ""
