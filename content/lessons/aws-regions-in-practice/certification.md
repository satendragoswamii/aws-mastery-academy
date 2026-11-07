## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.2:** AWS global infrastructure, and the factors for choosing a Region.

| Question wording | Answer |
|---|---|
| "factors to consider when selecting a Region" | **Compliance/data residency, latency (proximity to users), service availability, pricing** |
| "keep data in a specific country" | **Choose a Region in that country** (data stays where you put it) |
| "which service is global?" | **IAM** (also CloudFront, Route 53, Organizations) |
| "which is Regional?" | EC2, RDS, Lambda, DynamoDB, SQS… |
| "S3 bucket names must be…" | **Globally unique** |

### Solutions Architect – Associate (SAA-C03)
- Disaster-recovery strategies: backup and restore, pilot light, warm standby, multi-site active/active.
- Cross-Region features: S3 CRR, DynamoDB global tables, Aurora global database, RDS cross-Region read replicas, EBS snapshot and AMI copies, ECR replication, Secrets Manager replicas, **multi-Region KMS keys**.
- Restricting Regions with an **SCP and `aws:RequestedRegion`**, exempting global services.
- Route 53 failover and latency-based routing between Regions.
- Data transfer **between Regions costs money**; within one AZ it is usually free.

### Exam traps
- A KMS key is **Regional**; replicated encrypted data needs a multi-Region key or re-encryption.
- AMIs and snapshots are Regional; copy them **before** you need them in another Region.
- IAM changes apply to **all Regions** immediately (IAM is global).
- `aws:RequestedRegion` for IAM, STS (global endpoint) and CloudFront is `us-east-1`, which is why they need exemptions.
