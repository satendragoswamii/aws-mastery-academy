## In the real world

### "The backups were running. The restores didn't work."
A recurring story: a company backs up faithfully for years. Disaster strikes; they try to restore and discover the backups were incomplete, corrupted, missing a critical database, or would take three days to restore. **Restore testing** is the only cure.

### Ransomware
Attackers increasingly target backups first: they gain admin access, delete or encrypt backups, then encrypt production. Defences:
- Backups in a **separate AWS account** that production admins can't touch.
- **AWS Backup Vault Lock** or **S3 Object Lock**, so nobody can delete backups before their retention ends.
- **Versioning** with old versions kept for long enough to go back before the infection started.

### A deleted table
An engineer runs a clean-up script against the wrong environment and deletes a production DynamoDB table. Because **PITR** was on, the team restores the table to one minute before the deletion. The RTO is the restore time plus the time to point the application at the restored table. That's why restore procedures should be practised **before** they're needed.

### Regional events
Cloud providers occasionally have Region-wide problems affecting a service. Companies with a tested **pilot light** or **warm standby** shift users to another Region. Those with only Multi-AZ wait for the Region to recover. For many businesses, waiting is acceptable; the important thing is that the choice was made **deliberately**, with known RPO and RTO.

### Data residency and DR
Indian regulations may require certain data to stay in India. AWS's two Indian Regions (Mumbai and Hyderabad) make in-country multi-Region DR possible. Choosing a recovery Region outside the country could break compliance.

### On the job
- Agree RPO and RTO per system with the business owners.
- Configure AWS Backup plans, cross-Region copies and vault locks.
- Write and rehearse runbooks; run "game days" that restore real backups.
- Report real, measured RPO/RTO, not hoped-for values.
