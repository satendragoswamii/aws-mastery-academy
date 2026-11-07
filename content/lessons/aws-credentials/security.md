## Security and best practices

### The rules
1. **Prefer temporary credentials everywhere:** IAM Identity Center for people, roles for workloads, OIDC for CI/CD.
2. **Never create root user access keys.** If any exist, delete them. Protect root with a strong password and MFA, then lock it away.
3. **If an IAM user needs an access key**, give it least-privilege permissions, rotate it (commonly at least every 90 days), and delete it when no longer used.
4. **Require MFA** for every human sign-in; for sensitive roles, add `aws:MultiFactorAuthPresent` conditions or `mfa_serial` in profiles.
5. **Keep role sessions short** and give roles a clear trust policy (who may assume) and narrow permissions (what they may do).

### Handling secrets
- A secret access key is shown **once**. Store it directly where it is needed (as in step 2), never in chat, email, tickets, screenshots or Git.
- Keep `~/.aws/credentials` readable only by you (`chmod 600`).
- Don't pass keys on the command line or in `export` lines that end up in shell history.
- For applications that need other secrets (database passwords, API tokens), use **Secrets Manager** or **Parameter Store**, not files.

### If a key leaks
1. **Deactivate** it immediately (`update-access-key --status Inactive`), then delete it.
2. Check **CloudTrail** for everything done with that key ID; look for new users, keys, roles and instances.
3. For a leaked **temporary** credential, revoke role sessions (the IAM console's "Revoke active sessions" adds a deny for sessions issued before now).
4. Find out how it leaked and fix that path.

AWS also scans public repositories for leaked keys and may notify you and attach a quarantine policy to the key.

### Auditing
- The **credential report** shows users without MFA and stale passwords and keys.
- **IAM Access Analyzer** finds unused access, roles and keys.
- **AWS Config** rules such as `access-keys-rotated` and `iam-root-access-key-check` flag violations automatically.

### The academy's own safety rules
This lab used profile files inside the lab folder, cleared credential variables, ran the role profile with `HOME="$PWD"` so the credential cache stayed in the lab folder, and put `endpoint_url` in every profile, because a role profile's automatic AssumeRole call **does not use `--endpoint-url`**. Secrets were never printed.
