# Privacy Policy

Cacsms Academy respects your personal data rights as required by the Nigerian Data Protection Regulation (NDPR), the Federal Competition and Consumer Protection Act (FCCPA), and counterpart international data protection frameworks when applicable. This Policy governs how we collect, process, store, retain, transfer, and dispose of any data that identifies you directly or indirectly (personal data) as well as anonymized market telemetry.

## 1. Data We Collect and Why

### A. Account Data

- Identity evidence (full name, organization affiliation, government ID when onboarding corporates) to verify eligibility under NDPR Articles 2 and 7.
- Contact routing (email, phone, billing address) used exclusively for authentication, compliance notices, and statutory reporting tied to the Federal Inland Revenue Service.

### B. Usage and Behavioral Data

- System logs capturing login timestamps, IP addresses, and device identifiers for security monitoring, fraud detection, and incident response.
- Dashboard actions, search queries, and alert acknowledgments to tune engine thresholds and recommend workflow improvements.

### C. Market and Alternative Data

- Feed data pulled from licensed FX liquidity venues, exchanges, and our partner data providers, aggregated and stored for insights; raw vendor agreements restrict re-export.

### D. Consent and Legal Basis

Processing is justified on the grounds of contractual necessity, legitimate interest (service security and improvement), and compliance with Nigerian regulatory obligations (e.g., reporting to SEC or NCC when mandated).

## 2. How We Use Personal Data

- Authenticating sessions (NextAuth tokens, JWTs, and Prisma session logs).
- Enforcing subscription entitlements and usage caps through Redis + Prisma, aligning with the usage logs recorded during onboarding.
- Delivering compliance notices, regulatory updates, again communicating through cacsms.com channels.
- Responding to legal requests from courts, arbitration panels, and regulatory bodies with proper warrants.

## 3. Data Sharing, Transfers, and Processors

Cacsms Academy may share data with:

1. **Our trusted processors** that help run the platform—hosting providers, Prisma, Stripe, and monitoring services like Prometheus; each is contractually bound to maintain NDPR-compliant safeguards, encryption in transit (TLS 1.2+) and at rest (AES-256).
2. **Affiliates** during risk investigations, e.g., sharing usage logs between Nigeria-based compliance and UK-based analytics when required.
3. **Regulators** upon lawful request (SEC, NCC, NFIU). We redirect such requests to legal@cacsms.com and log each disclosure.

## 4. Cookies, Tracking, and Preferences

See the Cookie Policy for full details, but we highlight that cookies help:

- Persist consent banners across Nigerian time zones.
- Measure engagement (Google Analytics or equivalent) while keeping identities anonymous.
- Enable core login flows (Secure cookies for NextAuth JWT tokens).
 
You may opt out via browser controls or in-platform preferences.

## 5. Data Retention

- Account data remains while your subscription is active and for eighteen (18) months afterward for compliance audits.
- Transactional logs and alerts are retained for a full compliance cycle (36 months) to satisfy potential SEC inquiries.
- Automated purge routines remove anonymous telemetry older than 24 months, unless needed for forensic reasons with approved change control.

## 6. Security

- Multi-factor authentication is available for every tier. MFA logs flow into the security event bus and are retained for 180 days.
- All systems follow secure development lifecycle (SDL) controls: static analysis, dependency scanning, and vulnerability disclosure via cacsms.com/security.
- Data in motion is always encrypted via TLS 1.3; secrets in deployment environments are managed through encrypted vaults (e.g., HashiCorp, AWS Secrets Manager).

## 7. Your Rights

Under the NDPR, you may:

1. Request access to data we hold about you.
2. Ask for correction or restriction of inaccurate data.
3. Object to profiling for marketing (opt-out always honored).
4. Request deletion after subscription cancellation, subject to legal retention obligations.

Submit requests to legal@cacsms.com. For denied requests, we will provide reasons referencing the NDPR or other legal grounds.

## 8. Changes to this Policy

We may update this Privacy Policy to reflect new regulations or product changes. Each update is published with a revision date and notified via the platform and legal@cacsms.com.
