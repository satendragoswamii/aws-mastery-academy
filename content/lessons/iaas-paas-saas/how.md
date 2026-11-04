## How each model works on AWS

Let's follow one requirement, **"we need a database for our online shop's orders"**, through every model.

### On-premises
Buy a server, install Linux, install PostgreSQL, configure storage, set up backups to tape or another disk, build a standby server for failover, patch everything monthly, and replace the hardware in five years.

### IaaS: Amazon EC2
1. Choose an **AMI** (operating system image) and an **instance type** (size).
2. Launch the instance in a VPC subnet, attach an EBS volume for data.
3. Connect to it and **install PostgreSQL yourself**.
4. Configure backups (EBS snapshots or database dumps), monitoring and OS patching.
5. For high availability, build and maintain a replica in another AZ yourself.

AWS runs the hardware, the hypervisor and the data centre. **Everything inside the instance is yours.**

### PaaS / managed: Amazon RDS
1. Choose the engine (PostgreSQL), version, instance size and storage.
2. Tick **Multi-AZ** for a standby in another AZ with automatic failover.
3. Set a backup retention period and a maintenance window.
4. Connect your application.

AWS installs, patches and backs up the database and handles failover. You manage **schema, queries, users and data**, and still choose the size.

### Serverless: Amazon DynamoDB (on-demand)
1. Create a table with a **key** (e.g. `orderId`).
2. Choose **on-demand** (pay-per-request) capacity.
3. Read and write items through the API.

No instance to size, no engine version to upgrade, no maintenance window. Storage grows automatically, and you pay per request plus per GB stored. You manage your **data model, access and data**. You'll do exactly this in the demo.

### SaaS
For the orders themselves, there's no direct "SaaS database". But the shop might use a SaaS e-commerce platform where orders are simply stored for it. Then it manages nothing technical at all, only its products, settings and customer data.

### Same need, different jobs
| Task | EC2 (IaaS) | RDS (managed) | DynamoDB (serverless) | SaaS shop platform |
|---|---|---|---|---|
| Choose server size | You | You | — | — |
| Install database software | You | AWS | AWS | Provider |
| Patch OS and engine | You | AWS | AWS | Provider |
| Backups | You | AWS (automated, you set retention) | AWS (you enable point-in-time recovery) | Provider |
| High availability | You build it | Tick Multi-AZ | Built in (multi-AZ) | Provider |
| Data model, access control, data | You | You | You | You (data and users) |

> **Choosing a model is choosing the right row of responsibilities**, not just a product name.

### Spotting the model of an AWS service
Ask: **"Do I see or size servers? Do I patch anything?"**
- See servers and patch the OS → IaaS (EC2).
- Choose an instance size, but AWS patches → managed/PaaS (RDS, ElastiCache, Elastic Beanstalk).
- No servers at all, pay per use → serverless (Lambda, DynamoDB on-demand, S3, SQS, SNS).
- Use a finished application → SaaS (WorkMail, Amazon Connect, Amazon QuickSight).
