# StreamFlix - Data Processing System

A professional streaming platform system with RESTful API, relational database, and web application.

## System Overview

StreamFlix is a complete data processing system built with:
- **Backend**: NestJS API with PostgreSQL database (TypeScript, OOP)
- **Frontend**: React web application
- **Database**: PostgreSQL 16 with views, stored procedures, and triggers
- **Documentation**: Complete OpenAPI 3.1 specification via Swagger

## Features

### API Features
- RESTful API design (NestJS)
- Multiple response formats (JSON, XML, CSV)
- JWT-based authentication and authorization
- External API integration (TMDB)
- OpenAPI documentation via Swagger
- Data validation with class-validator
- Error handling and status codes

### Database Features
- Third Normal Form (3NF) data model
- Referential integrity with foreign keys
- Database views for security
- Stored procedures for business logic
- Triggers for auditing and automation
- Dedicated API user account
- Test data seeding

### Application Features
- User authentication (register, login, password reset)
- Profile management with age filtering
- Content library browsing
- Watch history and watchlist
- Subscription management and invites
- Internal admin console (disabled by default to align with DBMS-only requirement)

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)

### Using Docker (Recommended)

1. **Start all services**
   ```bash
   docker compose up --build
   ```

2. **Run database migrations**
   ```bash
   docker compose exec backend npx prisma migrate deploy
   ```

3. **Seed test data**
   ```bash
   docker compose exec backend npm run seed
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api
   - Swagger Docs: http://localhost:5000/api-docs
   - Database: localhost:5432

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Start database**
   ```bash
   docker compose up postgres -d
   ```

4. **Run migrations**
   ```bash
   cd backend
   npx prisma migrate dev
   npm run seed
   ```

5. **Start development servers**
   ```bash
   # From root directory
   npm run dev
   ```

## API Documentation

### Swagger UI
Access interactive API documentation at:
- **URL**: http://localhost:5000/api-docs
- **Format**: OpenAPI 3.1

### Response Formats
The API supports multiple response formats:
- **JSON** (default): `Accept: application/json` or `?format=json`
- **XML**: `Accept: application/xml` or `?format=xml`
- **CSV**: `Accept: text/csv` or `?format=csv`

Example:
```bash
# JSON (default)
curl http://localhost:5000/api/content/titles

# XML
curl -H "Accept: application/xml" http://localhost:5000/api/content/titles
# or
curl http://localhost:5000/api/content/titles?format=xml

# CSV
curl -H "Accept: text/csv" http://localhost:5000/api/content/titles
# or
curl http://localhost:5000/api/content/titles?format=csv
```

## External API Integration

The system integrates with **TMDB (The Movie Database)** API for content discovery:

### Endpoints
- `GET /api/external/search?q=query&type=movie` - Search external content
- `GET /api/external/trending?type=movie` - Get trending content
- `GET /api/external/details/:id?type=movie` - Get content details

### Configuration
Set `TMDB_API_KEY` in environment variables (optional, uses demo key if not set).

## Database

### Database User
- **API User**: `api_user_account` (limited permissions)
- **Admin User**: `postgres` (full access)
Set `API_DB_PASSWORD` to provision the API user password; the backend connects using
`API_DATABASE_URL` in `docker-compose.yml`.

### Database Features
- **Views**: `view_accounts_public`, `view_profiles_with_filters`
- **Stored Procedures**: 
  - `sp_log_viewing_event()`
  - `sp_apply_invitation_discount()`
  - `sp_update_profile_preferences()`
  - `sp_toggle_account_status()`
- **Triggers**: Account status audit, auto-update timestamps

### Accessing Database
```bash
# Using psql
docker compose exec postgres psql -U postgres -d streamflix

# Using external tool (DataGrip, DBeaver, etc.)
Host: localhost
Port: 5432
Database: streamflix
User: postgres
Password: postgres (default)
```

## Design Documentation

Complete design documentation is available in the `docs/` directory:

- **[Architecture Diagram](docs/ARCHITECTURE.md)** - System architecture and component interactions
- **[Class Diagram](docs/CLASS_DIAGRAM.md)** - API class structure and relationships
- **[ERD](docs/ERD.md)** - Entity Relationship Diagram in 3NF with cardinalities
- **[Backup & Recovery](docs/BACKUP_RECOVERY.md)** - Backup and recovery procedures

## Test Data

The seed script creates test accounts:
- `demo@streamflix.local` / `ChangeMe123!` (Active, HD plan)
- `alice@example.com` / `Password123!` (Active, UHD plan)
- `bob@example.com` / `Password123!` (Active, SD plan)
- `charlie@example.com` / `Password123!` (Pending)
- `diana@example.com` / `Password123!` (Active, HD plan)

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Security

- JWT token-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS configuration
- SQL injection prevention (Prisma)
- Input validation (class-validator)

## License

This project is for educational purposes.

## Support

For issues or questions, please refer to the documentation in the `docs/` directory.
