## A shop for India, ready for the world

~~~text
                         users across India and abroad
                                     |
                       Route 53 (global DNS, edge locations)
                                     |
                       CloudFront (edge locations, cached images/CSS/JS)
                                     |
          +------------------- Region ap-south-1 (Mumbai) -------------------+
          |   AZ aps1-az1               AZ aps1-az2               AZ aps1-az3 |
          |   [web/app]                 [web/app]                 [web/app]   |
          |   [DB primary]  -- sync --> [DB standby]                          |
          |   S3 bucket (Regional: stored redundantly across AZs)             |
          +---------------------------------+---------------------------------+
                                            | async backups / replication
          +------------------- Region ap-south-2 (Hyderabad, opt-in) --------+
          |   backups, standby copy for disaster recovery (data stays in India)|
          +-------------------------------------------------------------------+
~~~

### Why each choice
| Decision | Reason |
|---|---|
| Primary Region **ap-south-1** | Users in India: low latency; data residency in India |
| **Three AZs** | Survives the loss of a whole AZ (high availability) |
| DR Region **ap-south-2** | Survives a Region-wide event and keeps data in India (compliance) |
| **CloudFront** | Static content served from edge locations near users; less load on servers |
| **Route 53** | Global DNS; can fail over to Hyderabad with health checks |

### Scope cheat sheet
| Scope | Examples |
|---|---|
| Global | IAM, Route 53, CloudFront, Organizations |
| Regional | S3 buckets, DynamoDB tables, Lambda, VPC, SQS, KMS keys |
| Availability Zone | EC2 instances, EBS volumes, subnets, RDS instances (Multi-AZ adds a standby in another AZ) |
| Edge | CloudFront caches, Route 53 answers, Global Accelerator, Shield |
