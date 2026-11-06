## Security and best practices

### Protect the root user (every account)
1. **Strong, unique password** and **MFA** (preferably a hardware key or passkey).
2. **No access keys** for root, ever.
3. Use root only for **root-only tasks** (e.g. changing the account's root email, closing the account, some billing settings, restoring IAM permissions if locked out).
4. Keep the root email address on a **distribution list** the company controls, not one person's inbox.
5. In an organization, AWS lets you **centrally manage root access** for member accounts and remove their root credentials.

### Organization-level guardrails (SCPs)
- Deny `organizations:LeaveOrganization`.
- Deny disabling or deleting CloudTrail, Config and GuardDuty.
- Deny unapproved Regions (with exceptions for global services).
- Deny creating IAM users with access keys in workload accounts, if you use Identity Center.
- Test SCPs on a sandbox OU first: a bad deny can lock out everyone.

### Keep the management account clean
SCPs don't apply to it, and it controls everything. **Run no workloads there**, give access to very few people, and monitor it closely.

### Separate duties with accounts
Logs go to a **log-archive** account that workload administrators can't modify. Security tooling runs in its **own** account. A breach of `shop-prod` then can't erase its own evidence.

### In this lab
- The account emails use `example.com`, a reserved domain; never use real addresses in labs.
- Floci doesn't enforce SCPs, so **test real guardrails in a real sandbox OU** before trusting them.
