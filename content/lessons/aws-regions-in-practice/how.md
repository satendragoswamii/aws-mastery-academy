## How working across Regions works

### Every request goes to one Regional endpoint
~~~text
On real AWS (no --endpoint-url), each command goes to that Region's endpoint:
[real AWS only] aws --region ap-south-1 sqs list-queues  ->  https://sqs.ap-south-1.amazonaws.com  (only Mumbai's queues)
[real AWS only] aws --region eu-west-1 sqs list-queues   ->  https://sqs.eu-west-1.amazonaws.com   (only Ireland's queues)
[real AWS only] aws iam list-users  (any Region)         ->  https://iam.amazonaws.com             (global, counts as us-east-1)
~~~
The Region in an ARN tells you where a resource lives: `arn:aws:sqs:ap-south-1:ACCOUNT:orders`. Global services leave it empty: `arn:aws:iam::ACCOUNT:user/asha`.

### Choosing a Region: four questions, in order
| # | Question | Example |
|---|---|---|
| 1 | **Compliance:** must data stay in a country or area? | Indian payment data -> an Indian Region |
| 2 | **Latency:** where are the users? | Users in Chennai -> Mumbai or Hyderabad |
| 3 | **Services:** does the Region offer what you need? | A new service may launch in a few Regions first |
| 4 | **Price:** what does it cost there? | Prices differ by Region; N. Virginia is often cheapest |

On real AWS you can check service availability from public Systems Manager parameters (not available in Floci):
~~~text
[real AWS only] aws ssm get-parameters-by-path --region us-east-1 --path /aws/service/global-infrastructure/regions/ap-south-2/services --query 'Parameters[].Value' --output text
[real AWS only] aws ssm get-parameters-by-path --region us-east-1 --path /aws/service/global-infrastructure/services/lambda/regions --query 'length(Parameters)'
~~~

### Copying data between Regions
| Data | One-off copy | Continuous |
|---|---|---|
| S3 objects | `aws s3 cp` / `sync` between buckets | S3 Cross-Region Replication |
| EBS volumes | Snapshot, then `copy-snapshot` in the destination Region | Data Lifecycle Manager cross-Region copy |
| AMIs | `copy-image` in the destination Region | — |
| DynamoDB | Export/import | Global tables |
| Secrets | — | Replica secrets |
| Container images | — | ECR replication |
| RDS / Aurora | Snapshot copy | Cross-Region read replicas, Aurora global database |

Copies of EBS snapshots and AMIs are **made from the destination Region**, naming the source Region (real AWS only; Floci doesn't support EBS snapshots). Data transfer between Regions is **charged** per GB.

### Fencing an account into Regions
~~~text
Deny  NotAction [global services]  when  aws:RequestedRegion  NOT IN [approved Regions]
~~~
- Put it in an **SCP** at the organisation or OU level so even administrators can't bypass it.
- Exempt global services with `NotAction` (IAM, STS, Organizations, CloudFront, Route 53, Support, and others your teams use).
- **Control Tower** offers this as the "Region deny" control.
- Test with `iam simulate-custom-policy` before attaching.

### Opt-in Regions
Regions launched after March 2019 (for example `ap-south-2`) are **disabled by default** and must be enabled per account before use. `describe-regions --filters Name=opt-in-status,Values=opt-in-not-required,opted-in` lists only the enabled ones, which is what the inventory loop uses.
