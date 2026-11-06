## What working with Regions and AZs means

### The simple version
In the last lesson you learned **what** Regions and AZs are. This lesson is about **living with them**: every resource you create sits at a certain level, like things in a city:

- Some things belong to **one building** (an AZ): a server, its hard disk, a subnet.
- Some belong to **the whole city** (a Region): a storage bucket, a queue, a private network.
- A few belong to **the whole country** (global): user accounts and permissions, DNS.

If a building has a power cut, only the things **in that building** stop. So you put copies of important things in **different buildings**.

### The professional version
| Scope | Resources | Fails with… | To survive that failure |
|---|---|---|---|
| **AZ** | EC2 instance, EBS volume, subnet, NAT gateway, RDS instance (single-AZ), ENI | Its AZ | Run copies in 2+ AZs |
| **Region** | VPC, S3 bucket, DynamoDB table, Lambda function, SQS queue, KMS key, EBS snapshot, AMI, security group | Its Region (rare) | Copy/replicate to another Region |
| **Global** | IAM users/roles/policies, Route 53 hosted zones, CloudFront distributions, Organizations | Designed for global resilience | (Managed by AWS) |

Some Regional services are **multi-AZ automatically**: S3 Standard, DynamoDB, SQS, Lambda and EFS (Regional) store or run across several AZs without any extra configuration. For EC2 and RDS, **you** choose the AZs.

### The rules you'll prove in the demo
1. **Choosing a subnet chooses the AZ.** Each default subnet belongs to one AZ.
2. **Spread instances across AZs** for high availability.
3. **An EBS volume only attaches to instances in its own AZ.**
4. **Regions are separate.** Asking another Region's endpoint can't see your resources.

### What you'll build
Two web servers, `ama-l1-web-a` in ap-south-1a and `ama-l1-web-b` in ap-south-1b, and a data volume in ap-south-1b that refuses to attach to the server in the wrong AZ.
