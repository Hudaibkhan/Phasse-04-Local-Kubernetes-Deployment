# Changelog

All notable changes to the Evolution Todo Helm chart will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-02-16

### Added
- Full-stack deployment support for Evolution Todo application
- Backend deployment with FastAPI application
  - ClusterIP service on port 8001
  - Health checks (liveness and readiness probes)
  - Environment variables from Kubernetes secrets
  - Resource limits (100m/256Mi requests, 500m/512Mi limits)
  - Non-root security context (UID 1001)
- Frontend deployment with Next.js application
  - NodePort service on port 3000
  - Health checks (liveness and readiness probes)
  - Environment variables from ConfigMap
  - Resource limits (100m/256Mi requests, 500m/512Mi limits)
  - Non-root security context (UID 1001)
- ConfigMap for non-sensitive configuration (CORS_ORIGINS, NEXT_PUBLIC_API_URL)
- Kubernetes Secrets support for sensitive data (DATABASE_URL, JWT_SECRET, GEMINI_API_KEY)
- Deployment verification script (verify-deployment.sh)
- Comprehensive README.md with usage instructions
- Performance metrics documentation (DEPLOYMENT_METRICS.md)
- Chart metadata (keywords, maintainers)
- Rolling update strategy for zero-downtime deployments

### Changed
- Updated Chart.yaml version from 0.1.0 to 0.2.0
- Updated appVersion from 1.16.0 to 1.0.0
- Updated chart description to reflect Minikube deployment focus
- Completely rewrote values.yaml with backend/frontend structure
- Rewrote NOTES.txt with instructions for accessing services

### Removed
- Old template files (deployment.yaml, service.yaml, hpa.yaml, ingress.yaml, httproute.yaml)
- Test templates directory (tests/)

### Fixed
- Nil pointer errors in old templates
- Service port references in NOTES.txt

## [0.1.0] - Initial Release

### Added
- Initial Helm chart structure
- Basic templates (_helpers.tpl, serviceaccount.yaml)
- Default values.yaml
- .helmignore file
- Chart.yaml with basic metadata
