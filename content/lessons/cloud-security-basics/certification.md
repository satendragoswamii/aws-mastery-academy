## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 2: Security and Compliance (30% of the exam)**, the second-largest domain.

| Question wording | Answer |
|---|---|
| "create, manage and control encryption keys" | **AWS KMS** |
| "dedicated, single-tenant hardware security module" | **AWS CloudHSM** |
| "store database credentials and rotate them automatically" | **AWS Secrets Manager** |
| "provision SSL/TLS certificates" | **AWS Certificate Manager (ACM)** |
| "prevent S3 buckets from becoming public" | **S3 Block Public Access** |
| "grant only the permissions required" | **Principle of least privilege** |
| "temporary credentials for an application on EC2" | **IAM role** |
| "record API calls for auditing" | **AWS CloudTrail** |
| "intelligent threat detection" | **Amazon GuardDuty** |
| "download AWS compliance reports (SOC, ISO)" | **AWS Artifact** |
| "protect against DDoS" | **AWS Shield** (Standard is free and automatic) |
| "filter web requests (SQL injection, XSS)" | **AWS WAF** |

### Exam traps
- **Encryption at rest is usually the customer's choice and responsibility** (turning it on, managing key policies); AWS operates KMS itself.
- **KMS vs. CloudHSM:** KMS is managed and multi-tenant; CloudHSM gives you a dedicated HSM for strict compliance.
- **Secrets Manager vs. Parameter Store:** both store secrets; Secrets Manager adds **built-in automatic rotation** (and costs more).
- **Implicit deny vs. explicit deny:** everything not allowed is denied; an explicit Deny beats any Allow.
- **Roles, not access keys, for applications.**

### Solutions Architect – Associate (SAA-C03)
Expect: SSE-S3 vs. SSE-KMS vs. SSE-C; KMS key policies and cross-account access; envelope encryption and S3 Bucket Keys; Secrets Manager rotation for RDS; encrypting an unencrypted RDS database or EBS volume (via an encrypted snapshot copy); and SCPs in AWS Organizations.

### Security – Specialty (SCS-C02)
This lesson is the foundation of its data-protection and identity domains.
