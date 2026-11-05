## A practical DR design for an Indian business

Primary Region **Mumbai (ap-south-1)**, recovery Region **Hyderabad (ap-south-2)**, so data stays in India.

### Option A: backup and restore (lowest cost)
~~~text
 Mumbai (primary)                                   Hyderabad (recovery)
+--------------------------------------+          +--------------------------------------+
| ALB -> web/app (multi-AZ ASG)         |          |                                      |
| DynamoDB (PITR on)  ----- backups ------------->  | AWS Backup vault (copies)            |
| S3 (versioning on)  ----- replication --------->  | S3 bucket (versioning on)            |
| AMIs, IaC templates ----- copied -------------->  | AMIs, IaC templates                  |
+--------------------------------------+          +--------------------------------------+
Disaster: deploy stack in Hyderabad from IaC, restore tables, point DNS there.
RPO: minutes for S3 (replication) and hours for daily table backups (less with frequent backup copies). RTO: hours.
~~~

### Option B: pilot light
~~~text
 Mumbai (primary)                                   Hyderabad (recovery)
+--------------------------------------+          +--------------------------------------+
| ALB -> web/app (multi-AZ ASG)         |          | ASG with desired capacity 0          |
| Aurora primary  ------- global DB ------------->  | Aurora secondary (read-only)         |
| S3  ------------------- replication ---------->  | S3                                   |
+--------------------------------------+          +--------------------------------------+
        ^                                                          ^
        +------ Route 53 failover routing (health check on Mumbai) -+
Disaster: promote the Aurora secondary, raise the ASG to normal size, Route 53 fails over.
RPO: seconds. RTO: tens of minutes.
~~~

### What every option needs
| Requirement | Why |
|---|---|
| **Versioning or point-in-time backups** | Replication alone copies mistakes and ransomware |
| **Backups in a separate account** (with restricted access) | A compromised production account can't delete them |
| **Locked backup vaults / Object Lock** | Even an administrator can't delete backups before their retention ends |
| **Everything as code** | Rebuilding by hand under pressure is slow and error-prone |
| **Regular, measured restore tests** | Proves your real RPO and RTO |

### Choosing
| Business need | Strategy |
|---|---|
| Internal tools; a day's downtime is acceptable | Backup and restore |
| Customer-facing; an hour of downtime acceptable, little data loss | Pilot light |
| Revenue-critical; minutes of downtime | Warm standby |
| Payments, global services; effectively no downtime | Multi-site active/active |
