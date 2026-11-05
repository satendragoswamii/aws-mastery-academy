## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1, task 1.2:** Reliability pillar; recover from failure; test recovery procedures.
- **Domain 3, task 3.2:** using **multiple Regions** for disaster recovery and business continuity.
- **Domain 3, task 3.6 (storage):** **S3 Versioning**, S3 Replication, **AWS Backup**, EBS snapshots.

### What the exam expects
| Question wording | Answer |
|---|---|
| "maximum acceptable data loss" | RPO |
| "maximum acceptable downtime" | RTO |
| "lowest cost DR, recovery in hours is acceptable" | Backup and restore |
| "core components running in another Region, scale up when needed" | Pilot light |
| "scaled-down but fully functional copy running" | Warm standby |
| "near-zero downtime, full capacity in multiple Regions" | Multi-site active/active |
| "protect against accidental deletion or overwrite of S3 objects" | S3 Versioning (plus MFA Delete) |
| "centrally manage backups across services" | AWS Backup |
| "copy objects automatically to another Region" | S3 Cross-Region Replication |

### Exam traps
- **Multi-AZ is not DR across Regions.** It protects against an AZ failure only.
- **Replication isn't backup.** It copies deletions and corruption; you need versioning or point-in-time backups too.
- **Pilot light vs. warm standby:** pilot light keeps data replicated with little or no compute running; warm standby keeps a smaller, fully working copy running.
- **S3 Replication requires versioning** on both source and destination buckets.

### Solutions Architect – Associate (SAA-C03)
Expect RPO/RTO-driven choices between Aurora Global Database, DynamoDB global tables, RDS cross-Region replicas, AWS Elastic Disaster Recovery, Route 53 failover routing, and AWS Backup cross-account and cross-Region copies.
