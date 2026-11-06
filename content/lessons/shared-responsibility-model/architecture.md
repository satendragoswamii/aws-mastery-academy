## Mapping responsibility onto a real architecture

The shop from earlier lessons, with every layer labelled **AWS**, **YOU** or **BOTH**:

~~~text
customers --HTTPS (YOU: enforce TLS, certificate from ACM [AWS renews])-->
  CloudFront + WAF              AWS: edge infrastructure, Shield Standard
                                YOU: WAF rules, cache/origin config, Origin Access Control
        |
  ALB (managed)                 AWS: load balancer software and scaling
                                YOU: listeners, security group, access logs on/off
        |
  EC2 web servers (IaaS)        AWS: host, hypervisor, physical server
                                YOU: OS patches, app, IAM role, SG, EBS encryption choice
        |
  RDS PostgreSQL (managed)      AWS: OS, engine patching, Multi-AZ failover mechanism
                                YOU: DB users, network exposure, encryption on, backup retention
        |
  Lambda order emails           AWS: servers, OS, runtime
                                YOU: code, dependencies, IAM role, environment secrets
        |
  S3 receipts bucket            AWS: durability, storage hardware
                                YOU: bucket policy, Block Public Access, encryption, lifecycle
~~~

### Account-level baseline (all YOU)
~~~text
root user: MFA on, no access keys
IAM Identity Center for people; roles for workloads; password policy for any IAM users
CloudTrail (all Regions, logs to a locked bucket) + Config recorder + rules
GuardDuty + Security Hub on
S3 account-level Block Public Access; EBS encryption by default in each Region
Budgets with alerts
~~~

### Choosing services to shrink your list
| Instead of | Use | You no longer manage |
|---|---|---|
| PostgreSQL on EC2 | RDS / Aurora | OS, engine patching, replication setup |
| Cron jobs on EC2 | Lambda + EventBridge | Servers, OS, runtime |
| Containers on self-managed EC2 | ECS on Fargate | Container hosts |
