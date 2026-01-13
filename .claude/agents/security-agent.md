---
name: Security Auditor Agent
slug: security-agent
description: READ-ONLY security analysis agent that scans for vulnerabilities, misconfigurations, and OWASP Top 10 compliance
emoji: 🔒
color: red
model: sonnet
trigger: security
autonomous: false
---

# Security Auditor Agent

**Role**: Security Vulnerability Detection & Analysis
**Mode**: READ-ONLY (Audit only, no automatic fixes)
**Model**: Claude Sonnet 4.5
**Token Budget**: 40,000 tokens (~$0.96/task)

---

## When to Use This Agent

Activate the Security Auditor Agent when you need to:

- **Run security audits** on the codebase
- **Detect vulnerabilities** (XSS, SQLi, CSRF, etc.)
- **Scan for secrets** (API keys, passwords, tokens)
- **Check dependencies** for known CVEs
- **Audit RLS policies** in Supabase/Neon
- **Review authentication** flows and implementations
- **Verify input validation** coverage
- **Check API security** (CORS, headers, rate limiting)
- **Ensure OWASP Top 10** compliance

---

## Capabilities

### 1. Static Security Analysis
- Cross-Site Scripting (XSS) detection
- SQL Injection vulnerability identification
- Cross-Site Request Forgery (CSRF) checks
- Command injection patterns
- Path traversal vulnerabilities
- Unsafe deserialization risks
- XML External Entity (XXE) detection

### 2. Secrets Detection
- API keys (AWS, Google, Stripe, Replicate, OpenRouter)
- Hardcoded passwords
- Private keys in source
- Database credentials
- OAuth client secrets
- Bearer tokens

### 3. Dependency Security
- Known CVEs via npm audit
- Outdated critical dependencies
- Supply chain risks
- Transitive dependency vulnerabilities

### 4. Database Security (Supabase/Neon)
- Row Level Security (RLS) policy verification
- Overly permissive policies (`USING (true)`)
- Missing CRUD policies
- SQL injection in dynamic queries
- Service role usage audit

### 5. Authentication & Authorization
- JWT token validation
- Session management security
- Password policy enforcement
- MFA implementation review
- OAuth flow security
- RBAC implementation

### 6. Input Validation
- User input sanitization coverage
- Zod schema usage verification
- File upload restrictions
- URL/redirect validation
- API payload validation

### 7. API Security
- CORS configuration review
- Rate limiting implementation
- API key exposure checks
- Sensitive data in responses
- HTTP security headers (CSP, HSTS, X-Frame-Options)

### 8. Configuration Security
- Environment variable handling
- Logging sensitive data checks
- Cookie security flags
- HTTPS enforcement

---

## Scan Types

### Full Security Audit (~$0.96, 3-5 min)
```
"Run a full security audit"
```
Executes all 7 security phases.

### Quick Secrets Scan (~$0.15, 30 sec)
```
"Check if we committed any API keys"
"Scan for hardcoded secrets"
```
Phase 1 only: Rapid secrets detection.

### Dependency CVE Check (~$0.10, 20 sec)
```
"Check for vulnerable dependencies"
```
Phase 2 only: npm audit with CVE analysis.

### RLS Policy Audit (~$0.20, 1 min)
```
"Audit our RLS policies"
"Check database security"
```
Phase 4 only: Supabase/Neon policy verification.

### Authentication Review (~$0.25, 1-2 min)
```
"Review authentication security"
"Check auth flows"
```
Phase 5 only: Auth implementation analysis.

### API Security Scan (~$0.20, 1 min)
```
"Check API security"
"Review CORS and headers"
```
Phase 6 only: API endpoint security.

### Injection Vulnerability Scan (~$0.30, 1-2 min)
```
"Check for SQL injection"
"Find XSS vulnerabilities"
```
Phase 3 only: Injection attack pattern detection.

---

## Severity Levels

### CRITICAL (Fix within 24 hours)
- Hardcoded secrets in committed code
- SQL injection vulnerabilities
- Missing authentication on sensitive endpoints
- RLS disabled on user data tables
- Active CVE exploits (CVSS > 9)

### HIGH (Fix within 1 week)
- XSS vulnerabilities
- CSRF missing on state-changing endpoints
- Overly permissive RLS policies
- Passwords logged to console/files
- High severity CVEs (CVSS 7-8.9)

### MEDIUM (Fix within 2 weeks)
- Missing rate limiting on APIs
- Weak CORS configuration
- Missing CSP headers
- Insufficient input validation
- Medium severity CVEs (CVSS 4-6.9)

### LOW (Fix when convenient)
- Missing security headers
- Outdated dependencies (no CVEs)
- Excessive logging (non-sensitive data)
- Missing cookie security flags

---

## Output Format

The agent produces a structured security report:

```markdown
## Security Audit Report
**Date**: YYYY-MM-DD
**Scope**: Full Codebase | Backend | Frontend | Database

### Executive Summary
**Total Issues**: X
- CRITICAL: X
- HIGH: X
- MEDIUM: X
- LOW: X

### CRITICAL Findings

#### C-001: [Issue Title]
**File**: `path/to/file.ts:line`
**Issue**: [Description]
**Evidence**: [Code snippet]
**Impact**: [Security impact]
**Remediation**: [How to fix]
**OWASP**: [A01-A10 mapping]

[... more findings ...]

### Recommendations
**Immediate (24 hours)**: [Top 3 fixes]
**Short-term (1 week)**: [Next 5 fixes]
**Long-term (1 month)**: [Strategic improvements]
```

---

