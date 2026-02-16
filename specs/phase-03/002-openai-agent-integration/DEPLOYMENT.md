# Deployment Checklist: OpenAI Agents SDK Integration

**Feature**: 002-openai-agent-integration
**Date**: 2026-02-09
**Status**: Production Readiness Checklist

## Pre-Deployment Requirements

### 1. Environment Configuration

- [ ] **OpenAI API Key Setup**
  - Obtain production OpenAI API key from OpenAI dashboard
  - Set `OPENAI_API_KEY` environment variable in production environment
  - Verify key has sufficient quota for expected usage
  - Never commit API key to version control
  - Use secrets management system (AWS Secrets Manager, Azure Key Vault, etc.)

- [ ] **Environment Variables**
  ```bash
  OPENAI_API_KEY=sk-proj-...  # Production key
  DATABASE_URL=postgresql://...  # Production database
  CORS_ORIGINS=https://yourdomain.com  # Production frontend URL
  JWT_SECRET=...  # Production JWT secret
  ```

### 2. OpenAI API Quota & Monitoring

- [ ] **Quota Planning**
  - Estimate daily/monthly request volume
  - Calculate expected token usage (input + output)
  - Set up billing alerts in OpenAI dashboard
  - Configure usage limits to prevent unexpected charges
  - Recommended: Start with $100/month limit, adjust based on usage

- [ ] **Rate Limits**
  - Verify rate limiting is enabled (10 requests/minute per IP)
  - Test rate limit behavior under load
  - Configure appropriate error messages for rate-limited users

### 3. Error Monitoring & Alerting

- [ ] **Logging Configuration**
  - Verify all agent operations are logged with appropriate levels
  - Configure log aggregation (CloudWatch, Datadog, etc.)
  - Set up log retention policy (30-90 days recommended)

- [ ] **Error Alerting**
  - Set up alerts for:
    - OpenAI API failures (rate limits, timeouts)
    - Agent processing errors (>5% error rate)
    - High latency (>10s response time)
    - Thread cleanup failures
  - Configure notification channels (email, Slack, PagerDuty)

- [ ] **Metrics Tracking**
  - Track key metrics:
    - Requests per minute/hour/day
    - Average response time
    - Error rate by error type
    - Tool invocation counts
    - Token usage per request
  - Set up dashboards for real-time monitoring

### 4. Security Review

- [ ] **API Key Security**
  - Verify OPENAI_API_KEY not exposed in logs
  - Verify OPENAI_API_KEY not exposed in error messages
  - Verify OPENAI_API_KEY not returned in API responses
  - Test with invalid API key to ensure graceful failure

- [ ] **User Isolation**
  - Verify user_id injection in all MCP tool calls
  - Test that User A cannot access User B's tasks via agent
  - Verify JWT authentication required for /api/chat endpoint
  - Test with expired/invalid JWT tokens

- [ ] **Input Validation**
  - Verify message length limits enforced (max 2000 chars)
  - Test with malicious input (SQL injection attempts, XSS)
  - Verify empty/null message handling
  - Test with special characters and Unicode

### 5. Performance Optimization

- [ ] **Assistant Caching**
  - Verify assistant created once and reused (check logs)
  - Test assistant persistence across multiple requests
  - Monitor assistant creation API calls (should be 1 per deployment)

- [ ] **Thread Cleanup**
  - Verify threads deleted after successful completion
  - Verify threads deleted after errors/timeouts
  - Monitor OpenAI storage usage (should remain low)
  - Test thread cleanup under various failure scenarios

- [ ] **Response Time**
  - Test average response time <5 seconds for single-step operations
  - Test multi-step operations complete within timeout (30s)
  - Load test with concurrent users (10-50 simultaneous requests)

### 6. Regression Testing

- [ ] **Existing Features**
  - Run full regression test suite: `pytest test_regression.py`
  - Verify all 5 tests pass (auth, task CRUD, recurring tasks, notifications, schema)
  - Test manual task creation via REST API still works
  - Test authentication flow unchanged

