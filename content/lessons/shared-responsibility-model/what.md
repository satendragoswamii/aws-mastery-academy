## What is the shared responsibility model?

### The simple version
Think of renting a flat in a secure building:
- **The building owner** looks after the main gate, the guards, the walls, the lifts, the wiring and the water supply.
- **You** decide who gets a key to your flat, lock your door, keep your valuables in a safe, and don't leave windows open.

If a burglar walks in because you left your door open, that's not the building owner's fault. AWS is the building owner; you're the tenant.

**AWS: security OF the cloud. You: security IN the cloud.**

### The professional version
~~~text
+------------------------------------------------------------------------+
| CUSTOMER: security IN the cloud                                        |
|   Customer data                                                        |
|   Platform, applications, identity and access management               |
|   Operating system, network and firewall configuration                 |
|   Client-side data encryption, data integrity and authentication       |
|   Server-side encryption (file system and/or data)                     |
|   Network traffic protection (encryption, integrity, identity)         |
+------------------------------------------------------------------------+
| AWS: security OF the cloud                                             |
|   Software: compute, storage, database, networking services            |
|   Hardware / AWS global infrastructure: Regions, AZs, edge locations   |
+------------------------------------------------------------------------+
~~~

### The split moves with the service type
The more managed the service, the more AWS takes on, but **your data and who can access it are always yours**.

| Responsibility | EC2 (IaaS) | RDS (managed DB) | Lambda (serverless) | S3 (storage service) |
|---|---|---|---|---|
| Physical data centre, hardware, network | AWS | AWS | AWS | AWS |
| Hypervisor / host OS | AWS | AWS | AWS | AWS |
| Guest OS and its patches | **You** | AWS | AWS | AWS |
| Database engine / runtime patches | **You** | AWS (in your maintenance window) | AWS | n/a |
| Application code | **You** | **You** (schemas, queries) | **You** | n/a |
| Network access (security groups, public or private) | **You** | **You** | **You** (VPC config) | **You** (bucket policy, Block Public Access) |
| IAM: who can do what | **You** | **You** | **You** | **You** |
| Encryption on or off, key choice | **You** | **You** | **You** | **You** |
| Your data, its classification and backups policy | **You** | **You** | **You** | **You** |

### Three kinds of controls
| Type | Meaning | Example |
|---|---|---|
| **Inherited** | AWS does it entirely; you inherit it | Physical and environmental security |
| **Shared** | Both do it, at their own layer | Patching, configuration management, staff training |
| **Customer-specific** | Only you can do it | Data classification, which Regions data may live in |

### What you'll do
On Floci you'll run a small **customer-side security baseline**: find an open SSH rule, set a password policy, turn on EBS encryption by default, block public S3 access for the whole account, and create a Config rule. Each of these is a setting **AWS gives you but doesn't turn on for you**.
