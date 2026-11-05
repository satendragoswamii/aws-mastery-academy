## Security and best practices

### Backups are a prime target
Attackers know backups are the way out of ransomware, so they try to destroy them first. Protect them as carefully as production:

1. **Separate account.** Store backup copies in a dedicated AWS account. Production administrators, and anyone who steals their credentials, can't delete them.
2. **Immutability.** Use **AWS Backup Vault Lock** or **S3 Object Lock** so backups can't be deleted or changed before their retention period ends, by anyone.
3. **Encryption.** Encrypt backups with AWS KMS keys, and make sure the keys are available in the recovery Region and account. A backup you can't decrypt is useless.
4. **Least privilege.** Very few people need `DeleteBackup`, `DeleteObjectVersion` or permission to change retention.
5. **MFA Delete** (S3) adds a second factor before versions can be permanently deleted or versioning suspended.

### Versioning has a cost and a privacy side
- Every version is stored and **billed**. Use **lifecycle rules** to expire non-current versions after an appropriate time.
- Deleting personal data on request (for example under privacy laws) means deleting **all versions and backups** too, within your retention policy.

### The DR plan is sensitive
Runbooks contain architecture details, account IDs and procedures. Store them securely, but make sure they're reachable **during** a disaster (not only in the Region that just failed).

### Lab habits
- The `--source-region` incident in step 11 is a reminder: always know **where** a command is going.
- You cleaned up every version, the backup and both buckets. Leftover backups are both a cost and a data-protection risk.
