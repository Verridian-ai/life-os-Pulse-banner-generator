# OWASP Top 10 2021 - Security Audit Checklist

This document provides detailed criteria for identifying and classifying vulnerabilities according to the OWASP Top 10 2021 standard.

---

## A01:2021 – Broken Access Control

**Description**: Failures related to access control enforcement, allowing unauthorized access to functionality or data.

### Detection Criteria

#### Missing Authentication
- [ ] Sensitive endpoints accessible without authentication
- [ ] Admin routes accessible to regular users
- [ ] API endpoints missing auth middleware
- [ ] Protected resources accessible via direct URL

**Example Vulnerability**:
```typescript
// VULNERABLE
app.get('/api/admin/users', (req, res) => {
  // No auth check
  return db.users.findAll();
});

// SECURE
app.get('/api/admin/users', requireAuth, requireAdmin, (req, res) => {
  return db.users.findAll();
});
```

#### Missing Authorization
- [ ] Users can access other users' data
- [ ] IDOR (Insecure Direct Object Reference) vulnerabilities
- [ ] Horizontal privilege escalation possible
- [ ] Vertical privilege escalation possible

**Example Vulnerability**:
```typescript
// VULNERABLE - No ownership check
app.get('/api/posts/:id', async (req, res) => {
  const post = await db.posts.findById(req.params.id);
  return res.json(post);
});

// SECURE
app.get('/api/posts/:id', requireAuth, async (req, res) => {
  const post = await db.posts.findById(req.params.id);
  if (post.userId !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return res.json(post);
});
```

#### RLS Violations
- [ ] RLS disabled on Supabase/Neon tables with user data
- [ ] Policies use `USING (true)` without justification
- [ ] Missing policies for INSERT/UPDATE/DELETE
- [ ] Service role bypassing RLS without audit trail

**Example Vulnerability**:
```sql
-- VULNERABLE
CREATE POLICY "allow_all"
ON posts FOR SELECT
USING (true);

-- SECURE
CREATE POLICY "users_can_view_own_posts"
ON posts FOR SELECT
USING (auth.uid() = user_id);
```

### Severity Classification

| Scenario | Severity |
|----------|----------|
| Admin panel accessible without auth | CRITICAL |
| User can access other users' data (PII) | CRITICAL |
| User can access other users' data (non-PII) | HIGH |
| Missing rate limiting on sensitive endpoints | MEDIUM |
| Overly verbose error messages | LOW |

---

## A02:2021 – Cryptographic Failures

**Description**: Failures related to cryptography (or lack thereof), leading to exposure of sensitive data.

### Detection Criteria

#### Sensitive Data Exposure
- [ ] API keys hardcoded in source code
- [ ] Passwords stored in plaintext
- [ ] Private keys committed to repository
- [ ] Sensitive data logged to console/files
- [ ] Sensitive data in URLs/query parameters

**Example Vulnerability**:
```typescript
// VULNERABLE
const STRIPE_SECRET_KEY = "sk_live_abc123...";

// SECURE
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
```

#### Weak Cryptography
- [ ] MD5/SHA1 used for password hashing (instead of bcrypt/argon2)
- [ ] Weak encryption algorithms (DES, RC4)
- [ ] Insufficient key length (<2048 bits RSA, <256 bits AES)
- [ ] No salt for password hashing

**Example Vulnerability**:
```typescript
// VULNERABLE
const hash = crypto.createHash('md5').update(password).digest('hex');

// SECURE
const hash = await bcrypt.hash(password, 12);
```

#### Insecure Transmission
- [ ] HTTP used instead of HTTPS for sensitive data
- [ ] JWT tokens in URLs
- [ ] Sensitive cookies without Secure flag
- [ ] Missing HSTS header

