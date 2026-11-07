## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 2, task 2.3:** access management capabilities.

| Question wording | Answer |
|---|---|
| "best practice for the root user" | **Enable MFA, don't create access keys, use it only for root-only tasks** |
| "task that requires the root user" | Changing account settings/name/email, closing the account, changing the support plan, restoring IAM permissions |
| "grant only the permissions required" | **Principle of least privilege** |
| "add a second factor to sign-in" | **MFA** |
| "manage permissions for many users at once" | **IAM groups** |
| "is IAM Regional?" | No, **global** (and free) |
| "enforce password complexity" | **IAM password policy** |

### Solutions Architect – Associate (SAA-C03)
- Policy evaluation: **explicit Deny > Allow > implicit (default) deny**.
- Requiring MFA with `aws:MultiFactorAuthPresent`.
- Roles instead of access keys for EC2, Lambda and cross-account access.
- IAM Identity Center for workforce access across many accounts.

### Exam traps
- IAM policies **can't** restrict the root user; only SCPs can (for member accounts).
- A password policy doesn't apply to access keys.
- `implicitDeny` (nothing allowed) and `explicitDeny` (a Deny matched) are different, and only the second beats an Allow.
- Creating a user grants **no** permissions and **no** credentials.
