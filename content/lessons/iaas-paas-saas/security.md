## Security and best practices

### Responsibility follows the service model
This is the **shared responsibility model** applied per service. It has its own lesson later in this level, and you'll use it constantly:

| Security task | EC2 (IaaS) | RDS (managed) | DynamoDB / Lambda (serverless) | SaaS |
|---|---|---|---|---|
| Physical data centre, hardware | AWS | AWS | AWS | Provider |
| Guest OS patching | **You** | AWS | AWS | Provider |
| Database engine patching | **You** | AWS (in your maintenance window) | AWS | Provider |
| Network access rules (security groups etc.) | **You** | **You** | **You** (IAM policies; network for some) | Provider + your settings |
| Encryption settings | **You** | **You** choose; AWS implements | **You** choose; AWS implements | Varies |
| Who can access the data (IAM, users) | **You** | **You** | **You** | **You** |
| The data itself | **You** | **You** | **You** | **You** |

> **The last rows never move.** No service model makes data access or data quality the provider's problem.

### Common mistakes by model
- **IaaS:** unpatched OS, SSH open to the whole internet, database running as an admin user, no backups.
- **Managed:** databases made publicly accessible "for testing", default master passwords, backups with too short a retention period.
- **Serverless:** functions given far broader permissions than they need (`dynamodb:*` on `*`), secrets stored in code.
- **SaaS:** no MFA, ex-employees still active, oversharing settings (public links to documents).

### Best practices
1. **Prefer the most managed option that meets the requirements.** Fewer layers to secure means fewer mistakes.
2. **Least privilege everywhere.** Grant only the actions and resources needed, e.g. `dynamodb:GetItem` and `dynamodb:PutItem` on one table, not `dynamodb:*`.
3. **Turn on what the managed service offers**: encryption, automated backups, deletion protection, point-in-time recovery.
4. **On IaaS, automate the boring parts**: patching (AWS Systems Manager Patch Manager), hardened images, no long-lived SSH keys (use Systems Manager Session Manager).
5. **For SaaS, manage identities centrally**, with single sign-on and MFA, and remove leavers promptly.
6. **Clean up lab resources.** You terminated the instance and deleted the table in the demo.
