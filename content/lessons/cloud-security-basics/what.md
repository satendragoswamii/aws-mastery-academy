## What is cloud security?

### The simple version
Cloud security means making sure that **only the right people and programs can do the right things to your data and systems**, and that you notice when something goes wrong.

Think of a jewellery shop:
- **Who gets in:** staff have keys, customers don't get into the back room. (Identity and access.)
- **Walls and doors:** the safe is in a locked room, behind a locked front door. (Network controls.)
- **The safe itself:** even if someone gets into the room, the jewels are in a safe that needs a combination. (Encryption.)
- **Cameras:** everything that happens is recorded. (Logging and monitoring.)

Cloud security uses the same four ideas, implemented as AWS services and settings.

### The professional version
Cloud security is the set of policies, controls and services that protect the **confidentiality, integrity and availability** (the CIA triad) of data and workloads running in the cloud. In AWS it's organised around:

| Area | What it controls | Main AWS services |
|---|---|---|
| Identity and access management | Who can call which API on which resource | IAM, IAM Identity Center, Organizations |
| Infrastructure protection | Which network traffic can reach what | VPC, security groups, NACLs, AWS WAF, Shield |
| Data protection | Encryption at rest and in transit, key and secret handling | KMS, Secrets Manager, ACM, S3 Block Public Access |
| Detection | Recording and spotting suspicious activity | CloudTrail, GuardDuty, Security Hub, Config |
| Incident response | Containing and recovering from problems | Automation, backups, runbooks |

### The CIA triad
| Letter | Means | Example threat | Example control |
|---|---|---|---|
| **C**onfidentiality | Only authorised parties can read it | A public S3 bucket leaks customer data | Block Public Access, encryption, IAM |
| **I**ntegrity | Data isn't changed without detection | An attacker edits prices in the database | Least privilege, versioning, checksums, logging |
| **A**vailability | It works when needed | A DDoS attack takes the shop offline | Multi-AZ, backups, Shield |

### Security is shared
You learned in the shared responsibility model (coming up in AWS foundations) that AWS secures the cloud (data centres, hardware, the hypervisor) and **you** secure what you put **in** the cloud: your IAM users and policies, your network rules, your encryption choices and your data. This lesson is about your half.

### What you'll build
A locked-down **records store** for the shop:
1. An encryption key in **KMS**, used to encrypt a card reference by hand.
2. An S3 bucket with **Block Public Access** and **default encryption**, and proof that a public policy is refused.
3. A read-only **IAM** user with a least-privilege policy, checked with the policy simulator.
4. The database password stored in **Secrets Manager**, encrypted with your key.
