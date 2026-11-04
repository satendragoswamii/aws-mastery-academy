## Security and best practices

### Physical security is AWS's job
Under the **shared responsibility model**, everything about the buildings is AWS's responsibility: perimeter, guards, access control, CCTV, environmental protection, and secure destruction of storage media. **You can't visit an AWS data centre**, and AWS doesn't publish exact addresses. Secrecy and restricted access are security controls in their own right.

### How you prove it to an auditor: AWS Artifact
Your auditor will still ask, "How do you know the data centre is secure?" The answer is **AWS Artifact**, a self-service portal in the AWS Console where you can download AWS's independent audit reports and certifications, such as:
- **SOC 1, SOC 2 and SOC 3** reports
- **ISO/IEC 27001, 27017 and 27018** certificates
- **PCI DSS** attestation of compliance (for card payments)

These are written by external auditors who **do** inspect the facilities. (Artifact is a real-AWS console service; there's nothing to practise for it in Floci.)

### What stays your job
Choosing a secure data centre doesn't make your data secure. You're still responsible for:
- **Choosing the Region** that satisfies your data-residency rules, and keeping data there.
- **Encrypting** data, controlling **access** to it, and **logging** who used it.
- **Designing for failure** across AZs, because AWS keeps each data centre running but doesn't make **your application** multi-AZ for you.

### Best practices
1. **Pick Regions deliberately**, based on compliance first, then latency, service availability and cost.
2. **Restrict Regions you don't use.** In real AWS organisations, Service Control Policies can deny requests to unapproved Regions, which helps with both compliance and security (attackers who steal credentials love unused Regions).
3. **Verify, don't assume.** `get-bucket-location`, as in the demo, is evidence. Keep that kind of evidence for audits.
4. **Use ZoneIds when coordinating across accounts**, because AZ names are shuffled per account.
5. **Never put the only copy of anything in one AZ** in production.
