## How disaster recovery works on AWS

### Layer 1: protect against bad changes (history)
| Tool | What it protects | How |
|---|---|---|
| **S3 Versioning** | Objects overwritten or deleted | Keeps every version; a delete just adds a *delete marker* |
| **S3 Object Lock** | Objects against deletion by anyone, including attackers, for a set period | Write-once-read-many (WORM) retention |
| **DynamoDB on-demand backups** | Whole tables | Full backups you create and keep until you delete them |
| **DynamoDB point-in-time recovery (PITR)** | Tables, to any second in the last 35 days | Continuous backups |
| **RDS automated backups and snapshots** | Databases | Daily snapshots plus transaction logs (point-in-time restore) |
| **EBS snapshots** | Server disks | Incremental copies stored in S3 |
| **AWS Backup** | All of the above, centrally | One backup policy across services, accounts and Regions, with vaults and locks |

### Layer 2: protect against losing a location (distance)
| Tool | How it moves data to another Region |
|---|---|
| **S3 Replication** (Cross-Region Replication) | Automatically copies new objects to a bucket in another Region |
| **Copying backups** | AWS Backup, RDS and EBS snapshots can be copied to other Regions |
| **DynamoDB global tables** | Multi-Region, multi-active replication |
| **Aurora Global Database** | Replication to other Regions, typically within about a second |
| **RDS cross-Region read replicas** | Asynchronous replica, promotable in a disaster |

### Layer 3: be able to rebuild (automation)
- **Infrastructure as Code** (AWS CloudFormation, Terraform) recreates networks, servers and permissions in the recovery Region.
- **Pre-built images** (AMIs, container images) copied to the recovery Region.
- **DNS failover** with Amazon Route 53 health checks moves users to the recovery Region.
- **AWS Elastic Disaster Recovery** continuously replicates servers (including on-premises ones) and can launch them in AWS within minutes.

### How each strategy fits together
~~~text
BACKUP & RESTORE   Region A: full system    Region B: [backups only]
                   disaster -> deploy everything in B from IaC, restore data -> hours

PILOT LIGHT        Region A: full system    Region B: [replicated database] (servers off)
                   disaster -> start servers, scale up, switch DNS -> tens of minutes

WARM STANDBY       Region A: full system    Region B: [small full copy, running]
                   disaster -> scale up B, switch DNS -> minutes

ACTIVE/ACTIVE      Region A: full system    Region B: [full system]  both serving
                   disaster -> DNS stops sending users to A -> seconds to minutes
~~~

### The DR runbook
A DR plan isn't just technology. It needs a written **runbook**:
1. **Detect and declare**: who decides it's a disaster, and how?
2. **Fail over**: exact steps, in order, with commands.
3. **Verify**: how do we know the recovered system works and the data is right?
4. **Communicate**: customers, staff, regulators.
5. **Fail back**: return to the primary when it's healthy.

### Test it
**An untested backup is a hope.** Regularly restore backups into a test environment, measure how long it takes (your **real** RTO) and how much data you'd lose (your **real** RPO). The demo does exactly this, in miniature.
