## What does "working with Regions" mean?

### The simple version
AWS is like a chain of warehouses in different cities. When you store something, you choose the **city**. If you later look in another city's warehouse, it isn't there. A few things, like the **staff list** (IAM), are shared by the whole company and work everywhere.

~~~text
                     ONE AWS ACCOUNT
   +--------------------+         +--------------------+
   | ap-south-1 Mumbai  |         | eu-west-1 Ireland  |
   | queue "orders"     |         | queue "orders"     |   <- same name, two separate queues
   | table "stock"      |         |                    |
   | bucket "menus-mum" |         | bucket "menus-dub" |   <- bucket names are unique worldwide
   +--------------------+         +--------------------+
   Global: IAM users and roles, CloudFront, Route 53, Organizations
~~~

### The professional version
Earlier lessons explained what Regions and Availability Zones are. This lesson is about **operating** across them:

| Task | What you need to know |
|---|---|
| Point every command at the right Region | `--region`, `AWS_REGION`, profiles (CLI lesson) |
| Know which services are Regional or global | ARNs show it: `arn:aws:sqs:ap-south-1:…` vs. `arn:aws:iam::…` |
| Find resources anywhere in the account | Loop over enabled Regions; Resource Explorer; AWS Config aggregators |
| Choose a Region | Compliance, latency, service availability, price |
| Move or copy data | S3 copy/replication, snapshot and AMI copies, DynamoDB global tables |
| Prepare a second Region | Replica secrets, multi-Region KMS keys, image replication |
| Stop use of other Regions | `aws:RequestedRegion` deny policies, usually SCPs |

### Regional, global, and in between
| Category | Examples |
|---|---|
| **Regional** | EC2, VPC, EBS, SQS, SNS, DynamoDB, Lambda, RDS, KMS, Secrets Manager, CloudWatch |
| **Global** | IAM, Organizations, CloudFront, Route 53, WAF for CloudFront, AWS Support |
| **Regional data, global names** | S3 (each bucket in one Region; names unique worldwide) |
| **Global by default, Regional endpoints available** | STS (use the Regional endpoint for lower latency and resilience) |

### What you'll do
Create look-alike resources in two Regions, see global and Regional services side by side, write an all-Regions inventory, copy a file between Regions, replicate a secret and an encryption key to a disaster-recovery Region, and test a policy that keeps everything in India.
