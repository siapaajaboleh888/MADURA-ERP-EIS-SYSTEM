# Deployment and Rollback Guide — MADURA ERP / EIS

## 1. Production Deployment on Ubuntu VPS with Docker

### Step 1: Clone and Configure
```bash
git clone https://github.com/madura-erp/madura-erp.git /opt/madura-erp
cd /opt/madura-erp
cp .env.example .env
```

### Step 2: Launch Docker Stack
```bash
docker compose up -d --build
```

### Step 3: Initialize Database
```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

---

## 2. Realistic Rollback Procedure (Release N → Release N-1)

If an issue occurs during cutover or deployment, execute the following standardized rollback procedure:

### Phase 1: Traffic Isolation
```bash
# Point Nginx to maintenance page
docker compose exec nginx cp /etc/nginx/maintenance.conf /etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload
```

### Phase 2: Database Restoration
```bash
# Restore PostgreSQL database from pre-cutover snapshot
docker compose exec -T postgres psql -U madura_user -d madura_erp < /backups/madura_erp_pre_cutover.sql
```

### Phase 3: Roll Back Application Containers to Tagged Release N-1
```bash
# Pull previous stable release image
docker compose pull backend:v0.9.0 frontend:v0.9.0
docker compose up -d --no-deps backend frontend
```

### Phase 4: Verification and Re-opening
```bash
# Verify Health Check Endpoint
curl -I http://localhost:8000/api/health

# Restore Nginx proxy configuration
docker compose exec nginx cp /etc/nginx/default.conf /etc/nginx/conf.d/default.conf
docker compose exec nginx nginx -s reload
```
