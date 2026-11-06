## In the real world

### The public bucket
The single most common cloud data leak: a storage bucket with customer records, made public for a quick test or by a copied policy, and found by automated scanners. Many well-known companies have had incidents like this. AWS responded by turning on **Block Public Access** and disabling ACLs for every new bucket by default (since April 2023). Companies now also turn it on at the **account level** so no bucket can be made public.

### The leaked access key
A developer commits a `.env` file with an access key to a public GitHub repository. Bots scan GitHub constantly; within minutes, the key is used to launch expensive instances for crypto-mining. AWS and GitHub now scan for exposed keys and warn you, but the real fix is to **not have long-term keys at all**: applications use IAM roles, and people sign in through IAM Identity Center with temporary credentials.

### The over-powered application
An application has `AdministratorAccess` "because it was easier". An attacker finds a server-side request forgery (SSRF) bug, steals the instance's temporary credentials, and can now do anything in the account. With a least-privilege role, the same bug would expose only one bucket.

### How a bank does it
- Every data set has its own **customer managed KMS key**, and key policies separate who can use a key from who can manage it.
- **Service Control Policies** stop anyone, even administrators, from turning off CloudTrail or using unapproved Regions.
- Database passwords live in **Secrets Manager** with automatic rotation every 30 days.
- **GuardDuty** and **Security Hub** are on in every account; findings go to the security team's queue.
- Auditors receive **AWS Artifact** reports for AWS's side, and CloudTrail evidence for the bank's side.
