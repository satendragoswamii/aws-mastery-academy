## A two-Region design for an Indian shop

~~~text
                Route 53 (global): health checks + failover routing
                    |                                        |
                    v                                        v
ap-south-1 Mumbai (PRIMARY)                     ap-south-2 Hyderabad (STANDBY)
---------------------------                     ------------------------------
ALB -> app servers in 3 AZs                     small app fleet, or scaled to 0
DynamoDB table             -- global table -->  replica table
S3 bucket                  -- replication  -->  replica bucket
Secrets Manager secret     -- replica      -->  replica secret
KMS key (mrk-)             -- replica key  -->  replica key
ECR repository             -- replication  -->  copy of images

Global: IAM roles and policies, CloudFront, Route 53, Organizations SCP (India-only Regions)
~~~

### Disaster-recovery strategies (cheapest to fastest)
| Strategy | Second Region holds | Recovery time |
|---|---|---|
| Backup and restore | Backups only | Hours |
| Pilot light | Data replicated, servers off | Tens of minutes |
| Warm standby | Data replicated, small running copy | Minutes |
| Multi-site active/active | Full copies serving traffic | Near zero |

### Governance across Regions
| Need | Tool |
|---|---|
| Only approved Regions | SCP with `aws:RequestedRegion` (Control Tower Region deny) |
| See everything in every Region | AWS Resource Explorer, AWS Config aggregator, Cost Explorer grouped by Region |
| Logs from all Regions in one place | An organisation CloudTrail trail (multi-Region by default) |
| Threat detection everywhere | GuardDuty enabled in every Region, including unused ones |

### Practical habits
- Put the Region in every script and profile; never rely on a default.
- Use the **same Region** for an application and its data, to avoid latency and transfer charges.
- Name resources so the Region is obvious when it matters (`menus-mumbai`).
- Turn on security services (CloudTrail, GuardDuty, Config) in **all** Regions, even unused ones, so misuse there is noticed.
