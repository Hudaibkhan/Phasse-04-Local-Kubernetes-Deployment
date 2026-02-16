#!/bin/bash
# Deployment Verification Script for Evolution Todo on Minikube
# This script verifies that the Helm deployment is successful and all components are healthy

set -e

RELEASE_NAME="todo-app"
NAMESPACE="default"
TIMEOUT=300  # 5 minutes timeout

echo "=========================================="
echo "Evolution Todo Deployment Verification"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check Helm release status
echo "1. Checking Helm release status..."
if helm status "$RELEASE_NAME" -n "$NAMESPACE" &>/dev/null; then
    RELEASE_STATUS=$(helm status "$RELEASE_NAME" -n "$NAMESPACE" | grep "STATUS:" | awk '{print $2}')
    if [ "$RELEASE_STATUS" = "deployed" ]; then
        success "Helm release '$RELEASE_NAME' is deployed"
    else
        error "Helm release status: $RELEASE_STATUS"
        exit 1
    fi
else
    error "Helm release '$RELEASE_NAME' not found"
    exit 1
fi
echo ""

# 2. Check if pods are running
echo "2. Checking pod status..."
BACKEND_POD=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
FRONTEND_POD=$(kubectl get pods -n "$NAMESPACE" -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$BACKEND_POD" ]; then
    error "Backend pod not found"
    exit 1
fi

if [ -z "$FRONTEND_POD" ]; then
    error "Frontend pod not found"
    exit 1
fi

# Wait for pods to be ready
echo "   Waiting for pods to be ready (timeout: ${TIMEOUT}s)..."
kubectl wait --for=condition=ready pod/"$BACKEND_POD" -n "$NAMESPACE" --timeout="${TIMEOUT}s" &>/dev/null
if [ $? -eq 0 ]; then
    success "Backend pod '$BACKEND_POD' is ready"
else
    error "Backend pod failed to become ready"
    kubectl describe pod "$BACKEND_POD" -n "$NAMESPACE"
    exit 1
fi

kubectl wait --for=condition=ready pod/"$FRONTEND_POD" -n "$NAMESPACE" --timeout="${TIMEOUT}s" &>/dev/null
if [ $? -eq 0 ]; then
    success "Frontend pod '$FRONTEND_POD' is ready"
else
    error "Frontend pod failed to become ready"
    kubectl describe pod "$FRONTEND_POD" -n "$NAMESPACE"
    exit 1
fi
echo ""

# 3. Check services
echo "3. Checking services..."
BACKEND_SERVICE=$(kubectl get svc -n "$NAMESPACE" -l app.kubernetes.io/name=backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
FRONTEND_SERVICE=$(kubectl get svc -n "$NAMESPACE" -l app.kubernetes.io/name=frontend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -z "$BACKEND_SERVICE" ]; then
    error "Backend service not found"
    exit 1
else
    success "Backend service '$BACKEND_SERVICE' exists"
fi

if [ -z "$FRONTEND_SERVICE" ]; then
    error "Frontend service not found"
    exit 1
else
    success "Frontend service '$FRONTEND_SERVICE' exists"
fi
echo ""

# 4. Check service endpoints
echo "4. Checking service endpoints..."
BACKEND_ENDPOINTS=$(kubectl get endpoints "$BACKEND_SERVICE" -n "$NAMESPACE" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null || echo "")
FRONTEND_ENDPOINTS=$(kubectl get endpoints "$FRONTEND_SERVICE" -n "$NAMESPACE" -o jsonpath='{.subsets[*].addresses[*].ip}' 2>/dev/null || echo "")

if [ -z "$BACKEND_ENDPOINTS" ]; then
    error "Backend service has no endpoints"
    exit 1
else
    success "Backend service has endpoints: $BACKEND_ENDPOINTS"
fi

if [ -z "$FRONTEND_ENDPOINTS" ]; then
    error "Frontend service has no endpoints"
    exit 1
else
    success "Frontend service has endpoints: $FRONTEND_ENDPOINTS"
fi
echo ""

# 5. Check ConfigMap and Secrets
echo "5. Checking ConfigMap and Secrets..."
if kubectl get configmap "${RELEASE_NAME}-config" -n "$NAMESPACE" &>/dev/null; then
    success "ConfigMap '${RELEASE_NAME}-config' exists"
else
    error "ConfigMap '${RELEASE_NAME}-config' not found"
    exit 1
fi

if kubectl get secret "${RELEASE_NAME}-secrets" -n "$NAMESPACE" &>/dev/null; then
    success "Secret '${RELEASE_NAME}-secrets' exists"
else
    error "Secret '${RELEASE_NAME}-secrets' not found"
    exit 1
fi
echo ""

# 6. Test backend health endpoint
echo "6. Testing backend health endpoint..."
BACKEND_PORT=$(kubectl get svc "$BACKEND_SERVICE" -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].port}')
kubectl port-forward -n "$NAMESPACE" "svc/$BACKEND_SERVICE" 8001:$BACKEND_PORT &>/dev/null &
PORT_FORWARD_PID=$!
sleep 3

HEALTH_RESPONSE=$(curl -s http://localhost:8001/api/health || echo "")
kill $PORT_FORWARD_PID 2>/dev/null || true

if echo "$HEALTH_RESPONSE" | grep -q "healthy"; then
    success "Backend health check passed: $HEALTH_RESPONSE"
else
    error "Backend health check failed"
    exit 1
fi
echo ""

# 7. Check resource limits
echo "7. Checking resource limits..."
BACKEND_LIMITS=$(kubectl get pod "$BACKEND_POD" -n "$NAMESPACE" -o jsonpath='{.spec.containers[0].resources.limits}')
FRONTEND_LIMITS=$(kubectl get pod "$FRONTEND_POD" -n "$NAMESPACE" -o jsonpath='{.spec.containers[0].resources.limits}')

if echo "$BACKEND_LIMITS" | grep -q "cpu"; then
    success "Backend pod has resource limits configured"
else
    warning "Backend pod has no resource limits"
fi

if echo "$FRONTEND_LIMITS" | grep -q "cpu"; then
    success "Frontend pod has resource limits configured"
else
    warning "Frontend pod has no resource limits"
fi
echo ""

# 8. Summary
echo "=========================================="
echo "Deployment Verification Summary"
echo "=========================================="
success "All verification checks passed!"
echo ""
echo "Backend Service:"
echo "  Pod: $BACKEND_POD"
echo "  Service: $BACKEND_SERVICE"
echo "  Port: $BACKEND_PORT"
echo ""
echo "Frontend Service:"
echo "  Pod: $FRONTEND_POD"
echo "  Service: $FRONTEND_SERVICE"
echo ""
echo "To access the frontend:"
echo "  minikube service $FRONTEND_SERVICE --url"
echo ""
echo "To access the backend API:"
echo "  kubectl port-forward svc/$BACKEND_SERVICE $BACKEND_PORT:$BACKEND_PORT"
echo "  Then visit: http://localhost:$BACKEND_PORT/api/health"
echo ""
