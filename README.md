# REST API Scaffold

A production-oriented REST API starter template built with **Node.js, TypeScript, Express, PostgreSQL, and Kysely**.

This repository is intended to provide a reusable foundation for future backend projects so that common concerns—authentication, authorization, validation, error handling, security middleware, logging, database access, migrations, testing, and CI—do not have to be rebuilt from scratch for every new API.

> **Template status:** This repository is a scaffold/template rather than a complete business application. The included `auth`, `users`, `health`, and `audit-logs` modules demonstrate the architecture and provide a functional baseline that can be extended or replaced for a specific project.

---

## Table of Contents

- [Overview](#overview)
- [Goals](#goals)
- [Technology Stack](#technology-stack)
- [Core Features](#core-features)
- [Architecture](#architecture)
  - [High-Level Architecture](#high-level-architecture)
  - [Request Lifecycle](#request-lifecycle)
  - [Application Layers](#application-layers)
  - [Module Structure](#module-structure)
- [Repository Structure](#repository-structure)
- [Included Modules](#included-modules)
  - [Authentication](#authentication)
  - [Authorization and RBAC](#authorization-and-rbac)
  - [Users](#users)
  - [Health](#health)
  - [Audit Logs](#audit-logs)
- [Security](#security)
- [Database Architecture](#database-architecture)
  - [Main Database](#main-database)
  - [Audit Database](#audit-database)
  - [Connection Pooling](#connection-pooling)
  - [Migrations](#migrations)
- [Configuration](#configuration)
- [API Conventions](#api-conventions)
  - [Success Responses](#success-responses)
  - [Error Responses](#error-responses)
  - [Validation](#validation)
  - [Request IDs](#request-ids)
- [Development Setup](#development-setup)
- [Available Commands](#available-commands)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [CI Pipeline](#ci-pipeline)
- [Extending the Scaffold](#extending-the-scaffold)
- [Recommended Project Workflow](#recommended-project-workflow)
- [Production Considerations](#production-considerations)
- [Design Principles](#design-principles)
- [What to Customize Before Reuse](#what-to-customize-before-reuse)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The goal of this project is to make starting a new REST API a **project initialization task rather than an infrastructure-reconstruction task**.

A new project can begin with an established structure for:

- HTTP application bootstrapping
- Environment validation
- PostgreSQL connectivity
- Type-safe SQL access through Kysely
- Database migrations through dbmate
- Authentication using access and refresh tokens
- Password hashing
- Role-based access control (RBAC)
- Request validation with Zod
- Centralized application errors
- Consistent API responses
- Security headers through Helmet
- CORS configuration
- Global and endpoint-specific rate limiting
- Request correlation IDs
- Structured logging with Pino
- Audit-log persistence
- Unit and integration testing with Vitest
- Test database setup and isolation helpers
- Formatting and linting
- Git hooks
- Conventional commit validation
- GitHub Actions CI

The repository is deliberately organized so that business functionality can be added as independent modules without turning the codebase into a collection of unrelated controllers, services, and utilities.

---

## Goals

### Primary goals

1. **Start projects faster**  
   Provide a ready-to-use baseline for common API concerns.

2. **Keep business domains isolated**  
   Organize application functionality by module/domain rather than by a single global `controllers`, `services`, and `models` hierarchy.

3. **Maintain strong type safety**  
   Use TypeScript strict mode and Kysely's typed database interfaces.

4. **Make security a default concern**  
   Include authentication, authorization, security headers, CORS, validation, password hashing, and rate limiting from the beginning.

5. **Make failures observable**  
   Provide structured logs, request IDs, centralized errors, and a dedicated audit-log database.

6. **Make testing part of the architecture**  
   Include unit tests, integration tests, test setup utilities, migrations, and CI execution.

7. **Remain easy to deploy**  
   Keep infrastructure assumptions minimal while providing clear boundaries for adding Docker, cloud infrastructure, CI/CD, observability, and other deployment concerns.

---

## Technology Stack

| Area               | Technology                     | Purpose                                         |
| ------------------ | ------------------------------ | ----------------------------------------------- |
| Runtime            | Node.js                        | Server-side JavaScript runtime                  |
| Language           | TypeScript                     | Static typing and maintainability               |
| HTTP framework     | Express                        | REST API routing and middleware                 |
| Database           | PostgreSQL 16                  | Relational persistence                          |
| Query builder      | Kysely                         | Type-safe SQL query construction                |
| PostgreSQL driver  | `pg`                           | PostgreSQL connectivity and pooling             |
| Migrations         | dbmate                         | SQL-based database migrations                   |
| Validation         | Zod                            | Runtime request validation                      |
| Authentication     | JWT                            | Stateless access-token authentication           |
| Password hashing   | bcryptjs                       | Password hashing and verification               |
| Authorization      | Custom RBAC                    | Roles and permissions                           |
| Security headers   | Helmet                         | HTTP security headers                           |
| CORS               | cors                           | Cross-origin access control                     |
| Rate limiting      | express-rate-limit             | Request abuse protection                        |
| Logging            | Pino                           | Structured application logging                  |
| HTTP logging       | pino-http / request middleware | Request-level observability                     |
| Time handling      | Luxon                          | Date/time utilities                             |
| IDs                | UUID                           | Identifier generation                           |
| Testing            | Vitest                         | Unit and integration testing                    |
| HTTP testing       | Supertest                      | API integration testing                         |
| Coverage           | V8                             | Test coverage                                   |
| Linting            | ESLint                         | Static analysis                                 |
| Formatting         | Prettier                       | Consistent code formatting                      |
| Git hooks          | Husky + lint-staged            | Local quality gates                             |
| Commit conventions | Commitlint                     | Conventional commit enforcement                 |
| CI                 | GitHub Actions                 | Automated quality, tests, migrations, and build |
| Local database     | Docker Compose                 | PostgreSQL development environment              |
| Package manager    | pnpm                           | Dependency management                           |

The project is configured as an ES module package and uses TypeScript's `NodeNext` module system with strict type checking.

---

## Core Features

### API foundation

- Express application bootstrap
- Separate application and server entry points
- Environment-aware configuration
- Centralized middleware registration
- 404 handling
- Centralized error handling
- Standardized success/error response structures

### Security

- Helmet security headers
- CORS with configurable allowed origins
- Global rate limiting
- Strict login rate limiting
- JWT access-token authentication
- Refresh-token rotation
- Password hashing with bcrypt
- RBAC permission checks
- Request validation
- `x-powered-by` disabled

### Database

- PostgreSQL
- Kysely type-safe database access
- Native `pg` connection pools
- Separate application and audit databases
- Configurable connection pooling
- SQL migrations
- Migration rollback/status commands
- Database health checks

### Observability

- Structured Pino logging
- Request IDs
- Response duration logging
- Request-scoped logging context
- Audit-log persistence
- Error responses containing request IDs
- Graceful shutdown logging

### Testing

- Unit tests
- Integration tests
- Dedicated test setup utilities
- Test database lifecycle management
- Database migrations for integration tests
- Vitest coverage
- CI execution against PostgreSQL services

### Developer experience

- pnpm scripts
- Prettier
- ESLint
- Husky
- lint-staged
- Commitlint
- Docker Compose
- GitHub Actions

---

# Architecture

## High-Level Architecture

The scaffold follows a modular, layered architecture.

```mermaid
flowchart TD
    Client[API Client] --> Express[Express Application]

    Express --> Security[Security Middleware]
    Security --> Validation[Request Validation]
    Validation --> Routes[Domain Routes]

    Routes --> Services[Application Services]
    Services --> Repositories[Repositories]
    Repositories --> MainDB[(PostgreSQL<br/>Main Database)]

    Services --> AuditService[Audit Log Service]
    AuditService --> AuditRepo[Audit Log Repository]
    AuditRepo --> AuditDB[(PostgreSQL<br/>Audit Database)]

    Routes --> Errors[Central Error Handler]
    Services --> Errors

    Express --> RequestID[Request ID]
    RequestID --> Logger[Structured Logging]
    Routes --> Logger
    Services --> Logger
```

The important architectural boundary is:

```text
HTTP
  ↓
Middleware
  ↓
Routes
  ↓
Services
  ↓
Repositories
  ↓
Database
```

Cross-cutting concerns such as logging, validation, authentication, authorization, errors, and request IDs are handled independently from business logic.

---

## Request Lifecycle

A typical request flows through the application approximately as follows:

```text
Incoming HTTP request
        │
        ▼
Request ID middleware
        │
        ▼
Request logging context
        │
        ▼
Helmet
        │
        ▼
CORS
        │
        ▼
JSON / URL-encoded body parsing
        │
        ▼
Global rate limiter
        │
        ▼
Route
        │
        ├── Authentication
        │
        ├── Authorization
        │
        └── Request validation
                │
                ▼
             Service
                │
                ▼
           Repository
                │
                ▼
            PostgreSQL
                │
                ▼
           Service result
                │
                ▼
       Standard API response
                │
                ▼
        Request completion log
```

Failures are routed through the centralized error handler.

---

## Application Layers

### 1. Routes

Routes define the HTTP contract.

Responsibilities:

- HTTP method/path registration
- Middleware composition
- Request validation
- Calling the appropriate service
- Selecting the HTTP status code
- Returning the standardized response

Routes should remain thin.

Example conceptual flow:

```text
POST /users
  → authenticate
  → requirePermission(USER_CREATE)
  → validateRequest(...)
  → userService.create(...)
  → response
```

### 2. Services

Services contain application/business logic.

Responsibilities:

- Business rules
- Orchestration
- Coordinating repositories
- Authentication workflows
- Authorization construction
- Domain-specific error handling
- Transaction orchestration where required

Services should not be responsible for Express request/response handling.

### 3. Repositories

Repositories isolate persistence concerns.

Responsibilities:

- SQL queries
- Database reads/writes
- Query composition
- Mapping database persistence operations

This separation allows business services to remain independent of the low-level database implementation.

### 4. Database Layer

The database layer defines:

- Kysely database interfaces
- Table types
- PostgreSQL connection pools
- Main and audit database clients
- Database lifecycle operations

### 5. Middleware

Middleware implements cross-cutting HTTP behavior such as:

- Authentication
- Authorization
- Rate limiting
- Error handling
- Request IDs
- Request logging
- 404 handling

---

# Module Structure

Business domains live under `src/modules`.

```text
src/modules/
├── audit-logs/
├── auth/
├── health/
└── users/
```

Each domain can contain its own:

```text
<domain>/
├── <domain>.routes.ts
├── <domain>.schemas.ts
├── <domain>.service.ts
└── tests
```

This structure encourages **feature-oriented development**.

For example, adding an `orders` domain should look conceptually like:

```text
src/modules/orders/
├── order.routes.ts
├── order.schemas.ts
├── order.service.ts
└── order.test.ts
```

If the domain needs persistence:

```text
src/database/repositories/
└── order.repository.ts
```

This makes domain boundaries explicit and helps prevent unrelated functionality from becoming coupled.

---

# Repository Structure

```text
.
├── .github/
│   ├── workflows/
│   │   └── ci.yml
│   └── pull-request-template.md
│
├── .husky/
│   ├── commit-msg
│   └── pre-commit
│
├── db/
│   ├── main/
│   │   └── migrations/
│   └── audit/
│       └── migrations/
│
├── src/
│   ├── common/
│   │   ├── errors/
│   │   ├── utils/
│   │   └── validators/
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── index.ts
│   │
│   ├── database/
│   │   ├── repositories/
│   │   ├── db.ts
│   │   ├── schema.ts
│   │   └── types.ts
│   │
│   ├── middleware/
│   │   ├── authenticate.ts
│   │   ├── error-handler.ts
│   │   ├── not-found-handler.ts
│   │   ├── rate-limiter.ts
│   │   ├── request-id.ts
│   │   ├── request-logger.ts
│   │   └── require-permission.ts
│   │
│   ├── modules/
│   │   ├── audit-logs/
│   │   ├── auth/
│   │   ├── health/
│   │   └── users/
│   │
│   ├── tests/
│   │   ├── integration/
│   │   └── setup/
│   │
│   ├── types/
│   │   └── auth-user.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .gitignore
├── .prettierignore
├── .prettierrc.json
├── commitlint.config.cjs
├── docker-compose.yml
├── eslint.config.mjs
├── example.env
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.json
└── vitest.config.ts
```

---

# Included Modules

## Authentication

The `auth` module provides a baseline authentication workflow:

- User registration
- User login
- Access-token generation
- Refresh-token generation
- Refresh-token hashing
- Refresh-token rotation
- Current-user lookup
- Password hashing and verification

Endpoints:

| Method | Endpoint         | Authentication      |
| ------ | ---------------- | ------------------- |
| `POST` | `/auth/register` | Public              |
| `POST` | `/auth/login`    | Public              |
| `POST` | `/auth/refresh`  | Public              |
| `GET`  | `/auth/me`       | Bearer access token |

The access token is a JWT containing the authenticated user's identity, roles, and permissions.

Refresh tokens are generated using cryptographically secure random bytes and stored in the database as SHA-256 hashes rather than storing the raw refresh token.

The default access-token lifetime is **15 minutes** and the default refresh-token lifetime is **7 days**. These values are configurable through environment variables.

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Auth as Auth Service
    participant DB as Main DB

    Client->>API: POST /auth/login
    API->>API: Validate request
    API->>Auth: Login credentials
    Auth->>DB: Find user
    DB-->>Auth: User
    Auth->>Auth: Verify bcrypt password
    Auth->>DB: Store refresh-token hash
    Auth-->>API: Access + refresh tokens
    API-->>Client: Authentication response

    Client->>API: GET /auth/me
    API->>API: Verify JWT
    API->>Auth: Get current user
    Auth->>DB: Load user
    DB-->>Auth: User
    Auth-->>API: User profile
    API-->>Client: User response
```

### Password security

Passwords are hashed using bcrypt with a salt-round configuration of 12.

### Refresh-token security

The refresh-token flow:

1. Generates a random refresh token.
2. Hashes the token before persistence.
3. Stores the hash with an expiration timestamp.
4. Accepts the raw token from the client during refresh.
5. Hashes the presented token.
6. Looks up the stored hash.
7. Rejects revoked or expired tokens.
8. Revokes the consumed token.
9. Issues a new access token and refresh token.

This provides a foundation for refresh-token rotation and token revocation.

---

# Authorization and RBAC

Authorization is implemented separately from authentication.

The scaffold defines:

```text
User
  │
  └── User Roles
          │
          └── Roles
                │
                └── Role Permissions
                        │
                        └── Permissions
```

The current scaffold includes an `admin` role and permissions such as:

- `auth.me.read`
- `user.read`
- `user.create`
- `user.update`
- `user.deactivate`
- `view.audit.logs`

The permission middleware can be used like:

```ts
requirePermission(PERMISSIONS.USER_CREATE);
```

This produces a reusable authorization boundary between authentication and individual business endpoints.

### Why permissions rather than role checks?

Prefer:

```text
requirePermission("user.create")
```

over:

```text
if (user.role === "admin")
```

because permissions are more flexible as the application grows.

A future project can add roles such as:

```text
admin
manager
editor
support
auditor
```

without changing route authorization logic.

---

# Users

The users module demonstrates how a normal business domain can be implemented.

Current endpoints:

| Method | Endpoint     | Permission    |
| ------ | ------------ | ------------- |
| `POST` | `/users`     | `user.create` |
| `GET`  | `/users/:id` | `user.read`   |

The module contains:

- Request schemas
- User service
- User routes
- User repository integration

The module is intentionally small so it can act as a reference implementation for adding future domains.

---

# Health

The health module provides:

```http
GET /health
```

The health check verifies connectivity to both configured PostgreSQL databases.

A successful response indicates that the API can communicate with the main database and audit database.

This endpoint is suitable as a foundation for:

- Container health checks
- Load balancer health checks
- Kubernetes probes
- Cloud deployment health checks
- Operational monitoring

---

# Audit Logs

The scaffold treats audit logging as a first-class concern.

Audit records can contain:

- Action
- Entity name
- Entity ID
- Payload
- User who performed the action
- Timestamp
- Client IP
- Notes
- Request ID

The audit-log API currently exposes:

| Method | Endpoint          | Permission        |
| ------ | ----------------- | ----------------- |
| `GET`  | `/audit-logs`     | `view.audit.logs` |
| `GET`  | `/audit-logs/:id` | `view.audit.logs` |

The list endpoint supports filters such as:

- `requestId`
- `performedBy`
- `entityName`
- `entityId`
- `limit`
- `offset`

The separation of audit storage from the main application database makes the design suitable for systems where audit records should have a distinct persistence boundary.

---

# Security

Security is implemented as a layered defense rather than a single authentication mechanism.

## HTTP security

Helmet is enabled globally.

The Express `X-Powered-By` header is disabled to reduce framework fingerprinting.

## CORS

CORS is configured through:

```text
CORS_ORIGIN
```

Multiple origins can be provided as a comma-separated list.

Credentials are enabled to support authenticated browser-based clients where appropriate.

## Rate limiting

The scaffold has two built-in rate limits.

### Global limiter

Default:

```text
200 requests
per IP
per 15 minutes
```

### Authentication limiter

Login endpoints are restricted to:

```text
5 attempts
per IP
per 15 minutes
```

The rate limiter is disabled during tests so integration tests do not interfere with one another.

For a distributed production deployment, replace the in-memory rate-limit store with a shared store such as Redis if rate limiting must remain consistent across multiple application instances.

## Request validation

All external input should be validated before reaching application logic.

The scaffold supports validation for:

- Request bodies
- Query parameters
- Route parameters

Zod validation errors are converted into the application's standard error format.

## Authentication

Protected routes use:

```http
Authorization: Bearer <access-token>
```

Access tokens are verified before the request reaches protected business logic.

## Authorization

Authentication answers:

> Who are you?

Authorization answers:

> Are you allowed to perform this operation?

The scaffold keeps those concerns separate.

---

# Database Architecture

## Main Database

The primary PostgreSQL database stores application data.

Current logical tables include:

```text
users
refresh_tokens
roles
permissions
user_roles
role_permissions
```

These tables support:

- User identity
- Password credentials
- Refresh-token persistence
- Role definitions
- Permission definitions
- User-to-role relationships
- Role-to-permission relationships

---

## Audit Database

Audit logs are stored separately.

```text
audit_log
```

The application creates two Kysely clients:

```text
db       → Main PostgreSQL database
auditdb  → Audit PostgreSQL database
```

This is an intentional architectural boundary rather than simply another table in the main database.

---

## Connection Pooling

Both database clients use PostgreSQL connection pools.

The current pool configuration includes:

```text
max connections:              10
idle timeout:                 30 seconds
connection timeout:            5 seconds
maximum connection lifetime: 30 minutes
```

These values are starting points, not universal production values.

For production deployments, pool size should be evaluated against:

- Database instance limits
- Number of API instances
- Request concurrency
- Query duration
- Connection utilization
- Deployment model
- Background workers
- Other services sharing the database

---

## Database Schema Typing

Kysely database interfaces describe the application's relational schema.

For example:

```ts
export interface Database {
  users: UserTable;
  refresh_tokens: RefreshTokenTable;
  roles: RoleTable;
  permissions: PermissionTable;
  user_roles: UserRoleTable;
  role_permissions: RolePermissionTable;
}
```

The audit database is modeled separately:

```ts
export interface AuditDatabase {
  audit_log: AuditLogTable;
}
```

This provides compile-time checking for database operations while retaining direct SQL control.

---

# Migrations

Database migrations are stored as SQL files.

```text
db/
├── main/
│   └── migrations/
└── audit/
    └── migrations/
```

The main database currently contains migrations for:

- Users
- Refresh tokens
- RBAC tables
- Initial roles and permissions
- Role/permission junction data

The audit database contains the audit-log table migration.

### Why SQL migrations?

The scaffold intentionally uses SQL migrations rather than an ORM schema generator.

Benefits include:

- Explicit database changes
- Database-native SQL
- Easier review of schema changes
- Predictable deployment behavior
- Independence from an ORM-specific schema model

---

# Configuration

Configuration is environment-driven.

The scaffold uses:

- `dotenv` for loading environment variables
- `envalid` for validation and type coercion

Supported environments:

```text
development
test
production
```

Example configuration:

```env
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restapi
DATABASE_MIGRATIONS_DIR=./db/main/migrations

AUDIT_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/restapi_audit
AUDIT_DATABASE_MIGRATIONS_DIR=./db/audit/migrations

JWT_ACCESS_SECRET=change-me-access-secret
JWT_REFRESH_SECRET=change-me-refresh-secret
JWT_ACCESS_EXPIRES_IN_MINUTES=15
JWT_REFRESH_EXPIRES_IN_DAYS=7

CORS_ORIGIN=http://localhost:3001
LOG_LEVEL=info
COOKIE_SECURE=false
```

Use `example.env` as the starting point for local configuration.

### Important

Never commit real credentials, JWT secrets, database passwords, or production environment values.

For production, secrets should be injected through the deployment environment or a dedicated secret-management system.

---

# API Conventions

## Success Responses

Successful API responses use a consistent envelope:

```json
{
  "success": true,
  "data": {},
  "meta": null
}
```

`meta` can be used for:

- Pagination
- Counts
- Additional response metadata
- Query information

Example:

```json
{
  "success": true,
  "data": [
    {
      "id": "..."
    }
  ],
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0
  }
}
```

---

## Error Responses

Application errors are normalized through a central error handler.

The response structure is conceptually:

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {},
    "requestId": "..."
  }
}
```

Application-specific errors can define:

- HTTP status
- Human-readable message
- Machine-readable error code
- Structured details

This makes errors easier for frontend applications and external API consumers to handle reliably.

---

## Validation

Request validation occurs before service execution.

Example:

```text
HTTP request
    ↓
Zod schema
    ↓
Validated request
    ↓
Service
```

A validation failure results in a `400` response with a machine-readable error code.

The intention is to avoid scattering input checks throughout business logic.

---

# Request IDs

Every non-test request receives a request ID.

The application:

1. Accepts an incoming `X-Request-Id` when it matches the expected UUID format.
2. Otherwise generates a UUID.
3. Attaches it to the Express request.
4. Returns it in the response.
5. Includes it in request-scoped logging.
6. Includes it in API error responses.

Example:

```http
X-Request-Id: 4b8f1a92-...
```

This makes it possible to trace:

```text
Client request
      ↓
API logs
      ↓
Service errors
      ↓
Audit records
```

Request IDs are especially useful when diagnosing production incidents.

---

# Development Setup

## Prerequisites

Recommended development environment:

- Node.js 24
- pnpm 11+
- Docker
- Docker Compose
- Git

The CI pipeline currently uses Node.js 24 and pnpm 11.12.0.

---

## 1. Clone the repository

```bash
git clone https://github.com/jularbs/rest-api-scaffold.git
cd rest-api-scaffold
```

---

## 2. Install dependencies

```bash
pnpm install
```

---

## 3. Create environment configuration

Copy:

```text
example.env
```

to:

```text
.env
```

Then update values for your environment.

At minimum, configure:

```text
DATABASE_URL
AUDIT_DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
```

---

## 4. Start PostgreSQL

The repository includes two PostgreSQL containers:

```bash
pnpm db:up
```

The default Compose setup provides:

```text
Main PostgreSQL
localhost:5432

Audit PostgreSQL
localhost:5433
```

---

## 5. Run migrations

Main database:

```bash
pnpm db:migrate
```

Audit database:

```bash
pnpm audit:migrate
```

---

## 6. Start the API

Development mode:

```bash
pnpm dev
```

The API listens on:

```text
http://localhost:3000
```

---

## 7. Verify the API

Root endpoint:

```http
GET /
```

Health endpoint:

```http
GET /health
```

The health endpoint verifies database connectivity.

---

# Available Commands

| Command                    | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `pnpm dev`                 | Start development server with watch mode   |
| `pnpm build`               | Compile TypeScript                         |
| `pnpm start`               | Run compiled application                   |
| `pnpm typecheck`           | Run TypeScript without emitting files      |
| `pnpm test`                | Run test suite                             |
| `pnpm test:watch`          | Run tests in watch mode                    |
| `pnpm test:coverage`       | Run tests with coverage                    |
| `pnpm lint`                | Run ESLint                                 |
| `pnpm format`              | Format repository                          |
| `pnpm format:check`        | Verify formatting                          |
| `pnpm db:up`               | Start main and audit PostgreSQL containers |
| `pnpm db:down`             | Stop database containers                   |
| `pnpm db:logs`             | Follow database logs                       |
| `pnpm db:ps`               | Show database container status             |
| `pnpm db:migration:new`    | Create a main database migration           |
| `pnpm db:migrate`          | Apply main database migrations             |
| `pnpm db:rollback`         | Roll back main database migration          |
| `pnpm db:status`           | Show main database migration status        |
| `pnpm audit:migration:new` | Create an audit database migration         |
| `pnpm audit:migrate`       | Apply audit database migrations            |
| `pnpm audit:rollback`      | Roll back an audit migration               |
| `pnpm audit:status`        | Show audit migration status                |

---

# Testing

Testing is split into unit and integration concerns.

```text
src/
├── modules/
│   └── auth/
│       ├── password.test.ts
│       └── token.test.ts
│
├── middleware/
│   └── require-permission.test.ts
│
└── tests/
    ├── integration/
    └── setup/
```

## Unit tests

Unit tests cover isolated behavior such as:

- Password hashing/verification
- Token generation/verification
- Permission checks

## Integration tests

Integration tests exercise the application through HTTP and real PostgreSQL databases.

Current integration coverage includes:

- Application behavior
- Authentication
- Users
- Health
- Audit logs

The test setup provides utilities for:

- Test application creation
- Database setup
- Test data factories
- Test helpers
- Migration execution
- Test lifecycle management

---

## Test Database Isolation

The test infrastructure is designed to support isolated database schemas for test workers.

This is important because integration tests should not depend on shared mutable application state.

The database layer exposes a scoped connection-string helper specifically so test infrastructure can coordinate database schema isolation.

---

# Code Quality

The project includes multiple quality gates.

## TypeScript

Strict mode is enabled.

```text
strict: true
```

The TypeScript target is ES2022 and the project uses NodeNext module resolution.

## ESLint

Run:

```bash
pnpm lint
```

## Prettier

Format:

```bash
pnpm format
```

Verify:

```bash
pnpm format:check
```

## Pre-commit

Husky and lint-staged are used to automatically format staged files.

## Commit messages

Commitlint is configured with the conventional commit configuration.

Recommended commit style:

```text
feat: add order module
fix: handle expired refresh tokens
refactor: simplify user repository
test: add audit log integration tests
docs: update authentication guide
```

---

# CI Pipeline

GitHub Actions runs the quality pipeline on:

- Pull requests
- Pushes to `main`

The CI job provisions PostgreSQL 16 services for:

- Main application database
- Audit database

The pipeline currently performs:

```text
Checkout
   ↓
Setup pnpm
   ↓
Setup Node.js 24
   ↓
Install dependencies
   ↓
Format check
   ↓
Lint
   ↓
Create test environment
   ↓
Run main DB migrations
   ↓
Run audit DB migrations
   ↓
Run tests
   ↓
Build
```

This means a change should pass formatting, linting, database migrations, tests, and compilation before it is considered CI-clean.

---

# Extending the Scaffold

The intended workflow for adding a new domain is:

## 1. Create the module

Example:

```text
src/modules/orders/
├── order.routes.ts
├── order.schemas.ts
└── order.service.ts
```

## 2. Add persistence if required

```text
src/database/repositories/order.repository.ts
```

## 3. Add database migration

```text
db/main/migrations/
└── <timestamp>_create_orders_table.sql
```

## 4. Update Kysely database types

Add the new table to:

```text
src/database/types.ts
```

and:

```text
src/database/schema.ts
```

## 5. Register the route

In `src/app.ts`:

```ts
app.use('/orders', orderRouter);
```

## 6. Add authorization

Define the necessary permission:

```ts
ORDERS_READ;
ORDERS_CREATE;
ORDERS_UPDATE;
ORDERS_DELETE;
```

Then protect routes:

```ts
authenticate,
requirePermission(PERMISSIONS.ORDERS_CREATE),
```

## 7. Add tests

Add:

```text
unit tests
integration tests
```

where appropriate.

## 8. Add audit logging where required

For security-sensitive or business-critical operations, record:

- Who performed the action
- What entity was affected
- Which operation occurred
- Request ID
- Timestamp
- Relevant metadata

---

# Recommended Domain Pattern

For a larger project, a module can evolve into:

```text
src/modules/orders/
├── order.routes.ts
├── order.schemas.ts
├── order.service.ts
├── order.types.ts
├── order.constants.ts
├── order.mapper.ts
└── order.test.ts

src/database/repositories/
└── order.repository.ts
```

Avoid prematurely creating abstractions that are not required.

The scaffold is designed to allow a domain to grow incrementally.

---

# Recommended Project Workflow

A typical feature should follow this sequence:

```text
1. Define the business requirement
        ↓
2. Define the API contract
        ↓
3. Define validation schemas
        ↓
4. Define database changes
        ↓
5. Create migration
        ↓
6. Update Kysely types
        ↓
7. Implement repository
        ↓
8. Implement service
        ↓
9. Implement route
        ↓
10. Add authentication/authorization
        ↓
11. Add audit logging where necessary
        ↓
12. Add unit tests
        ↓
13. Add integration tests
        ↓
14. Run formatting/lint/typecheck
        ↓
15. Run full test suite
        ↓
16. Review migration and API behavior
        ↓
17. Commit using conventional commits
        ↓
18. CI validation
```

This keeps changes traceable from business requirement to persistence and API behavior.

---

# Production Considerations

This repository is designed to be a strong starting point, but a scaffold should not be interpreted as a complete production deployment strategy.

Before deploying a real application, evaluate at least the following.

## Secrets

Do not use the example JWT secrets.

Use a production secret-management mechanism.

## Database

Review:

- Pool sizing
- Connection limits
- SSL/TLS
- Backups
- Point-in-time recovery
- Replication
- Indexes
- Query performance
- Migration deployment strategy

## Rate limiting

The included rate limiter uses the default in-memory approach.

For horizontally scaled applications, use a shared distributed store where required.

## Authentication

Review:

- Access-token lifetime
- Refresh-token lifetime
- Token revocation requirements
- Password policy
- Account lockout requirements
- Email verification
- Password reset flows
- MFA requirements
- Session/device management

## Authorization

Review the initial RBAC model against the actual application's requirements.

Some applications may need:

- Resource-level authorization
- Organization/tenant-level authorization
- Attribute-based access control
- Ownership checks
- Delegated permissions

## Audit logging

Define which actions are legally, operationally, or security-wise important enough to audit.

Avoid logging:

- Passwords
- Raw refresh tokens
- Access tokens
- Sensitive personal information unnecessarily
- Secrets

## Observability

For production systems, consider adding:

- Metrics
- Distributed tracing
- Centralized log aggregation
- Error tracking
- Alerting
- Database monitoring
- Request latency dashboards

## Deployment

The scaffold intentionally does not prescribe a specific cloud platform.

It can be extended with:

- Docker image builds
- AWS infrastructure
- Kubernetes
- ECS
- EC2
- Serverless/container platforms
- GitHub Actions deployment
- Terraform
- Secrets Manager
- Load balancers
- CDN/WAF layers

---

# Design Principles

## Separation of concerns

HTTP handling, business logic, persistence, and cross-cutting concerns should remain separated.

## Dependency direction

Prefer:

```text
Routes
  ↓
Services
  ↓
Repositories
  ↓
Database
```

rather than allowing routes to directly contain SQL and business rules.

## Explicit over magical

The scaffold favors explicit:

- SQL migrations
- Route registration
- Permission definitions
- Environment configuration
- Service/repository boundaries

This makes the system easier to understand and review.

## Security by default

Security middleware should be present before business functionality is added.

## Type safety

Types should describe:

- API inputs
- Domain values
- Database records
- Authentication state

Runtime validation should complement compile-time TypeScript checks.

## Testability

Services and repositories should remain independently testable.

## Observability

Errors and requests should be traceable through request IDs and structured logs.

## Modularity

Business domains should be independently understandable and maintainable.

---

# What to Customize Before Reuse

When using this repository as a template for a new project, update the following.

### Repository identity

- Repository name
- Package name
- Project description
- README
- License
- Ownership information

### Database

- Database names
- Docker container names
- Migration files
- Database schema
- Database credentials
- Production database configuration

### Authentication

- JWT secrets
- Token expiration policies
- Password policies
- Refresh-token policies
- Authentication requirements

### Authorization

- Roles
- Permissions
- Default role assignments

### Modules

Remove or adapt the example:

```text
users
auth
audit-logs
health
```

and add project-specific domains.

### Environment

Review every variable in:

```text
example.env
```

Do not blindly copy development defaults into production.

### CI

Update:

- Node version policy
- Database versions
- Environment variables
- Deployment stages
- Security scans
- Release workflows

### Documentation

Update the README so it describes the actual application rather than the scaffold.

---

# Why This Architecture?

Many Node.js REST APIs begin with a simple structure:

```text
routes/
controllers/
services/
models/
```

That approach works for small applications, but it can become difficult to maintain as the number of business domains increases.

This scaffold instead emphasizes **business-domain modules** while keeping shared infrastructure separate:

```text
src/
├── modules/       # Business domains
├── database/      # Persistence infrastructure
├── middleware/    # HTTP cross-cutting concerns
├── common/        # Shared utilities
├── config/        # Runtime configuration
└── tests/         # Integration infrastructure
```

This makes it possible to reason about a feature from a single domain boundary while still sharing common infrastructure.

For example:

```text
Authentication
├── auth.routes.ts
├── auth.schemas.ts
├── auth.service.ts
├── token.ts
├── password.ts
├── authz.service.ts
└── rbac.ts
```

The business logic stays together while database infrastructure remains reusable.

---

# Architectural Trade-offs

No architecture is universally correct.

This scaffold intentionally chooses:

### Express instead of a heavier framework

Express provides a minimal HTTP layer and leaves architectural decisions to the application.

### Kysely instead of a full ORM

Kysely provides type-safe query construction while preserving direct SQL concepts and avoiding a large ORM abstraction.

### SQL migrations

Database schema changes remain explicit and database-native.

### PostgreSQL

PostgreSQL provides strong relational modeling, transactions, constraints, indexing, and mature operational tooling.

### Separate audit database

Audit data receives an independent persistence boundary, which can be useful for operational and security requirements.

### Custom RBAC

Authorization stays simple and application-controlled rather than introducing an external authorization engine prematurely.

---

# When Not to Use This Scaffold

Consider a different architecture when:

- You need a highly opinionated framework with built-in dependency injection and module lifecycle management.
- Your workload is primarily event-driven rather than REST-based.
- Your persistence model is not relational.
- You need GraphQL as the primary API contract.
- Your application is intentionally serverless and does not require a long-running Express process.
- Your organization already has a standardized internal platform or service template.
- Your authorization requirements require a dedicated policy engine from day one.

The scaffold is intended to be adaptable, not universal.

---

# API Surface Included by Default

At the time of writing, the scaffold exposes the following primary routes:

```text
GET  /
GET  /health

POST /auth/register
POST /auth/login
POST /auth/refresh
GET  /auth/me

POST /users
GET  /users/:id

GET  /audit-logs
GET  /audit-logs/:id
```

The root endpoint provides basic application status information.

The health endpoint verifies database connectivity.

The remaining endpoints demonstrate authenticated, validated, and permission-aware REST operations.

---

# Example Authentication Request

Register:

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strong-password",
  "firstName": "Jane",
  "lastName": "Doe"
}
```

Login:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "strong-password"
}
```

Authenticated request:

```http
GET /auth/me
Authorization: Bearer <access-token>
```

---

# Example Protected Request

A protected endpoint follows:

```text
Request
  ↓
Bearer token validation
  ↓
Authenticated user
  ↓
Permission check
  ↓
Request validation
  ↓
Service
  ↓
Repository
```

For example:

```http
POST /users
Authorization: Bearer <access-token>
Content-Type: application/json
```

The route requires:

```text
USER_CREATE
```

before the request reaches the user service.

---

# Operational Model

The application is intentionally split between:

```text
src/app.ts
```

and:

```text
src/server.ts
```

`app.ts` creates and configures the Express application.

`server.ts` is responsible for starting the HTTP server and handling process shutdown.

This separation makes the application easier to test because integration tests can import the configured Express application without necessarily starting a real listening server.

Graceful shutdown closes:

1. The HTTP server.
2. The main database pool.
3. The audit database pool.

The application responds to:

```text
SIGTERM
SIGINT
```

This is useful for containerized and orchestrated deployments.

---

# Template Philosophy

The repository is intentionally opinionated about infrastructure but conservative about business logic.

It provides:

```text
Infrastructure
████████████████████████████████
Security
████████████████████████████████
Testing
████████████████████████████████
Database
████████████████████████████████
Observability
████████████████████████████████
Developer tooling
████████████████████████████████
                 ↓
        Your business logic
                 ↓
        Your application
```

The purpose is not to create another framework.

The purpose is to provide a **repeatable engineering baseline**.

---

# Contributing

Contributions are welcome.

When proposing changes, consider whether the change:

- Improves the scaffold's reuse across projects
- Keeps module boundaries clear
- Preserves type safety
- Adds appropriate tests
- Does not introduce unnecessary coupling
- Maintains secure defaults
- Keeps configuration explicit
- Improves developer experience
- Remains understandable to a developer encountering the repository for the first time

For larger architectural changes, open an issue first to discuss the intended design.

---

# License

See the repository license file for the applicable license and usage terms.

---

## Summary

This repository provides a reusable Node.js REST API foundation with:

- **TypeScript**
- **Express**
- **PostgreSQL**
- **Kysely**
- **dbmate**
- **JWT authentication**
- **Refresh-token rotation**
- **RBAC authorization**
- **Zod validation**
- **Helmet**
- **CORS**
- **Rate limiting**
- **Pino structured logging**
- **Request correlation IDs**
- **Dedicated audit logging**
- **Unit and integration testing**
- **Vitest coverage**
- **ESLint**
- **Prettier**
- **Husky**
- **Commitlint**
- **Docker Compose**
- **GitHub Actions CI**

The architecture is designed to let a new project begin with a solid backend foundation while leaving the business domain, deployment platform, and infrastructure strategy open for project-specific decisions.
