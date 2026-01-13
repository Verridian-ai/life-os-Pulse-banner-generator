# Security Auditor Agent - Usage Guide

The Security Auditor Agent is a READ-ONLY security analysis tool that scans your codebase for vulnerabilities, misconfigurations, and security best practice violations.

## Quick Start

### Full Security Audit
```
"Run a full security audit"
```

Executes all security checks:
- Secrets detection
- Dependency vulnerabilities
- Code pattern analysis (XSS, SQLi, CSRF)
- RLS policy verification
- Authentication review
- Input validation coverage
- HTTP security headers

**Cost**: ~$0.96 | **Time**: 3-5 minutes

---

## Targeted Scans

### 1. Secrets Detection (CRITICAL)
```
"Check if we committed any API keys"
"Scan for hardcoded secrets"
"Find exposed tokens"
```

**What it checks**:
- AWS keys (AKIA...)
- Google API keys (AIza...)
- Stripe keys (sk_live_, pk_live_)
- Replicate keys (r8_...)
- Hardcoded passwords
- Private keys
- Bearer tokens

**Cost**: ~$0.15 | **Time**: 30 seconds

---

### 2. Dependency Vulnerabilities
```
"Check for vulnerable dependencies"
"Run npm audit"
"Find dependency CVEs"
```

**What it checks**:
- Known CVEs in npm packages
- Outdated critical dependencies
- Supply chain risks

**Cost**: ~$0.10 | **Time**: 20 seconds

---

### 3. RLS Policy Audit (Supabase/Neon)
```
"Audit our RLS policies"
"Check database security"
"Review Supabase permissions"
```

**What it checks**:
- RLS enabled on all tables
- Policies use `auth.uid()` correctly
- No overly permissive policies
- All CRUD operations have policies
- Service role usage justified

**Cost**: ~$0.20 | **Time**: 1 minute

---

### 4. Authentication Security Review
```
"Review authentication security"
"Check auth flows"
"Audit JWT implementation"
```

**What it checks**:
- JWT token validation
- Token storage (httpOnly cookies vs localStorage)
- Session timeout implementation
- Password reset security
- MFA availability
- OAuth flow security

**Cost**: ~$0.25 | **Time**: 1-2 minutes

---

### 5. API Security Scan
```
"Check API security"
"Review API endpoints"
"Audit CORS configuration"
```

**What it checks**:
- CORS configuration
- Rate limiting
- API key exposure
- Sensitive data in responses
- HTTP security headers

**Cost**: ~$0.20 | **Time**: 1 minute

---

### 6. Injection Vulnerability Scan
```
"Check for SQL injection risks"
"Find XSS vulnerabilities"
"Scan for injection attacks"
```

**What it checks**:
- SQL injection patterns
- XSS (dangerouslySetInnerHTML, innerHTML)
- Command injection
- Path traversal
- CSRF protection

**Cost**: ~$0.30 | **Time**: 1-2 minutes

---

## Understanding Severity Levels

### CRITICAL (Immediate Action Required)
- Hardcoded secrets in committed code
- SQL injection vulnerabilities
- Missing authentication on sensitive endpoints
- RLS disabled on user data tables
- Active CVE exploits

**Action**: Fix within 24 hours

---

### HIGH (Before Next Release)
- XSS vulnerabilities
- CSRF missing on state-changing endpoints
- Overly permissive RLS policies
- Passwords logged
- High severity CVEs

**Action**: Fix within 1 week

---

### MEDIUM (Within Sprint)
- Missing rate limiting
- Weak CORS configuration
- Missing CSP headers
- Insufficient input validation
- Medium severity CVEs

**Action**: Fix within 2 weeks

---

### LOW (Backlog)
- Missing security headers
- Outdated dependencies (no CVEs)
- Excessive logging (non-sensitive)
- Missing cookie flags

**Action**: Fix when convenient

---

## Sample Output

```markdown
## Security Audit Report
**Date**: 2026-01-13
**Scope**: Full Codebase

**Total Issues**: 7
- CRITICAL: 1
- HIGH: 2
- MEDIUM: 3
- LOW: 1

### CRITICAL Findings

#### C-001: Hardcoded API Key
**File**: `src/services/replicate.ts:15`
**Issue**: Replicate API key hardcoded
**Impact**: API key exposure, unauthorized usage
**Remediation**: Move to env var, rotate key immediately
**OWASP**: A02:2021 – Cryptographic Failures

### HIGH Findings

#### H-001: SQL Injection Vulnerability
**File**: `server/src/routes/users.ts:42`
**Issue**: User input concatenated into SQL
**Impact**: Database compromise
**Remediation**: Use parameterized queries
**OWASP**: A03:2021 – Injection

[... more findings ...]
```

