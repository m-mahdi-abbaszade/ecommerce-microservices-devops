# ═══════════════════════════════════════════════
#  E-Commerce Microservices - Makefile
# ═══════════════════════════════════════════════

.PHONY: up down build clean logs restart status seed help

## Build and start all services
up:
	docker compose up --build -d
	@echo ""
	@echo "============================================"
	@echo "  E-Commerce Microservices are starting..."
	@echo "============================================"
	@echo ""
	@echo "  Frontend:        http://localhost"
	@echo "  API Gateway:     http://localhost/api/"
	@echo "  Product API:     http://localhost/api/products"
	@echo "  Inventory API:   http://localhost/api/inventory"
	@echo "  Order API:       http://localhost/api/orders"
	@echo "  Profile API:     http://localhost/api/profiles"
	@echo "  Shipping API:    http://localhost/api/shipping"
	@echo "  Support API:     http://localhost/api/support"
	@echo ""

## Build and start in foreground (see logs)
dev:
	docker compose up --build

## Stop all services
down:
	docker compose down

## Stop and remove all volumes (clean slate)
clean:
	docker compose down -v --rmi local --remove-orphans
	@echo "All containers, volumes, and images removed."

## Build all images without starting
build:
	docker compose build

## View logs for all services
logs:
	docker compose logs -f

## View logs for a specific service (usage: make logs-svc SVC=product-catalog)
logs-svc:
	docker compose logs -f $(SVC)

## Restart a specific service (usage: make restart-svc SVC=product-catalog)
restart-svc:
	docker compose restart $(SVC)

## Restart all services
restart:
	docker compose restart

## Show status of all services
status:
	docker compose ps

## Rebuild and restart a specific service (usage: make rebuild SVC=product-catalog)
rebuild:
	docker compose up --build -d --no-deps $(SVC)

## List all Docker resources used by this project
resources:
	docker compose config --services

## Prune unused Docker resources
prune:
	docker system prune -f

## Help
help:
	@echo ""
	@echo "E-Commerce Microservices Commands:"
	@echo "============================================"
	@echo "  make up          - Build and start all services (detached)"
	@echo "  make dev         - Build and start in foreground"
	@echo "  make down        - Stop all services"
	@echo "  make clean       - Stop and remove volumes + images"
	@echo "  make build       - Build all Docker images"
	@echo "  make logs        - View all service logs"
	@echo "  make logs-svc SVC=name - View logs for specific service"
	@echo "  make restart     - Restart all services"
	@echo "  make restart-svc SVC=name - Restart specific service"
	@echo "  make rebuild SVC=name - Rebuild specific service"
	@echo "  make status      - Show service status"
	@echo "  make prune       - Prune unused Docker resources"
	@echo "  make help        - Show this help message"
	@echo ""
