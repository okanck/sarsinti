# Development Dockerfile
FROM node:18-alpine

# Çalışma dizinini ayarla
WORKDIR /app

# Package dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle
RUN npm install

# Uygulama kodunu kopyala
COPY . .

# Port'u aç
EXPOSE 3000

# Development modunda nodemon ile çalıştır
CMD ["npm", "run", "dev"]
