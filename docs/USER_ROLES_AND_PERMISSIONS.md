# Cacsms Academy: User Roles & Permissions Guide

## User Role Hierarchy

The system implements a 3-tier role system combined with subscription plans:

### 1. **Super Admin** 👑
- **Authority**: Complete system control
- **System Access**: All features, unlimited usage
- **Management Capabilities**:
  - View/manage all users
  - Create/modify subscriptions
  - Access administration panel
  - View platform analytics
  - Manage system settings
  - Override usage limits
- **Subscription**: Institutional (Unlimited Everything)
- **Support**: Dedicated account manager

### 2. **Administrator** 🛡️
- **Authority**: Platform management (system-level actions)
- **System Access**: All features, unlimited usage
- **Management Capabilities**:
  - View user analytics
  - Access administration panel
  - View system logs
  - Manage team members
- **Subscription**: Typically Pro Trader or Institutional
- **Support**: Priority support (12h response)

### 3. **User** 👤
- **Authority**: Personal account access only
- **System Access**: Based on subscription plan
- **Management Capabilities**:
  - Manage own account settings
  - View personal analytics
  - Configure personal alerts
- **Subscription**: Scout, Analyst, Trader, ProTrader, or Institutional
- **Support**: Based on subscription tier

---

## Subscription Tiers & Feature Access

| Feature | Scout | Analyst | Trader | ProTrader | Institutional |
|---------|-------|---------|--------|----------|---------------|
| **Price (Monthly)** | Free | $19 | $49 | $99 | $299 |
| **Price (Annual)** | Free | $190 | $490 | $990 | $2,990 |
| **Currency Strength** | ✓ 4h delay | ✓ Real-time | ✓ Real-time | ✓ Real-time | ✓ Real-time |
| **Channel Scanner** | 5/day | 30/day | Unlimited | Unlimited | Unlimited |
| **Breakout Engine** | ✗ | ✓ | ✓ | ✓ | ✓ |
| **AI Probability** | ✗ | ✗ | 100/day | Unlimited | Unlimited |
| **Liquidity Intel** | ✗ | ✗ | ✓ | ✓ | ✓ |
| **Opportunity Radar** | ✗ | ✗ | Top 5 | Unlimited | Unlimited |
| **API Access** | ✗ | ✗ | ✗ | 1,000 calls/day | Unlimited |
| **Team Seats** | — | — | — | — | 5 |
| **Alerts/Day** | 10 | 10 | 100 | Unlimited | Unlimited |
| **Support Level** | Community | Email | Email | 12h Response | Account Manager |

---

## Current System Administrators

### Super Admin: admin@cacsms.com
- **Status**: ✓ Active
- **Role**: Super Admin
- **Subscription**: Institutional (Annual)
- **Subscription Expiry**: March 18, 2027
- **Permissions**: All system access, unlimited features
- **Created**: Database setup
- **Last Updated**: March 18, 2026

---

## Role-Based Access Control (RBAC)

### Dashboard Pages Protected by Role:

```typescript
// Super Admin / Administrator only
- /admin (Administration Panel)
- /user-management
- /billing-management
- /system-logs

// All authenticated users (plan-dependent)
- /currency-strength (Scout+)
- /channel-scanner (Analyst+)
- /breakout-engine (Analyst+)
- /liquidity-intel (Trader+)  
- /opportunities (ProTrader+)
- /configuration (All)
- /alert-history (All)
```

### Features Protected by Subscription:

**Free Access** (Scout Plan):
- 5 pairs (EURUSD, GBPUSD, USDJPY, AUDUSD, USDNGN)
- Currency strength (4-hour delay)
- 5 channel scans/day
- Community Discord

**Analyst+**:
- 14 currency pairs
- Real-time feeds
- Basic breakout detection

**Trader+**:
- All 28 pairs
- All timeframes
- AI probability engine (limited)
- Basic liquidity intelligence
- Opportunity radar (top 5)

**ProTrader+**:
- Unlimited AI analyses
- Full liquidity intelligence
- API access
- SMS alerts

**Institutional**:
- Everything unlimited
- Team seats (5)
- White-label reports
- Custom webhooks
- Dedicated support

---

## Usage Limits Enforcement

All usage limits are enforced in real-time during API requests via the `UsageStore` class:

```typescript
// File: src/lib/usage/store.ts

// Limits are checked by:
1. User ID + Plan Name + Feature Name
2. Hourly bucket (sliding window)
3. Daily bucket (calendar day)

// Super Admin and Administrator roles bypass all limits
if (user.role === 'Super Admin' || user.role === 'Administrator') {
  return { allowed: true, used: 0, limit: Infinity };
}

// Other users are checked against their plan limits
```

---

## Managing User Roles

### Upgrading a User to Administrator:

```sql
UPDATE "User" SET role = 'Administrator' WHERE email = 'user@example.com';
```

### Creating a New Super Admin (via TypeScript):

```typescript
// Run: npx ts-node prisma/setup-admin.ts
// (File: prisma/setup-admin.ts)
```

### Giving Institutional Access:

```sql
-- Expire current subscription
UPDATE "Subscription" SET status = 'Expired' 
WHERE "userId" = 'user_id' AND status = 'Active';

-- Create Institutional subscription
INSERT INTO "Subscription" 
(id, "userId", "planType", "billingCycle", price, currency, 
 "startDate", "expiryDate", "paymentProvider", status) 
VALUES 
(GENERATE_CUID(), 'user_id', 'Institutional', 'annual', 2990, '$',
 NOW(), NOW() + INTERVAL '1 year', 'Internal', 'Active');
```

---

## Security Considerations

1. **Super Admin Email**: Only one recommended (admin@cacsms.com)
2. **Password**: Changed only via secure password reset
3. **Role Inheritance**: Roles cannot be self-assigned; database updates only
4. **Audit Logging**: All role changes logged to UsageLog
5. **JWT Token**: Role embedded in session; updates require re-login
6. **Rate Limiting**: 10 unauthorized attempts → 60s cooldown

---

## Contact & Support

- **System Administrator**: admin@cacsms.com
- **Support Email**: notifications@cacsms.com
- **Documentation**: See `/docs` folder
- **API Docs**: Available at `/api/docs` (authenticated only)
