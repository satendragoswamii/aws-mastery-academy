## Multi-AZ web tier with AZ-aware storage

~~~text
Region ap-south-1
+-----------------------------------------------------------------------------+
|   Application Load Balancer (Regional, nodes in every enabled AZ)           |
|          |                          |                         |             |
|   AZ ap-south-1a             AZ ap-south-1b            AZ ap-south-1c       |
|   [web-a] + EBS (1a)         [web-b] + EBS (1b)        [web-c] + EBS (1c)   |
|   [NAT gw a]                 [NAT gw b]                [NAT gw c]           |
|          \__________________________|_________________________/             |
|                 shared data: EFS (Regional, mounts in every AZ)            |
|                 objects: S3 (Regional, stored across 3+ AZs)               |
|                 sessions: DynamoDB (Regional, multi-AZ automatically)      |
|   EBS snapshots + AMIs (Regional) -> rebuild any server in any AZ          |
+-----------------------------------------------------------------------------+
              | copy-snapshot / S3 replication / AWS Backup copy
              v
Region ap-south-2 (disaster recovery)
~~~

### Design rules shown
| Rule | Where |
|---|---|
| Compute in every AZ, behind a load balancer | web-a, web-b, web-c |
| AZ-bound disks only for data that one server owns | EBS per server |
| Shared data in Regional, multi-AZ services | EFS, S3, DynamoDB |
| Per-AZ copies of AZ-scoped infrastructure | one NAT gateway per AZ (so one AZ failing doesn't cut the others off) |
| Regional backups so any AZ can rebuild | snapshots, AMIs |
| Another Region only for Regional disasters | ap-south-2 |

### Anti-pattern
~~~text
[web-a in 1a] [web-b in 1a] [database in 1a]   <- "two servers" but one AZ: a single AZ failure stops everything
~~~