**Example Vulnerability**:
```typescript
// VULNERABLE
res.cookie('session', token, { httpOnly: true });

// SECURE
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

### Severity Classification

| Scenario | Severity |
|----------|----------|
| API key committed to public repo | CRITICAL |
| Production credentials in code | CRITICAL |
| Passwords stored in plaintext | CRITICAL |
| MD5 used for password hashing | HIGH |
| Sensitive data in logs | MEDIUM |
| Missing Secure flag on cookies | MEDIUM |

---

## A03:2021 – Injection

**Description**: User input is not properly validated, filtered, or sanitized, allowing injection of malicious code.

### Detection Criteria

#### SQL Injection
- [ ] User input concatenated into SQL queries
- [ ] Dynamic SQL without parameterization
- [ ] ORM raw queries with unsanitized input

**Example Vulnerability**:
```typescript
// VULNERABLE
const email = req.query.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
// Input: ' OR '1'='1

// SECURE
const user = await db.users.findOne({
  where: { email: req.query.email }
});
```

#### XSS (Cross-Site Scripting)
- [ ] User input rendered without sanitization
- [ ] `dangerouslySetInnerHTML` used without DOMPurify
- [ ] `innerHTML` assignment with user data
- [ ] `eval()` or `new Function()` with user input

**Example Vulnerability**:
```typescript
// VULNERABLE
<div dangerouslySetInnerHTML={{ __html: userComment }} />

// SECURE
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userComment);
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

#### Command Injection
- [ ] User input passed to `exec()`, `spawn()`, `system()`
- [ ] Shell commands constructed with string concatenation
- [ ] Unsafe use of `child_process`

**Example Vulnerability**:
```typescript
// VULNERABLE
exec(`convert ${userFilename}.jpg output.png`);
// Input: "image.jpg; rm -rf /"

// SECURE
execFile('convert', [userFilename + '.jpg', 'output.png']);
```

#### NoSQL Injection
- [ ] User input used in MongoDB queries without validation
- [ ] `$where` operator with user input

**Example Vulnerability**:
```typescript
// VULNERABLE
db.users.find({ username: req.body.username });
// Input: { "$gt": "" }

// SECURE (using Zod validation)
const schema = z.object({ username: z.string() });
const { username } = schema.parse(req.body);
db.users.find({ username });
```

### Severity Classification

| Scenario | Severity |
|----------|----------|
| SQL injection in production | CRITICAL |
| Command injection | CRITICAL |
| Stored XSS | HIGH |
| Reflected XSS | HIGH |
| NoSQL injection | MEDIUM |

---

## A04:2021 – Insecure Design

**Description**: Missing or ineffective control design, representing different weaknesses than implementation defects.

### Detection Criteria

#### Lack of Security Requirements
- [ ] No threat model for sensitive features
- [ ] Security not considered in architecture
- [ ] No abuse case testing

#### Insufficient Anti-Automation
- [ ] No rate limiting on login/registration
- [ ] No CAPTCHA on public forms
- [ ] Unlimited API requests
- [ ] No bot detection

**Example Vulnerability**:
```typescript
// VULNERABLE - No rate limiting
app.post('/api/auth/login', loginHandler);

// SECURE
import rateLimit from 'express-rate-limit';
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts'
});
app.post('/api/auth/login', loginLimiter, loginHandler);
```

#### Business Logic Flaws
- [ ] Price manipulation possible
- [ ] Discount codes stackable infinitely
- [ ] Credit system exploitable
- [ ] Workflow steps can be skipped

### Severity Classification

| Scenario | Severity |
|----------|----------|
| Payment amount can be manipulated | CRITICAL |
| No rate limiting on authentication | HIGH |
| Workflow steps can be skipped | MEDIUM |
| Missing abuse case testing | LOW |

---

## A05:2021 – Security Misconfiguration

**Description**: Missing hardening, unnecessary features enabled, default credentials, overly verbose errors.

### Detection Criteria

#### Missing Security Headers
- [ ] No Content-Security-Policy
- [ ] No X-Frame-Options
- [ ] No X-Content-Type-Options
- [ ] No Strict-Transport-Security
- [ ] No Referrer-Policy

**Example Vulnerability**:
```typescript
// VULNERABLE - No headers
app.use(express.json());

// SECURE
import helmet from 'helmet';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
    }
  }
}));
```