---

## Integration Examples

### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Running security scan..."

# Quick secrets check (fast)
claude "Scan staged files for secrets" --skill security-agent

if [ $? -ne 0 ]; then
  echo "❌ Security check failed. Commit blocked."
  exit 1
fi

echo "✅ Security check passed"
```

### CI/CD Pipeline (GitHub Actions)
```yaml
name: Security Audit

on: [pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Security Audit
        run: |
          claude "Run a full security audit" --skill security-agent
          # Parse output, fail if CRITICAL issues found
```

---

## Scope Options

### Full Codebase (Default)
```
"Run a full security audit"
```
Scans everything: frontend, backend, database, config

### Backend Only
```
"Audit backend security"
"Check server/ for vulnerabilities"
```
Focuses on server-side code, APIs, database

### Frontend Only
```
"Audit frontend security"
"Check src/ for XSS vulnerabilities"
```
Focuses on client-side code, input validation

### Database Only
```
"Audit database security"
"Review RLS policies and queries"
```
Focuses on Supabase/Neon schema, policies, queries

---

## OWASP Top 10 Coverage

The agent maps all findings to OWASP Top 10 2021:

- **A01** – Broken Access Control
- **A02** – Cryptographic Failures
- **A03** – Injection
- **A04** – Insecure Design
- **A05** – Security Misconfiguration
- **A06** – Vulnerable Components
- **A07** – Auth Failures
- **A08** – Integrity Failures
- **A09** – Logging Failures
- **A10** – SSRF

See `OWASP_CHECKLIST.md` for detailed criteria.

---

## Best Practices

### When to Run Audits

1. **Before major releases** - Full audit
2. **On PR creation** - Full audit or targeted scan
3. **Weekly scheduled** - Dependency vulnerabilities
4. **After adding auth/payment features** - Targeted auth/API scan
5. **When onboarding new devs** - Educational full audit

### Cost Management

- **Full audits**: Reserve for critical milestones (~$1/audit)
- **Targeted scans**: Use for specific concerns (~$0.10-0.30)
- **Secrets detection**: Run frequently, very cheap (~$0.15)

### Acting on Findings

1. **CRITICAL**: Drop everything, fix immediately
2. **HIGH**: Add to current sprint, fix before release
3. **MEDIUM**: Add to backlog, prioritize in next sprint
4. **LOW**: Document, fix when convenient

---

## Limitations

### What This Agent DOES
✅ Identifies vulnerabilities
✅ Provides remediation guidance
✅ Maps to OWASP Top 10
✅ Severity classification
✅ Code examples of issues

### What This Agent DOES NOT
❌ Automatically fix issues (READ-ONLY)
❌ Deploy patches
❌ Penetration testing (actual attacks)
❌ Runtime vulnerability detection
❌ Third-party service audits

---

## Common Issues

### False Positives

**Issue**: Test files flagged for hardcoded credentials
**Solution**: Acceptable for test fixtures, document in audit report

**Issue**: `dangerouslySetInnerHTML` flagged
**Solution**: If sanitized (DOMPurify), note in report as safe

### Dependency Audit Noise

**Issue**: Too many low-severity CVEs
**Solution**: Focus on CRITICAL/HIGH, defer LOW to monthly review

---

## Getting Help

**For questions about findings**:
```
"Explain finding C-001 in detail"
"How do I fix SQL injection in users.ts?"
```

**For custom scans**:
```
"Check only the payment processing code for security issues"
"Audit the new feature branch for vulnerabilities"
```

---

## Next Steps

After receiving an audit report:

1. **Triage**: Review CRITICAL/HIGH findings with team
2. **Plan**: Create tasks for fixes in project management tool
3. **Fix**: Address issues in priority order
4. **Verify**: Re-run targeted scan after fixes
5. **Document**: Note any accepted risks (with justification)

---

*Last Updated: 2026-01-13*
*Version: 1.0.0*
