## Security and best practices

### Rules to live by
1. **Protect the root user.** Turn on MFA, delete its access keys, and use it only for the few tasks that require it.
2. **No long-term keys where you can avoid them.** Applications use **IAM roles**; people use **IAM Identity Center** (temporary credentials) and MFA.
3. **Least privilege, always.** Start with nothing and add specific actions on specific resources. Check with the policy simulator or IAM Access Analyzer.
4. **Encrypt everything at rest and in transit.** It's usually one setting. Use customer managed KMS keys where you need control, rotation and separation of duties.
5. **Keep data private by default.** Account-level S3 Block Public Access on; databases in private subnets.
6. **Never put secrets in code, images or Git.** Use Secrets Manager (or Parameter Store SecureString) and fetch at runtime.
7. **Log and watch.** CloudTrail in every Region, GuardDuty on, alerts on root sign-in and policy changes.
8. **Automate checks.** AWS Config rules and Security Hub find drift (a bucket made public, an unencrypted volume) automatically.

### KMS key safety
- Turn on **automatic key rotation** for customer managed keys (yearly by default): new key material, same key ID, old data still decrypts.
- Restrict `kms:ScheduleKeyDeletion` to a few administrators. Deleting a key makes its data unrecoverable. Prefer **disabling** a key first.

### In this lab
- Everything you created starts with `ama-l1-`, and the clean-up removes it.
- The "password" in step 8 is a fake example. Never use a real password in a lab or a lesson.
- Floci doesn't enforce IAM, so **don't rely on Floci to test whether a policy blocks something**; use the simulator, and remember real AWS will be stricter.
