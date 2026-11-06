## Security and best practices

### Your day-one baseline (security in the cloud)
1. **Root user:** MFA on, no access keys, used only for root-only tasks.
2. **People:** IAM Identity Center with MFA; no shared logins. If you must have IAM users, a strong password policy (step 2).
3. **Workloads:** IAM roles with least privilege; no long-term keys.
4. **Data:** S3 account-level Block Public Access (step 4), EBS encryption by default in every Region you use (step 3), KMS customer managed keys for sensitive data.
5. **Network:** no `0.0.0.0/0` on admin ports; databases in private subnets.
6. **Detection:** CloudTrail in all Regions, AWS Config with rules (step 5), GuardDuty and Security Hub.
7. **Patching (IaaS):** Systems Manager Patch Manager for EC2 guest OSs; rebuild container images regularly.

### Know which column you're in
Before using any new service, ask: "What does the customer column say for **this** service?" Read the security chapter of its documentation, because each AWS service has one.

### Don't over-claim
"We're on AWS, so we're PCI compliant" is false. AWS being compliant covers AWS's layer. **Your** application must still meet the requirements for your layer.

### In this lab
- Steps 2–4 change account-wide (Floci) settings; step 6 restores them.
- Floci's default security group is not lab-owned, so the lab only reads it.