#### Overly Permissive CORS
- [ ] CORS set to `*` in production
- [ ] Credentials allowed with wildcard origin
- [ ] No origin validation

**Example Vulnerability**:
```typescript
// VULNERABLE
app.use(cors({ origin: '*', credentials: true }));

// SECURE
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true
}));
```

#### Verbose Error Messages
- [ ] Stack traces exposed to users
- [ ] Database errors shown in responses
- [ ] Internal paths revealed

**Example Vulnerability**:
```typescript
// VULNERABLE
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });
});

// SECURE
app.use((err, req, res, next) => {
  console.error(err); // Log internally
  res.status(500).json({ error: 'Internal server error' });
});
```

#### Default Credentials
- [ ] Default admin passwords not changed
- [ ] Database using default credentials
- [ ] API keys still set to example values

### Severity Classification

| Scenario | Severity |
|----------|----------|
| Default admin credentials unchanged | CRITICAL |
| Stack traces exposed in production | HIGH |
| Missing CSP header | MEDIUM |
| Missing X-Frame-Options | MEDIUM |
| Overly verbose logs | LOW |

---

## A06:2021 – Vulnerable and Outdated Components

**Description**: Using components with known vulnerabilities or that are no longer maintained.

### Detection Criteria

#### Known CVEs
- [ ] Dependencies with CRITICAL CVEs
- [ ] Dependencies with HIGH CVEs
- [ ] Transitive dependencies with known exploits

**Check with**:
```bash
npm audit
npm audit --json | jq '.vulnerabilities'
```

#### Outdated Libraries
- [ ] React <18 (missing security patches)
- [ ] Express <4.17 (known vulnerabilities)
- [ ] Libraries >2 major versions behind

#### Unmaintained Dependencies
- [ ] Last update >3 years ago
- [ ] Known security issues without patches
- [ ] Deprecated by maintainer

### Severity Classification

| Scenario | Severity |
|----------|----------|
| CVE with active exploits (CVSS >9) | CRITICAL |
| CVE rated HIGH (CVSS 7-8.9) | HIGH |
| CVE rated MEDIUM (CVSS 4-6.9) | MEDIUM |
| Outdated but no known CVEs | LOW |

---

## A07:2021 – Identification and Authentication Failures

**Description**: Failures related to user identity confirmation, authentication, and session management.

### Detection Criteria

#### Weak Password Policy
- [ ] No minimum password length
- [ ] No complexity requirements
- [ ] Common passwords allowed (password123)
- [ ] No password strength meter

**Example Secure Implementation**:
```typescript
const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[0-9]/, "Must contain number")
  .regex(/[^A-Za-z0-9]/, "Must contain special character");
```

#### Session Management Issues
- [ ] Session tokens predictable
- [ ] No session timeout
- [ ] Sessions not invalidated on logout
- [ ] Session fixation vulnerability

**Example Vulnerability**:
```typescript
// VULNERABLE - Session never expires
req.session.userId = user.id;

// SECURE
req.session.userId = user.id;
req.session.cookie.maxAge = 30 * 60 * 1000; // 30 minutes
```

#### Missing MFA
- [ ] No MFA option for sensitive accounts
- [ ] MFA can be bypassed
- [ ] MFA codes reusable

#### Brute Force Protection
- [ ] No account lockout after failed attempts
- [ ] No CAPTCHA after N failures
- [ ] Credential stuffing not prevented

### Severity Classification

| Scenario | Severity |
|----------|----------|
| Session fixation possible | CRITICAL |
| No brute force protection on login | HIGH |
| Weak password policy | MEDIUM |
| Missing MFA for admin | MEDIUM |
| Session timeout too long | LOW |

---

## A08:2021 – Software and Data Integrity Failures

**Description**: Code and infrastructure that does not protect against integrity violations.

### Detection Criteria

#### Insecure Deserialization
- [ ] Unvalidated JSON.parse()
- [ ] Untrusted data deserialization
- [ ] Prototype pollution possible

