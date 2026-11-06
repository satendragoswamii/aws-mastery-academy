## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 2, task 2.1: Understand the AWS shared responsibility model.** Expect several questions.

| Question wording | Answer |
|---|---|
| "physical security of data centres" | **AWS** |
| "patching the guest OS on EC2" | **Customer** |
| "patching the database engine on RDS" | **AWS** (in your maintenance window) |
| "patching the underlying infrastructure for Lambda" | **AWS** |
| "configuring security groups / NACLs" | **Customer** |
| "IAM users, groups, roles and policies" | **Customer** |
| "encrypting data at rest / choosing encryption" | **Customer** (AWS provides the tools) |
| "decommissioning storage devices" | **AWS** |
| "network infrastructure / hypervisor" | **AWS** |
| "patch management, configuration management, awareness and training" | **Shared controls** |
| "where to get AWS compliance reports (SOC, ISO, PCI)" | **AWS Artifact** |
| "customer data" | **Always the customer** |

### Exam traps
- **The split depends on the service.** On EC2 the OS is yours; on RDS and Lambda it's AWS's.
- **"AWS is responsible for security of the cloud"**: memorise "OF" (AWS) vs. "IN" (customer).
- **Data, identity and access are always the customer's**, on every service.
- **Shared controls** appear in both columns: patching, configuration management, training.

### Associate and Security exams
They assume this model and test it indirectly. For example, "which design reduces operational overhead for patching?" (move to a managed service), or "how do you prove encryption compliance?" (AWS Config rules, CloudTrail, KMS).