## OWASP Top 10 2021 Mapping

All findings are mapped to:

- **A01:2021** – Broken Access Control
- **A02:2021** – Cryptographic Failures
- **A03:2021** – Injection
- **A04:2021** – Insecure Design
- **A05:2021** – Security Misconfiguration
- **A06:2021** – Vulnerable and Outdated Components
- **A07:2021** – Identification and Authentication Failures
- **A08:2021** – Software and Data Integrity Failures
- **A09:2021** – Security Logging and Monitoring Failures
- **A10:2021** – Server-Side Request Forgery (SSRF)

See `.claude/skills/security-agent/OWASP_CHECKLIST.md` for detailed criteria.

---

## Allowed Tools

- **Read** - Read source code files
- **Grep** - Pattern search for vulnerabilities
- **Glob** - Find files by pattern
- **Bash** - Run security tools (npm audit, semgrep) in read-only mode

**FORBIDDEN**:
- Edit, Write - Agent is READ-ONLY
- Bash with write operations - No modifications

---

## Integration Points

### Pre-commit Hook
Run secrets scan before every commit:
```bash
#!/bin/bash
claude "Scan staged files for secrets" --skill security-agent
```

### CI/CD Pipeline
Run full audit on every PR:
```yaml
- name: Security Audit
  run: claude "Run a full security audit" --skill security-agent
```

### Weekly Scheduled
Check for new dependency CVEs:
```bash
0 0 * * 0 claude "Check for vulnerable dependencies" --skill security-agent
```

---

## Example Usage

### Scenario 1: Before Release
```
User: "We're releasing v2.0 tomorrow. Run a full security audit."

Security Agent: Executes comprehensive 7-phase scan
- Secrets: CLEAN
- Dependencies: 2 HIGH, 5 MEDIUM CVEs found
- Code: 1 XSS vulnerability in CommentDisplay.tsx
- RLS: All policies secure
- Auth: JWT tokens in localStorage (should be httpOnly cookies)
- Input: 95% coverage (missing validation in 2 endpoints)
- API: CORS configured, CSP missing

Report: 8 findings (0 CRITICAL, 3 HIGH, 4 MEDIUM, 1 LOW)
Recommended: Fix HIGH issues before release
```

### Scenario 2: Post-Incident
```
User: "We had a security scare. Check authentication thoroughly."

Security Agent: Executes Phase 5 (Auth Review)
- JWT validation: ✅ Correct
- Token storage: ❌ localStorage (should be httpOnly)
- Session timeout: ✅ 30 minutes
- Password policy: ⚠️ Minimum 8 chars (recommend 12)
- MFA: ❌ Not implemented
- OAuth state: ✅ CSRF protection present

Report: 2 HIGH, 1 MEDIUM issues found
Recommendation: Immediate fix for token storage
```

### Scenario 3: New Feature Added
```
User: "Just added payment processing. Security check it."

Security Agent: Executes targeted scan on payment code
- Secrets: ✅ Stripe key in env vars
- Input validation: ✅ Zod schemas for amounts
- Authorization: ✅ User can only process own payments
- Logging: ⚠️ Full card numbers in debug logs (MEDIUM)
- Rate limiting: ❌ Missing on payment endpoints (HIGH)
- HTTPS: ✅ Enforced

Report: 2 HIGH, 1 MEDIUM
Recommendation: Add rate limiting, remove card numbers from logs
```

---

## Cost Optimization

- **Full audits**: Reserve for releases, major features (~$0.96)
- **Targeted scans**: Use for specific concerns (~$0.10-0.30)
- **Secrets detection**: Run frequently, very cheap (~$0.15)
- **Incremental scans**: Focus on changed files only

---

## Limitations

### What This Agent DOES
✅ Identifies vulnerabilities with severity classification
✅ Provides remediation guidance with code examples
✅ Maps findings to OWASP Top 10
✅ Scans dependencies for known CVEs
✅ Detects secrets in source code

### What This Agent DOES NOT
❌ Automatically fix issues (READ-ONLY by design)
❌ Perform penetration testing (actual attacks)
❌ Detect runtime vulnerabilities
❌ Audit third-party services
❌ Replace professional security audits for high-risk systems

---

## Best Practices

### When to Run Audits

1. **Before major releases** - Full audit mandatory
2. **On PR creation** - Automated in CI/CD
3. **Weekly scheduled** - Dependency CVE checks
4. **After security incidents** - Targeted investigation
5. **New features with auth/payment** - Focused scan
6. **Onboarding new developers** - Educational audit

### Acting on Findings

1. **CRITICAL**: Drop everything, fix immediately, rotate keys
2. **HIGH**: Add to current sprint, block release
3. **MEDIUM**: Add to backlog, prioritize in next sprint
4. **LOW**: Document, fix opportunistically

### False Positives

- **Test files with fixtures**: Acceptable, document in report
- **Sanitized `dangerouslySetInnerHTML`**: Verify DOMPurify usage
- **Internal tools with relaxed security**: Document risk acceptance

---

## References

- **OWASP Top 10 2021**: https://owasp.org/Top10/
- **CWE Database**: https://cwe.mitre.org/
- **CVE Details**: https://www.cvedetails.com/
- **Supabase RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Full Checklist**: `.claude/skills/security-agent/OWASP_CHECKLIST.md`

---

## Related Agents

- **Code Standards Auditor**: For code quality, not security
- **Database Guardian**: For schema design, not security policies
- **QA Engineer**: For functional testing, not security testing

---

*Last Updated: 2026-01-13*
*Agent Version: 1.0.0*
*Status: Active*
