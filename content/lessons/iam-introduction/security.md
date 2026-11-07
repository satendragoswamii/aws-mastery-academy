## Security and best practices

### Root user
- Enable **MFA** (ideally a passkey or hardware key) the day the account is created.
- **No access keys** for root, ever. The credential report (lesson 24) shows whether any exist.
- Use a group email address that more than one trusted person can reach, so recovery doesn't depend on one person.
- Use root only for root-only tasks: changing account settings, closing the account, some billing tasks, restoring IAM access.

### People
- Prefer **IAM Identity Center** with your company login; use IAM users only when you must.
- Require **MFA for everyone**, and protect destructive actions with `aws:MultiFactorAuthPresent` (step 6).
- Set a **password policy**, and force a reset at first sign-in so administrators never know users' passwords.
- Give permissions through **groups** and remove people promptly when they leave.

### Applications
- Use **roles** (temporary credentials), not access keys in code or config files.
- If keys are unavoidable, rotate them (lesson 24) and never commit them to Git.

### Least privilege
- Start from nothing (the default deny) and add what is needed. `ReadOnlyAccess` and `AdministratorAccess` are convenient but broad.
- Use **explicit Deny** guardrails for things that must never happen, because they can't be overridden by mistake.
- Review unused permissions with **IAM Access Analyzer** and last-accessed information.

### Protect MFA seeds
A virtual MFA seed is as secret as a password: anyone with it can generate valid codes. In step 4 the seed file was `chmod 600`, never printed, and deleted in step 7.

### The academy's own safety rules
Every command used `--endpoint-url http://localhost:4566`. The password was a made-up lab value, and all users, devices, the alias and the password policy were removed at the end.
