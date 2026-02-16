# 🔄 KEY ROTATION SCHEDULE - Revenue Automation Empire

## 📅 Quarterly Rotation (Every 3 Months)

### Next Rotation: 2026-05-16
**Keys to Rotate:**
1. **Stripe Secret Key** (`sk_live_...`)
2. **Database Passwords** (PostgreSQL)
3. **SSH Keys** (GitHub authentication)
4. **JWT Secret** (API authentication)

### Procedure:
```bash
# 1. Generate new Stripe key
#    Dashboard → Developers → API keys → Create key

# 2. Update .env file
STRIPE_SECRET_KEY=new_sk_live_...

# 3. Restart services
pm2 restart all

# 4. Test new key
node test_stripe_integration.js

# 5. Revoke old key after 24h
#    Dashboard → Developers → API keys → Revoke
```

## 📅 Monthly Rotation (Every 1 Month)

### Next Rotation: 2026-03-16
**Keys to Rotate:**
1. **Shopify API Tokens** (when created)
2. **YouTube API Keys**
3. **Social Media Access Tokens**
4. **Email Service API Keys**

## 🚨 Immediate Rotation (If Suspected Compromise)

**Indicators:**
- Unusual API activity
- Failed login attempts
- Unexpected payments/refunds
- Security alerts from services

**Emergency Procedure:**
1. **IMMEDIATELY** revoke all keys in respective dashboards
2. Generate new keys
3. Update all services
4. Audit logs for unauthorized access
5. Notify affected parties if necessary

## 🔐 Current Key Status (2026-02-16)

### ✅ Active & Secure:
- **Stripe**: Live keys configured, webhook pending
- **GitHub**: SSH key authentication
- **Environment**: .env file (gitignored)
- **Database**: SQLite local, no external access

### ⏳ Pending Setup:
- Shopify API credentials
- YouTube/TikTok API keys
- Email service (SendGrid/Postmark)
- Production database (PostgreSQL)

## 📋 Rotation Checklist

### Before Rotation:
- [ ] Notify team/maintenance window
- [ ] Backup current configuration
- [ ] Test new keys in staging environment
- [ ] Prepare rollback plan

### During Rotation:
- [ ] Generate new keys in respective dashboards
- [ ] Update .env file with new keys
- [ ] Restart affected services
- [ ] Test functionality with new keys

### After Rotation:
- [ ] Verify all systems operational
- [ ] Monitor for errors 24h
- [ ] Revoke old keys (after verification)
- [ ] Update secure backup documentation

## 🛡️ Security Best Practices

### Key Storage:
- **Primary**: 1Password/Bitwarden vault
- **Secondary**: Encrypted USB drive
- **Tertiary**: Printed copy in safe (optional)

### Access Control:
- Minimum 2FA on all services
- IP whitelisting where possible
- Regular access reviews
- Principle of least privilege

### Monitoring:
- Failed authentication attempts
- Unusual API usage patterns
- Webhook delivery failures
- Security alert subscriptions

## 📞 Emergency Contacts

### Stripe Support:
- Dashboard: https://dashboard.stripe.com/support
- Phone: +31 20 808 2903 (Netherlands)
- Email: support@stripe.com

### GitHub Security:
- https://github.com/contact
- security@github.com

### Domain/Hosting:
- [To be configured based on provider]

## 🎯 Success Metrics

### Key Rotation Success:
- Zero service downtime during rotation
- All tests pass with new keys
- Old keys successfully revoked
- No security incidents post-rotation

### Security Metrics:
- 100% 2FA adoption on critical services
- Quarterly key rotation compliance
- Monthly security audit completion
- Zero unauthorized access incidents

---

**🔐 PROTECT YOUR €50K+ MRR REVENUE STREAMS**
**🔄 REGULAR ROTATION = LONG-TERM SECURITY**
**💰 SECURE KEYS = SECURE REVENUE**