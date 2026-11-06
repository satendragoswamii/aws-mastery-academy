## Security and best practices

### Signing in safely
1. **MFA for every human** who can sign in to the console, especially the root user.
2. **Don't use the root user** for daily console work; use IAM Identity Center or IAM roles.
3. **Bookmark your sign-in URLs.** Phishing sites copy the AWS sign-in page; check the address bar for `signin.aws.amazon.com` (or your organisation's access portal).
4. **Sign out** on shared computers, and keep session durations sensible.

### Least privilege applies to the console too
The console can only do what your IAM permissions allow. Give production **read-only** console access by default; use a separate, audited role for emergency changes.

### Avoid secrets in screenshots
Console screenshots in tickets and chat often reveal account IDs, resource names, internal IPs or even secret values (Secrets Manager "Retrieve secret value", Lambda environment variables). Crop or blur them.

### Prefer CloudShell over local keys
CloudShell uses temporary session credentials. If you need the CLI and don't want long-term access keys on your laptop, use CloudShell (or `aws sso login` with Identity Center).

### Watch console activity
CloudTrail records console sign-ins (`ConsoleLogin` events, including failures and MFA use) and every action. Alert on **root user sign-ins** and on sign-ins without MFA.

### In this lab
- The Floci UI uses Floci's dummy `test` credentials; nothing it does touches real AWS.
- Don't delete Floci's `smoke` queue or default resources from the UI.
