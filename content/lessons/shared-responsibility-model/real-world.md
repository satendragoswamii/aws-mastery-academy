## In the real world

### The misconfiguration breaches
Many of the largest cloud data exposures followed the same pattern: data in a storage bucket or database that was reachable from the internet, or a server with an exploitable misconfiguration and an over-permissive IAM role. In each case the cloud provider's infrastructure worked exactly as designed. The weakness was on the customer side: configuration, permissions or unpatched software.

### The unpatched server
A company "lifts and shifts" old servers to EC2 and assumes AWS will keep them patched. Two years later, an attacker exploits a well-known vulnerability in the guest operating system. On EC2, the OS is the customer's responsibility. The fix is Systems Manager Patch Manager with a weekly patch baseline, or moving to managed services.

### The audit that went smoothly
A payments start-up preparing for PCI DSS uses AWS's PCI attestation from **AWS Artifact** to cover physical and infrastructure controls. Its own evidence covers the rest: AWS Config conformance packs, CloudTrail logs in a locked S3 bucket, encryption with KMS, and IAM Identity Center with MFA. The auditor spends their time on the start-up's actual controls instead of asking about data-centre doors.

### Moving the line on purpose
Teams that want less to patch and audit deliberately pick more managed services: Aurora instead of self-run databases, Fargate instead of EC2 hosts, Lambda for glue code. Their security reviews shrink, because more rows of the table belong to AWS.