**Example Vulnerability**:
```typescript
// VULNERABLE
const userData = JSON.parse(req.body.data);
// Can pollute Object.prototype

// SECURE
const userSchema = z.object({ name: z.string(), age: z.number() });
const userData = userSchema.parse(JSON.parse(req.body.data));
```

#### Unsigned/Unverified Updates
- [ ] Frontend assets served over HTTP
- [ ] No Subresource Integrity (SRI) for CDN scripts
- [ ] Auto-updates without signature verification

**Example Secure Implementation**:
```html
<!-- SECURE - SRI hash -->
<script
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/ux..."
  crossorigin="anonymous"
></script>
```

#### CI/CD Security
- [ ] No code signing in pipeline
- [ ] Secrets in build logs
- [ ] Unverified dependencies pulled in build

### Severity Classification

| Scenario | Severity |
|----------|----------|
| Insecure deserialization leading to RCE | CRITICAL |
| No SRI for critical CDN scripts | MEDIUM |
| Secrets in CI/CD logs | HIGH |

---

## A09:2021 – Security Logging and Monitoring Failures

**Description**: Insufficient logging, detection, monitoring, and active response.

### Detection Criteria

#### Missing Security Logs
- [ ] Failed login attempts not logged
- [ ] Admin actions not audited
- [ ] Sensitive data access not tracked
- [ ] No log correlation ID

**Example Secure Implementation**:
```typescript
// Log security events
logger.security({
  event: 'LOGIN_FAILED',
  userId: attemptedUsername,
  ip: req.ip,
  timestamp: new Date(),
  correlationId: req.id
});
```

#### Logging Sensitive Data
- [ ] Passwords logged
- [ ] API keys logged
- [ ] Full credit card numbers logged
- [ ] PII logged without masking

**Example Vulnerability**:
```typescript
// VULNERABLE
console.log('User login:', { email, password });

// SECURE
console.log('User login:', { email, password: '***' });
```

#### No Alerting
- [ ] No alerts on repeated failures
- [ ] No monitoring for attack patterns
- [ ] No incident response plan

### Severity Classification

| Scenario | Severity |
|----------|----------|
| Passwords logged in plaintext | CRITICAL |
| No logging of admin actions | HIGH |
| No alerting on suspicious activity | MEDIUM |
| Logs not retained long enough | LOW |

---

## A10:2021 – Server-Side Request Forgery (SSRF)

**Description**: Application fetches a remote resource without validating the user-supplied URL.

### Detection Criteria

#### Unvalidated URL Fetching
- [ ] User-supplied URL passed to fetch/axios
- [ ] No allowlist for external requests
- [ ] Internal services accessible via SSRF

**Example Vulnerability**:
```typescript
// VULNERABLE
app.get('/fetch', async (req, res) => {
  const url = req.query.url;
  const data = await fetch(url); // Can access internal services
  res.send(data);
});

// SECURE
const ALLOWED_DOMAINS = ['api.example.com', 'cdn.example.com'];
app.get('/fetch', async (req, res) => {
  const url = new URL(req.query.url);
  if (!ALLOWED_DOMAINS.includes(url.hostname)) {
    return res.status(400).json({ error: 'Invalid domain' });
  }
  const data = await fetch(url.toString());
  res.send(data);
});
```

#### Webhook Validation
- [ ] Webhooks accept any source
- [ ] No signature verification
- [ ] Can target internal IPs

### Severity Classification

| Scenario | Severity |
|----------|----------|
| SSRF allowing access to cloud metadata (169.254.169.254) | CRITICAL |
| SSRF to internal services | HIGH |
| Unvalidated webhooks | MEDIUM |

---

## Audit Workflow

For each category:

1. **Search for patterns** using Grep
2. **Read suspicious files** for context
3. **Classify severity** based on criteria above
4. **Map to OWASP category**
5. **Provide remediation** with code example

---

*Last Updated: 2026-01-13*
*Version: 1.0.0 - Based on OWASP Top 10 2021*
