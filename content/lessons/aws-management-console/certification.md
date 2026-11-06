## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.1: Define methods of deploying and operating in the AWS Cloud.**

| Question wording | Answer |
|---|---|
| "web-based interface to access and manage AWS services" | **AWS Management Console** |
| "browser-based shell with the AWS CLI pre-authenticated" | **AWS CloudShell** |
| "manage AWS services from a terminal / automate with scripts" | **AWS CLI** |
| "access AWS from application code" | **AWS SDKs** |
| "provision resources repeatably from templates" | **Infrastructure as code** (CloudFormation, CDK) |
| "view resources and alarms on a phone" | **AWS Console Mobile Application** |
| "find and tag resources across Regions" | **Resource Groups & Tag Editor** |
| "programmatic access needs…" | **Access keys** (or temporary credentials), not a console password |

### Exam traps
- **Console access** uses a password (+ MFA); **programmatic access** uses access keys or temporary credentials. They're configured separately for IAM users.
- The console uses the **same APIs** and **same IAM permissions** as the CLI.
- CloudShell is **free** (you pay only for resources you create) and uses your console credentials.
- "One-time" or "visual" → console; "repeatable" or "automated" → CLI, SDK, IaC.

### Associate exams
Assume console familiarity; questions focus on automation instead (IaC, pipelines, Systems Manager), often with "least operational overhead" meaning *not* manual console work.