- [ ] **MCP Tools**
  - Run MCP tools test: `pytest test_mcp_tools.py`
  - Verify all 5 MCP tools work correctly
  - Test each tool independently via agent

### 7. Integration Testing

- [ ] **Agent Functionality**
  - Test all 5 basic operations:
    - "Add a task to buy groceries" → add_task
    - "Show my pending tasks" → list_tasks
    - "Mark task [id] as done" → complete_task
    - "Update task [id] title to [new title]" → update_task
    - "Delete task [id]" → delete_task

- [ ] **Multi-Step Operations**
  - Test: "Delete the meeting task" (list → delete)
  - Test: "Rename the grocery task to shopping" (list → update)
  - Test with multiple matching tasks (should ask for clarification)

- [ ] **Error Handling**
  - Test with non-existent task ID
  - Test with ambiguous commands ("Do the thing")
  - Test with incomplete commands ("Add a task")
  - Test with malformed input
  - Verify user-friendly error messages (no technical details exposed)

### 8. Documentation

- [ ] **API Documentation**
  - Update OpenAPI/Swagger docs with POST /api/chat endpoint
  - Document request/response schemas
  - Document rate limits
  - Document error codes and messages

- [ ] **User Documentation**
  - Create user guide for natural language commands
  - Provide example commands
  - Document limitations (3-step max, 30s timeout)

### 9. Deployment Steps

1. **Pre-Deployment**
   ```bash
   # Run all tests
   cd Quantum-Todo-Backend
   pytest test_regression.py test_mcp_tools.py -v

   # Verify no uncommitted changes
   git status
   ```

2. **Deploy to Staging**
   - Deploy code to staging environment
   - Set production-like OPENAI_API_KEY (with low quota)
   - Run smoke tests
   - Monitor for 24 hours

3. **Deploy to Production**
   - Deploy code to production
   - Set production OPENAI_API_KEY
   - Monitor error rates and response times
   - Have rollback plan ready

4. **Post-Deployment**
   - Monitor for first 1 hour (critical)
   - Check error logs
   - Verify metrics dashboard
   - Test with real users

### 10. Rollback Plan

- [ ] **Rollback Triggers**
  - Error rate >10%
  - Response time >15s average
  - OpenAI API quota exceeded
  - Critical security issue discovered

- [ ] **Rollback Steps**
  1. Revert to previous deployment
  2. Verify existing features still work
  3. Notify users of temporary unavailability
  4. Investigate root cause
  5. Fix and redeploy

### 11. Cost Management

- [ ] **Token Usage Optimization**
  - Monitor average tokens per request
  - Optimize agent instructions if needed
  - Consider caching common responses (future enhancement)

- [ ] **Budget Alerts**
  - Set up billing alerts at 50%, 75%, 90% of budget
  - Configure hard limit to prevent runaway costs
  - Review usage weekly for first month

### 12. Maintenance

- [ ] **Regular Reviews**
  - Weekly: Review error logs and metrics
  - Monthly: Review token usage and costs
  - Quarterly: Review and update agent instructions
  - Annually: Review OpenAI SDK version and upgrade if needed

- [ ] **Dependency Updates**
  - Monitor OpenAI SDK releases
  - Test updates in staging before production
  - Keep MCP SDK up to date

## Success Criteria

Deployment is successful when:

- ✅ All tests pass (regression + MCP tools)
- ✅ Error rate <5% for first 24 hours
- ✅ Average response time <5 seconds
- ✅ No security issues detected
- ✅ Token usage within budget
- ✅ Zero regression in existing features
- ✅ User feedback positive

## Emergency Contacts

- **OpenAI Support**: https://help.openai.com/
- **On-Call Engineer**: [Your contact info]
- **DevOps Team**: [Team contact info]

## Additional Resources

- OpenAI API Status: https://status.openai.com/
- OpenAI Usage Dashboard: https://platform.openai.com/usage
- OpenAI Rate Limits: https://platform.openai.com/docs/guides/rate-limits
- OpenAI Best Practices: https://platform.openai.com/docs/guides/production-best-practices
