## Security and best practices

### No keys in code, ever (except Floci's dummy keys)
1. **Let the default chain find credentials.** On AWS that means the role of the compute: Lambda execution role, ECS task role, EC2 instance profile. On a laptop, an IAM Identity Center (SSO) profile.
2. **Never commit access keys** to Git, `.env` files or Docker images. Automated scanners find leaked keys on public repositories within minutes; AWS also scans and may quarantine exposed keys.
3. `lab-config.mjs` hard-codes `test`/`test` **only** because Floci accepts any keys. For real projects, delete the `credentials` line.

### Least privilege for application roles
Give the application's role exactly the actions and resources it needs, for example `dynamodb:PutItem` and `dynamodb:UpdateItem` on one table ARN, `s3:PutObject` on one bucket prefix. An SDK call is only as safe as the role behind it.

### Handle errors without leaking them
- Catch **specific** error types and re-throw the rest, so unexpected failures surface in logs and alarms.
- Don't return raw AWS error messages or request details to end users; log them (with the request ID) and show a simple message.
- Don't log full responses that may contain personal data or secrets (for example `GetSecretValue`).

### Safe writes
- Use **conditional writes** (as in step 5) so duplicate or replayed requests can't double-charge or overwrite newer data.
- Retries mean a request may run **more than once**; design writes to be idempotent.

### Keep the SDK up to date
Dependencies can contain vulnerabilities. Run `npm audit` and update `@aws-sdk/*` packages regularly; SDK v3 releases often, and v2 for JavaScript reached end of support in 2025.

### The academy's own safety rules
Every client here sets `endpoint: "http://localhost:4566"`, and step 6 used lab-only config files and cleared credential variables before printing what the chain found, so your real credentials were never read or shown. Only the access key **ID** was printed, never a secret.
