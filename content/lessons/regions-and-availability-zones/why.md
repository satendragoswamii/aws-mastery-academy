## Why this matters

### AZs fail; designs shouldn't
An AZ is a group of data centres. Power, cooling, networking or software problems occasionally affect one AZ. If everything you run is in that AZ, you're down. If you run in two or three AZs behind a load balancer, users may not even notice.

### Scope decides your recovery plan
Knowing a resource's scope tells you what you must do to protect it:
- **EC2 instance (AZ):** run another one in another AZ; use Auto Scaling.
- **EBS volume (AZ):** take snapshots (Regional) so you can rebuild in another AZ; or use EFS/S3 if data must be shared.
- **RDS (AZ):** turn on Multi-AZ for a standby in another AZ.
- **S3, DynamoDB (Regional, multi-AZ inside):** already AZ-resilient; replicate to another Region only for Regional disasters.

### "Where did my server go?"
Many beginner problems are scope problems: the console is showing a different Region, a volume won't attach because it's in a different AZ, or a security group can't be found because it belongs to another VPC.

### Cost and latency trade-offs
Multi-AZ isn't free. You pay for capacity in each AZ, and for **data moving between AZs**. Latency between AZs is low (typically a few milliseconds or less) but not zero. Good designs keep chatty traffic inside an AZ where possible, and spread for resilience where it matters.

## Why this matters for you
"Deploy across multiple AZs" is the answer to a large number of exam questions about availability. Knowing **which** resources are AZ-bound (and that EBS is) separates people who've memorised definitions from people who've built things.
