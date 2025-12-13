# 🌐 DNS Setup Guide for Vercel Deployment

This guide shows you exactly which DNS records to add to your domain registrar to connect your custom domain to Vercel.

## Your Domain Configuration

Based on your deployment configuration:

- **Production URL**: `life-os-banner.verridian.ai`
- **Domain**: `verridian.ai`
- **Subdomain**: `life-os-banner`

## DNS Records to Add

### Option 1: Using a Subdomain (Recommended)

If you're using `life-os-banner.verridian.ai`:

| Type      | Name             | Value                  | TTL  |
| --------- | ---------------- | ---------------------- | ---- |
| **CNAME** | `life-os-banner` | `cname.vercel-dns.com` | 3600 |

**Example:**

```
Type:   CNAME
Name:   life-os-banner
Value:  cname.vercel-dns.com
TTL:    3600 (or Auto)
```

### Option 2: Using Root/Apex Domain

If you want to use `verridian.ai` (without subdomain):

| Type  | Name               | Value         | TTL  |
| ----- | ------------------ | ------------- | ---- |
| **A** | `@` or leave empty | `76.76.21.21` | 3600 |
| **A** | `@` or leave empty | `76.76.21.22` | 3600 |
| **A** | `@` or leave empty | `76.76.21.23` | 3600 |

**Example:**

```
Type:   A
Name:   @ (or leave blank)
Value:  76.76.21.21
TTL:    3600

Type:   A
Name:   @ (or leave blank)
Value:  76.76.21.22
TTL:    3600

Type:   A
Name:   @ (or leave blank)
Value:  76.76.21.23
TTL:    3600
```

### Option 3: Both Subdomain and Root Domain

To use both `life-os-banner.verridian.ai` AND `verridian.ai`:

| Type      | Name             | Value                  | TTL  |
| --------- | ---------------- | ---------------------- | ---- |
| **A**     | `@`              | `76.76.21.21`          | 3600 |
| **A**     | `@`              | `76.76.21.22`          | 3600 |
| **A**     | `@`              | `76.76.21.23`          | 3600 |
| **CNAME** | `life-os-banner` | `cname.vercel-dns.com` | 3600 |
| **CNAME** | `www`            | `cname.vercel-dns.com` | 3600 |

## Step-by-Step Instructions

### Step 1: Access Your Domain Registrar

Go to your domain registrar's DNS management page. Common registrars:

- **Namecheap**: Dashboard → Domain List → Manage → Advanced DNS
- **GoDaddy**: My Products → Domains → DNS → Manage DNS
- **Cloudflare**: Dashboard → Select Domain → DNS
- **Google Domains**: My Domains → Manage → DNS
- **AWS Route 53**: Hosted Zones → Select Domain → Create Record

### Step 2: Add the DNS Records

#### For Subdomain (life-os-banner.verridian.ai):

1. Click **Add Record** or **Add New Record**
2. Select **CNAME** as the record type
3. Enter the following:
   - **Host/Name**: `life-os-banner`
   - **Value/Points to**: `cname.vercel-dns.com`
   - **TTL**: `3600` (or Auto)
4. Click **Save**

#### For Root Domain (verridian.ai):

1. Add the first A record:
   - **Type**: A
   - **Host/Name**: `@` (or leave blank)
   - **Value/Points to**: `76.76.21.21`
   - **TTL**: `3600`
   - Click **Save**

2. Add the second A record:
   - **Type**: A
   - **Host/Name**: `@` (or leave blank)
   - **Value/Points to**: `76.76.21.22`
   - **TTL**: `3600`
   - Click **Save**

3. Add the third A record:
   - **Type**: A
   - **Host/Name**: `@` (or leave blank)
   - **Value/Points to**: `76.76.21.23`
   - **TTL**: `3600`
   - Click **Save**

### Step 3: Configure Domain in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter your domain: `life-os-banner.verridian.ai`
6. Click **Add**
7. Vercel will verify the DNS records

### Step 4: Wait for DNS Propagation

- **Typical time**: 5-30 minutes
- **Maximum time**: 24-48 hours
- Check status at: https://dnschecker.org

## Verification

### Check DNS Records

Use these commands to verify your DNS is configured correctly:

```bash
# Check CNAME record (for subdomain)
nslookup life-os-banner.verridian.ai

# Check A records (for root domain)
nslookup verridian.ai

# Or use dig (Linux/Mac)
dig life-os-banner.verridian.ai
dig verridian.ai
```

### Expected Results

**For CNAME (subdomain):**

```
life-os-banner.verridian.ai    canonical name = cname.vercel-dns.com
```

**For A records (root domain):**

```
verridian.ai    A    76.76.21.21
verridian.ai    A    76.76.21.22
verridian.ai    A    76.76.21.23
```

## Common DNS Providers - Specific Instructions

### Namecheap

1. Sign in to Namecheap
2. Select **Domain List** from the left menu
3. Click the **Manage** button next to your domain
4. Select the **Advanced DNS** tab
5. Click **Add New Record**
6. Configure as shown in the tables above
7. Click the green checkmark to save

### GoDaddy

