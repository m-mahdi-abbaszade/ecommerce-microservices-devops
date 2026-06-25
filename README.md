<div align="center">

# E-Commerce Microservices

### A Production-Grade Dockerized Microservices Architecture

[![Docker](https://img.shields.io/badge/Docker-24+-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Nginx](https://img.shields.io/badge/Nginx-1.25-009639?logo=nginx)](https://nginx.org/)

*7 independent microservices · 14 Docker containers · 1 command to launch*

</div>

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│                      http://localhost                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                  ┌────────▼────────┐
                  │   API Gateway    │
                  │   Nginx :80     │
                  │  Rate Limiting   │
                  │  Gzip / Routing  │
                  └───┬──┬──┬──┬────┘
                      │  │  │  │
         ┌────────────┤  │  │  ├────────────┐
         │            │  │  │  │            │
    ┌────▼───┐  ┌────▼──▼──▼──▼───┐  ┌────▼────┐
    │Product │  │  Order  │Profile │  │Contact  │
    │Catalog │  │  Mgmt   │  Mgmt  │  │Support  │
    │ :3001  │  │  :3003  │ :3004  │  │ :3006   │
    └───┬────┘  └──┬──┬───┘───┬────┘  └────┬────┘
        │          │  │       │             │
   ┌────▼────┐ ┌──▼──▼──┐ ┌──▼───┐    ┌───▼────┐
   │Inventory│ │Shipping │ │  PG  │    │   PG   │
   │  :3002  │ │  :3005  │ │  DB  │    │   DB   │
   └────┬────┘ └────┬────┘ └──────┘    └────────┘
        │           │
   ┌────▼────┐ ┌───▼────┐
   │   PG    │ │  PG    │
   │   DB    │ │  DB    │
   └─────────┘ └────────┘

   ┌──────────────────────────────┐
   │        Ecommerce UI          │
   │   React + Vite + Tailwind    │
   │     Served via Nginx         │
   └──────────────────────────────┘
```

## Services

| Service | Port | Tech Stack | Description |
|---------|------|-----------|-------------|
| **API Gateway** | `80` | Nginx 1.25 | Reverse proxy, rate limiting, gzip, SPA routing |
| **Product Catalog** | `3001` | Express + Sequelize + PostgreSQL | Product & category CRUD, search, pagination |
| **Product Inventory** | `3002` | Express + Sequelize + PostgreSQL | Stock management, reserve/release with row locking |
| **Order Management** | `3003` | Express + Sequelize + PostgreSQL | Order orchestration across services |
| **Profile Management** | `3004` | Express + Sequelize + PostgreSQL | User auth (JWT + bcrypt), profiles, addresses |
| **Shipping & Handling** | `3005` | Express + Sequelize + PostgreSQL | Shipping methods, shipments, tracking |
| **Contact Support** | `3006` | Express + Sequelize + PostgreSQL | Support tickets & messaging |
| **Ecommerce UI** | `80` (internal) | React 18 + Vite + Tailwind + TypeScript | Modern SPA frontend |

## Key Features

- **Microservices Architecture** — Each service has its own database, Dockerfile, and independent deployment
- **Docker Compose Orchestration** — 14 containers (6 databases + 6 backend + 1 UI + 1 gateway)
- **Multi-Stage Docker Builds** — Optimized production images with non-root users
- **PostgreSQL per Service** — Database-per-service pattern with seed data and health checks
- **Nginx API Gateway** — Rate limiting (30 req/min API, 5 req/min login), gzip compression
- **Inter-Service Communication** — REST over Docker internal DNS with service discovery
- **Order Orchestration** — Order creation triggers: Inventory reservation → Profile lookup → Shipment creation
- **JWT Authentication** — Bcrypt password hashing + JWT tokens
- **Inventory Transactions** — Row-level locking to prevent race conditions
- **React SPA** — Modern UI with Tailwind CSS, routing, cart, auth context

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/) (v2+, included with Docker Desktop)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/m-mahdi-abbaszade/ecommerce-microservices-devops.git
cd ecommerce-microservices-devops

# 2. Copy environment variables
cp .env.example .env

# 3. Build and start everything
docker compose up --build
```

Open **http://localhost** in your browser. That's it!

## Useful Commands

```bash
# Start all services (detached)
docker compose up -d

# View logs for all services
docker compose logs -f

# View logs for a specific service
docker compose logs -f product-catalog

# Stop all services
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v

# Rebuild a single service
docker compose up -d --build product-catalog

# Run a shell inside a container
docker compose exec product-catalog sh

# Check database health
docker compose exec product-catalog-db pg_isready -U catalog_user -d product_catalog
```

### Makefile Shortcuts

```bash
make up          # Start all services
make down        # Stop all services
make clean       # Stop + remove volumes + prune images
make logs        # Tail all logs
make rebuild SVC=product-catalog   # Rebuild a specific service
```

## API Endpoints

All API requests go through the API Gateway at `http://localhost/api`.

### Product Catalog
```
GET    /api/products              # List products (pagination, search, filter)
GET    /api/products/:id          # Get single product
POST   /api/products              # Create product
PUT    /api/products/:id          # Update product
DELETE /api/products/:id          # Soft delete product
GET    /api/categories            # List categories
```

### Product Inventory
```
GET    /api/inventory             # List all inventory
GET    /api/inventory/:productId  # Get stock for a product
PUT    /api/inventory/:productId  # Update stock
PUT    /api/inventory/:productId/reserve   # Reserve stock (transactional)
PUT    /api/inventory/:productId/release   # Release reserved stock
```

### Order Management
```
GET    /api/orders                # List orders
GET    /api/orders/:id            # Get order details
POST   /api/orders                # Create order (orchestrates inventory + shipping)
PUT    /api/orders/:id/cancel     # Cancel order (releases inventory)
```

### Profile Management
```
POST   /api/auth/register         # Register new user
POST   /api/auth/login            # Login (returns JWT)
GET    /api/profile               # Get profile (requires JWT)
PUT    /api/profile               # Update profile
GET    /api/profile/addresses     # List addresses
POST   /api/profile/addresses     # Add address
```

### Shipping & Handling
```
GET    /api/shipping/methods      # List shipping methods
POST   /api/shipping/shipments    # Create shipment
GET    /api/shipping/track/:trackingNumber  # Track shipment
```

### Contact Support
```
GET    /api/support/tickets       # List tickets
POST   /api/support/tickets       # Create ticket
GET    /api/support/tickets/:id   # Get ticket with messages
POST   /api/support/tickets/:id/messages   # Add message
```

## Project Structure

```
├── api-gateway/
│   ├── Dockerfile
│   └── nginx.conf                 # Routing, rate limiting, upstreams
├── scripts/
│   └── wait-for-it.sh             # Database readiness script
├── services/
│   ├── product-catalog/
│   │   ├── Dockerfile
│   │   ├── db/init.sql            # Schema + seed data
│   │   └── src/
│   │       ├── server.js
│   │       ├── models/
│   │       ├── controllers/
│   │       ├── routes/
│   │       └── middleware/
│   ├── product-inventory/         # Same structure
│   ├── order-management/          # Same structure + inter-service calls
│   ├── profile-management/        # Same structure + JWT auth
│   ├── shipping-handling/         # Same structure
│   ├── contact-support/           # Same structure
│   └── ecommerce-ui/
│       ├── Dockerfile
│       ├── nginx.conf
│       ├── src/
│       │   ├── App.tsx
│       │   ├── api/client.ts      # Axios API client
│       │   ├── components/        # Navbar, ProductCard
│       │   ├── context/           # AuthContext, CartContext
│       │   └── pages/             # Home, Products, Cart, Login, Orders, Support
│       ├── tailwind.config.js
│       └── vite.config.ts
├── docker-compose.yml             # All 14 containers
├── .env.example                   # Environment variable template
├── Makefile                       # Convenience commands
└── README.md
```

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | PostgreSQL per service | Data isolation, independent scaling, schema autonomy |
| Communication | Synchronous REST | Simplicity, easy debugging, well-understood pattern |
| Gateway | Nginx | High performance, battle-tested reverse proxy |
| Frontend | React + Vite | Fast dev experience, modern tooling, small bundle |
| Styling | Tailwind CSS | Utility-first, no CSS file management |
| ORM | Sequelize | Mature Node.js ORM with migrations and associations |
| Auth | JWT + bcrypt | Stateless authentication, no session storage needed |
| Containers | Multi-stage builds | Smaller production images, no build tools in prod |
| Security | Non-root users | Containers run as `nodejs` user, not root |

## Inter-Service Communication

The **Order Management** service orchestrates cross-service operations during order creation:

```
Client → POST /api/orders
         │
         ├─→ Inventory Service: Reserve stock (PUT /reserve)
         │     └─→ Uses transaction-level row locking (FOR UPDATE)
         │
         ├─→ Profile Service: Get shipping address (GET /profile/addresses)
         │
         ├─→ Product Catalog: Get product details (GET /products/:id)
         │
         ├─→ Shipping Service: Create shipment (POST /shipments)
         │     └─→ Generates UUID tracking number
         │
         └─→ Local DB: Create order + order items
```

## Environment Variables

Copy `.env.example` to `.env` and customize as needed:

| Variable | Default | Description |
|----------|---------|-------------|
| `CATALOG_DB_*` | `product_catalog` | Product Catalog database credentials |
| `INVENTORY_DB_*` | `product_inventory` | Product Inventory database credentials |
| `ORDER_DB_*` | `order_management` | Order Management database credentials |
| `PROFILE_DB_*` | `profile_management` | Profile Management database credentials |
| `SHIPPING_DB_*` | `shipping_handling` | Shipping database credentials |
| `SUPPORT_DB_*` | `contact_support` | Support database credentials |
| `JWT_SECRET` | `ecommerce-microservices-...` | Secret key for JWT token signing |
| `*_SERVICE_URL` | `http://service:port` | Inter-service communication URLs |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router, Axios, Lucide Icons |
| **Backend** | Node.js 20, Express.js, Sequelize ORM |
| **Database** | PostgreSQL 16 (Alpine) per service |
| **Gateway** | Nginx 1.25 (Alpine) |
| **Containers** | Docker, Docker Compose, multi-stage builds |
| **Security** | JWT, bcrypt, non-root container users |

## Troubleshooting

**Port conflicts** — If port 80 or 3000-3006 are in use, edit port mappings in `docker-compose.yml`.

**Database not ready** — Services use `wait-for-it.sh` to wait for PostgreSQL health checks before starting.

**502 Bad Gateway** — Ensure all services are running: `docker compose ps`. Check gateway logs: `docker compose logs api-gateway`.

**Reset everything** — `docker compose down -v && docker compose up --build`

## License

MIT
