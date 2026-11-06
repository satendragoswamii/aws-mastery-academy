## How the model works in practice

### Draw the line for each service
~~~text
                 EC2                 RDS                 Lambda
               +-------+           +-------+           +-------+
Data / access  |  YOU  |           |  YOU  |           |  YOU  |
App / code     |  YOU  |           |  YOU  |           |  YOU  |
Runtime / DB   |  YOU  |           |  AWS  |           |  AWS  |
Guest OS       |  YOU  |           |  AWS  |           |  AWS  |
Host / virt    |  AWS  |           |  AWS  |           |  AWS  |
Hardware / DC  |  AWS  |           |  AWS  |           |  AWS  |
               +-------+           +-------+           +-------+
~~~
The higher the line, the less you manage. The **top two rows never move**.

### Secure defaults vs. your choices
AWS often ships secure defaults, but many important settings are **opt-in** and remain your decision:

| Setting | Default (real AWS) | Who decides |
|---|---|---|
| New S3 bucket public? | No: Block Public Access on, ACLs disabled | You (can turn it off) |
| New S3 objects encrypted? | Yes, SSE-S3 | You (choice of SSE-KMS etc.) |
| New EBS volumes encrypted? | **No**, unless you enable "encryption by default" per Region | You |
| IAM password policy | A basic default policy | You (should strengthen it) |
| Root user MFA | Required for some account types; enforce it yourself | You |
| CloudTrail trail with long-term storage | **Not created** (90-day event history only) | You |
| AWS Config recording | **Off** | You |
| GuardDuty | **Off** | You |

### Patching: a shared control
~~~text
AWS patches:  host OS, hypervisor, firmware, managed service platforms (RDS engine, Lambda runtime)
You patch:    EC2 guest OS, software you install, container images, your Lambda dependencies
Tool:         AWS Systems Manager Patch Manager automates your half
~~~

### Evidence for each side
| Side | Evidence |
|---|---|
| AWS | SOC 1/2/3, ISO 27001/27017/27018, PCI DSS attestations in **AWS Artifact** |
| You | IAM policies, CloudTrail logs, AWS Config compliance history, Security Hub findings, patch compliance reports |
