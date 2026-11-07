## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 2, task 2.3:** access management capabilities: credentials, access keys, password policies, MFA, roles, and the root user.

| Question wording | Answer |
|---|---|
| "credentials for programmatic access through the CLI/SDK" | **Access key ID and secret access key** |
| "best practice for root user access keys" | **Don't create them; delete any that exist** |
| "regularly replace access keys" | **Rotate access keys** |
| "report listing all users and the status of their passwords, keys and MFA" | **IAM credential report** |
| "service that provides temporary security credentials" | **AWS STS** |
| "give an EC2 application access to S3 without storing keys" | **IAM role (instance profile)** |

### Solutions Architect – Associate (SAA-C03) and Developer – Associate (DVA-C02)
- **AssumeRole** for cross-account access: the trust policy on the role and permissions on the caller.
- Temporary credentials: **access key ID, secret, session token, expiration**; durations 15 min to 12 h; role chaining max 1 h.
- `AssumeRoleWithWebIdentity` (OIDC, EKS, Cognito) and `AssumeRoleWithSAML` (corporate federation).
- `GetSessionToken` with MFA for IAM users.
- External ID for third-party access (the "confused deputy" problem).
- `InvalidClientTokenId`, `SignatureDoesNotMatch` and `ExpiredToken` errors.

### Exam traps
- An application on EC2 should **never** use stored access keys; the answer is the instance role.
- A user can have **two** access keys, which is what makes rotation without downtime possible.
- `GetCallerIdentity` needs no permissions; it always works with valid credentials.
- Deleting a role's policy doesn't instantly end sessions; revoking sessions or waiting for expiry does.