1. Sign in to GoDaddy
2. Go to **My Products**
3. Next to **Domains**, click **DNS**
4. Click **Add** in the Records section
5. Select record type and fill in details
6. Click **Save**

### Cloudflare

1. Sign in to Cloudflare
2. Select your domain
3. Click **DNS** in the top menu
4. Click **Add record**
5. Fill in the details:
   - **Type**: CNAME or A
   - **Name**: life-os-banner or @
   - **Target/IPv4**: cname.vercel-dns.com or IP address
   - **Proxy status**: DNS only (gray cloud) ⚠️ IMPORTANT
6. Click **Save**

**⚠️ Cloudflare Important Note:**

- For CNAME records pointing to Vercel, you MUST disable the proxy (gray cloud, not orange)
- Orange cloud will cause issues with Vercel's SSL certificates

### Google Domains

1. Sign in to Google Domains
2. Click **My domains**
3. Next to your domain, click **Manage**
4. Click **DNS** in the left menu
5. Scroll to **Custom resource records**
6. Enter the record details
7. Click **Add**

### AWS Route 53

1. Sign in to AWS Console
2. Go to Route 53
3. Click **Hosted zones**
4. Select your domain
5. Click **Create record**
6. Fill in:
   - **Record name**: life-os-banner or leave blank for root
   - **Record type**: A or CNAME
   - **Value**: IP address or cname.vercel-dns.com
   - **TTL**: 300
7. Click **Create records**

## SSL Certificate

Vercel automatically provisions SSL certificates for your domain:

- **Certificate Type**: Let's Encrypt (free)
- **Renewal**: Automatic
- **Protocol**: TLS 1.3
- **Time to activate**: 5-30 minutes after DNS propagation

You don't need to do anything - Vercel handles SSL automatically!

## Troubleshooting

### Issue: Domain not connecting after 24 hours

**Solution:**

1. Verify DNS records at your registrar
2. Check for typos in the values
3. Make sure TTL is set correctly (3600 or Auto)
4. Clear your DNS cache:

   ```bash
   # Windows
   ipconfig /flushdns

   # Mac/Linux
   sudo dscacheutil -flushcache
   ```

### Issue: SSL certificate not activating

**Solution:**

1. Wait 30 minutes after DNS propagation
2. Remove and re-add the domain in Vercel
3. Check that DNS records are correct
4. For Cloudflare: Ensure proxy is disabled (gray cloud)

### Issue: "Invalid Configuration" in Vercel

**Solution:**

1. Verify the CNAME value is exactly: `cname.vercel-dns.com`
2. For A records, verify IPs are correct
3. Check there are no conflicting records
4. Remove any existing A or CNAME records for the same name

### Issue: DNS propagation taking too long

**Solution:**

1. Lower the TTL to 300 (5 minutes)
2. Wait an additional 24 hours
3. Check different DNS servers:
   ```bash
   nslookup life-os-banner.verridian.ai 8.8.8.8
   nslookup life-os-banner.verridian.ai 1.1.1.1
   ```

### Issue: Works on some devices but not others

**Cause**: DNS caching

**Solution:**

```bash
# Clear DNS cache on each device
# Windows
ipconfig /flushdns

# Mac
sudo killall -HUP mDNSResponder

# Linux
sudo systemd-resolve --flush-caches
```

## Testing Your Setup

### 1. Check DNS Propagation

Visit: https://dnschecker.org

- Enter your domain: `life-os-banner.verridian.ai`
- Select **CNAME** (or **A** for root domain)
- Click **Search**
- Green checkmarks = DNS propagated successfully

### 2. Check SSL Certificate

Visit your site in browser:

- URL: `https://life-os-banner.verridian.ai`
- Look for padlock icon in address bar
- Click padlock → Certificate
- Verify issuer is Let's Encrypt

### 3. Check Site Loading

```bash
# Test with curl
curl -I https://life-os-banner.verridian.ai

# Expected output includes:
HTTP/2 200
```

## Quick Reference

### Vercel DNS Values

| Purpose         | Record Type | Value                  |
| --------------- | ----------- | ---------------------- |
| Subdomain       | CNAME       | `cname.vercel-dns.com` |
| Root domain (1) | A           | `76.76.21.21`          |
| Root domain (2) | A           | `76.76.21.22`          |
| Root domain (3) | A           | `76.76.21.23`          |

### Common TTL Values

| Value | Duration  | Use Case                 |
| ----- | --------- | ------------------------ |
| 300   | 5 minutes | Testing/frequent changes |
| 3600  | 1 hour    | Standard (recommended)   |
| 86400 | 24 hours  | Stable production        |

## Summary

1. ✅ Add CNAME record: `life-os-banner` → `cname.vercel-dns.com`
2. ✅ Wait 5-30 minutes for DNS propagation
3. ✅ Add domain in Vercel dashboard
4. ✅ Wait for SSL certificate (automatic)
5. ✅ Visit https://life-os-banner.verridian.ai

Your site should be live within 30 minutes!

## Need Help?

- **Vercel Status**: https://www.vercel-status.com
- **Vercel Docs**: https://vercel.com/docs/concepts/projects/custom-domains
- **DNS Checker**: https://dnschecker.org
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

---

**Questions?** Check your domain registrar's help docs or contact their support team.
