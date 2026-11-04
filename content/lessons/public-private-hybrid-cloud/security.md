## Security and best practices

### Each model shifts responsibility differently
| | Public cloud | Private cloud | Hybrid |
|---|---|---|---|
| Physical security, hardware | Provider | You | Both, per side |
| Virtualisation layer | Provider | You | Both |
| OS, apps, data, identity | You | You | You, consistently across both |

Hybrid has the **largest attack surface**: two environments plus the connection between them. Security must be consistent on both sides, or attackers will use the weaker one to reach the stronger.

### Securing the link
- **Site-to-Site VPN** is encrypted (IPsec) but runs over the internet.
- **Direct Connect** is private, but **not encrypted by default**. For sensitive traffic, add encryption (for example, MACsec on supported connections, or a VPN over Direct Connect).
- Only allow the routes and ports that are really needed between the two sides. A flat network where everything reaches everything spreads ransomware.

### Securing backups (the demo pattern)
1. **Don't mirror deletions** into backups (`--delete`), as you saw in step 5.
2. **Turn on versioning** in real S3, so overwritten or deleted objects can be recovered, and consider **Object Lock** (write-once-read-many) to protect against ransomware.
3. **Encrypt** data at rest (S3 encrypts new objects by default) and in transit (HTTPS, which the CLI uses).
4. **Never back up secrets** carelessly. Exclude `.env` files, private keys and credential files with `--exclude`.
5. **Separate the backup's credentials** from the production credentials, so an attacker who controls the office server can't also delete the backups.
6. **Test restores**, not only backups.

### Identity
Use **one identity source** for both sides (federation), enforce **MFA**, and give people the least access they need. Shared admin passwords across on-prem and cloud are a classic breach path.
