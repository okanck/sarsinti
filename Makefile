.PHONY: help up down restart logs logs-backend logs-mongodb shell-backend shell-mongodb etl etl-schedule status clean

# Renkli output için
GREEN  := \033[0;32m
YELLOW := \033[0;33m
RED    := \033[0;31m
NC     := \033[0m # No Color

help: ## Yardım menüsünü göster
	@echo "$(GREEN)Sarsıntı - Docker Komutları$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "\nKullanım:\n  make $(YELLOW)<target>$(NC)\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(GREEN)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Docker Yönetimi

up: ## Tüm servisleri başlat
	@echo "$(GREEN)🚀 Servisler başlatılıyor...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✅ Servisler başlatıldı!$(NC)"
	@echo ""
	@echo "$(YELLOW)📡 API:$(NC)           http://localhost:3000"
	@echo "$(YELLOW)📊 Mongo Express:$(NC) http://localhost:8081 (admin/sarsinti123)"
	@echo "$(YELLOW)🗄️  MongoDB:$(NC)       mongodb://localhost:27017"

down: ## Tüm servisleri durdur
	@echo "$(YELLOW)🛑 Servisler durduruluyor...$(NC)"
	docker-compose down
	@echo "$(GREEN)✅ Servisler durduruldu!$(NC)"

restart: ## Tüm servisleri yeniden başlat
	@echo "$(YELLOW)🔄 Servisler yeniden başlatılıyor...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✅ Servisler yeniden başlatıldı!$(NC)"

build: ## Image'ları yeniden build et
	@echo "$(YELLOW)🔨 Image'lar build ediliyor...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✅ Build tamamlandı!$(NC)"

##@ Loglar

logs: ## Tüm servislerin loglarını göster
	docker-compose logs -f

logs-backend: ## Backend loglarını göster
	docker-compose logs -f backend

logs-mongodb: ## MongoDB loglarını göster
	docker-compose logs -f mongodb

##@ Shell Erişimi

shell-backend: ## Backend container'ına shell ile gir
	docker-compose exec backend sh

shell-mongodb: ## MongoDB shell'e bağlan
	docker-compose exec mongodb mongosh -u admin -p sarsinti123 --authenticationDatabase admin sarsinti

##@ ETL İşlemleri

etl: ## ETL'i manuel çalıştır
	@echo "$(GREEN)🌍 ETL başlatılıyor...$(NC)"
	docker-compose exec backend npm run etl

etl-schedule: ## ETL scheduler'ı başlat (ayrı terminal'de çalıştır)
	@echo "$(GREEN)⏰ ETL Scheduler başlatılıyor...$(NC)"
	docker-compose exec backend npm run etl:schedule

##@ Durum ve Temizlik

status: ## Servislerin durumunu göster
	@echo "$(GREEN)📊 Servis Durumu:$(NC)"
	@docker-compose ps

stats: ## Container kaynak kullanımını göster
	docker stats sarsinti-backend sarsinti-mongodb

clean: ## Volume'ları SİL (DİKKAT: Tüm veri silinir!)
	@echo "$(RED)⚠️  DİKKAT: Tüm MongoDB verisi silinecek!$(NC)"
	@read -p "Devam etmek istiyor musunuz? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		echo "$(GREEN)✅ Volume'lar silindi!$(NC)"; \
	else \
		echo "$(YELLOW)İptal edildi.$(NC)"; \
	fi

prune: ## Kullanılmayan Docker resource'larını temizle
	@echo "$(YELLOW)🧹 Docker temizleniyor...$(NC)"
	docker system prune -f
	@echo "$(GREEN)✅ Temizlik tamamlandı!$(NC)"

##@ Test ve Debug

test-api: ## API health check
	@echo "$(GREEN)🏥 API Health Check:$(NC)"
	@curl -s http://localhost:3000/health | jq . || echo "$(RED)API yanıt vermiyor veya jq kurulu değil$(NC)"

test-mongodb: ## MongoDB bağlantı testi
	@echo "$(GREEN)🗄️  MongoDB Bağlantı Testi:$(NC)"
	@docker-compose exec mongodb mongosh --quiet -u admin -p sarsinti123 --authenticationDatabase admin --eval "db.adminCommand('ping')" sarsinti

backup: ## MongoDB backup al
	@echo "$(GREEN)💾 MongoDB backup alınıyor...$(NC)"
	@mkdir -p ./backups
	docker-compose exec -T mongodb mongodump --uri="mongodb://admin:sarsinti123@localhost:27017/sarsinti?authSource=admin" --archive --gzip > ./backups/sarsinti-backup-$$(date +%Y%m%d-%H%M%S).gz
	@echo "$(GREEN)✅ Backup tamamlandı!$(NC)"

restore: ## MongoDB backup'tan geri yükle (usage: make restore FILE=backup.gz)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)❌ Hata: FILE parametresi gerekli!$(NC)"; \
		echo "$(YELLOW)Kullanım: make restore FILE=backups/sarsinti-backup-20231201-120000.gz$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)📥 MongoDB restore ediliyor: $(FILE)$(NC)"
	docker-compose exec -T mongodb mongorestore --uri="mongodb://admin:sarsinti123@localhost:27017/sarsinti?authSource=admin" --archive --gzip < $(FILE)
	@echo "$(GREEN)✅ Restore tamamlandı!$(NC)"
