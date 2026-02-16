# Architecture Overview

## Status
📝 **Draft** - Phase II Architecture Specification

## System Architecture

Evolution Todo follows a modern full-stack architecture with clear separation of concerns between frontend presentation, backend business logic, and database persistence layers.

## Technology Stack

### Frontend
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS (to be specified)
- **State Management**: React hooks + Context (to be specified)

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLModel
- **API Style**: RESTful

### Database
- **Provider**: Neon (PostgreSQL)
- **ORM**: SQLModel
- **Migrations**: Alembic (to be specified)

### Authentication
- **Solution**: Better-Auth
- **Token Type**: JWT
- **Storage**: HTTP-only cookies (to be specified)

## Application Boundaries

### Frontend Responsibilities
- User interface rendering
- Client-side validation
- State management
- API consumption
- Route handling

### Backend Responsibilities
- Business logic
- Data validation
- Database operations
- Authentication/Authorization
- API endpoints

## Communication

- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **API Style**: RESTful
- **CORS**: Configured for local development and production

## Development Principles

1. **Spec-Driven**: All features begin with specifications
2. **API-First**: Backend contracts defined before implementation
3. **Type Safety**: TypeScript frontend, Pydantic backend
4. **Testability**: Clear boundaries enable isolated testing
5. **Incremental**: Small, testable changes

## Deployment (To Be Specified)

- Frontend deployment: TBD
- Backend deployment: TBD
- Database: Neon PostgreSQL (cloud)

## Security Considerations

- JWT-based authentication
- Environment-based configuration
- No hardcoded secrets
- Input validation at boundaries
- CORS configuration

## Data Flow

### User Registration Flow
1. User submits registration form (frontend)
2. Frontend validates input and sends POST `/api/auth/register`
3. Backend validates data, hashes password, creates user record
4. Database stores user with hashed password
5. Backend returns success response
6. Frontend redirects to login page

### Authentication Flow
1. User submits login credentials (frontend)
2. Frontend sends POST `/api/auth/login`
3. Backend validates credentials against database
4. Backend generates JWT token on success
5. Backend sets HTTP-only cookie with token
6. Frontend redirects to dashboard
7. Subsequent requests include cookie automatically

### Task Operations Flow
1. User interacts with task UI (frontend)
2. Frontend sends authenticated API request
3. Backend validates JWT token from cookie
4. Backend checks user ownership of resource
5. Backend performs database operation
6. Database returns result
7. Backend formats and returns response
8. Frontend updates UI

## Scalability Considerations

### Current Design (Phase II)
- Stateless backend enables horizontal scaling
- Database connection pooling for efficient resource usage
- JWT tokens eliminate server-side session storage
- RESTful API enables CDN caching for static assets

### Future Enhancements (Phase III+)
- Redis caching layer for frequently accessed data
- Database read replicas for query distribution
- Rate limiting per user/IP
- WebSocket support for real-time updates
- Background job processing with Celery

## Security Architecture

### Defense in Depth
1. **Frontend**: Input validation, HTTPS enforcement, CSP headers
2. **Backend**: Authentication, authorization, input sanitization, rate limiting
3. **Database**: Parameterized queries, user isolation, encrypted at rest
4. **Network**: CORS configuration, HTTPS only, security headers

### Authentication Security
- Passwords hashed with bcrypt/argon2 (configurable)
- JWT tokens signed with secret key
- HTTP-only cookies prevent XSS attacks
- Short token expiration (configurable, default 24 hours)
- Secure cookie flags in production

### Authorization Model
- Row-level security: All queries filtered by user_id
- API endpoints validate token AND resource ownership
- No shared data between users in Phase II
- Future: Role-based access control (RBAC) in Phase III

## Error Handling Strategy

### Frontend Error Handling
- Network errors: Display retry option
- Validation errors: Inline field messages
- Auth errors: Redirect to login
- Server errors: Generic error page with support contact

### Backend Error Handling
- Validation errors: 422 with field-specific messages
- Authentication errors: 401 Unauthorized
- Authorization errors: 403 Forbidden
- Not found errors: 404 with safe message
- Server errors: 500 with logged details (no exposure to client)

### Database Error Handling
- Connection failures: Retry with exponential backoff
- Constraint violations: Convert to user-friendly messages
- Transaction rollback on errors
- Detailed logging for debugging

## Performance Targets

### Response Time Goals
- API endpoints: < 200ms p95 latency
- Page loads: < 2 seconds first contentful paint
- Task list rendering: < 100ms for 50 tasks
- Database queries: < 50ms for single-user operations

### Concurrency Goals
- Support 100+ concurrent users in Phase II
- 1000+ requests per minute sustained load
- Graceful degradation under high load

## Monitoring and Observability (Phase III)

### Metrics to Track
- API response times per endpoint
- Error rates by type and endpoint
- Active user sessions
- Database connection pool utilization
- Task creation/completion rates

### Logging Strategy
- Structured JSON logs
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Request ID tracing across services
- No PII in logs
- Centralized log aggregation

## Future Considerations (Phase III+)

- Caching strategy with Redis
- Real-time updates via WebSockets
- File uploads for task attachments
- Email notifications for task reminders
- Monitoring and observability with Prometheus/Grafana
- CI/CD pipeline automation
- Blue-green deployment strategy

## Notes

This architecture is designed for Phase II (specification and initial implementation) with clear paths for Phase III enhancements. All architectural decisions prioritize simplicity, security, and user data isolation per the project constitution.
