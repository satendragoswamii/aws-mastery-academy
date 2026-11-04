## How each model works in practice

### Public cloud
You create an account with the provider and use its APIs (Console, CLI, SDKs) to create resources in its Regions. The provider runs the hardware; isolation between customers is enforced by the **hypervisor**, networking (each customer gets private virtual networks, **VPCs**) and identity controls (**IAM**).

### Private cloud
The organisation builds a cloud-like layer on its own hardware:
1. **Virtualisation** (VMware vSphere, Hyper-V, KVM) pools the servers.
2. A **cloud management platform** (VMware Cloud Foundation, OpenStack and others) adds a self-service portal and APIs.
3. **Automation** lets teams create VMs, networks and storage without a ticket.

It gives cloud-like **agility** internally, but **capacity is still fixed by what you bought**.

### Hybrid: connecting the two
The hard part of hybrid isn't either side; it's **joining them**. Four things must work across both:

| Concern | How it's typically done with AWS |
|---|---|
| **Network** | **Site-to-Site VPN** (IPsec over the internet, set up in hours) or **AWS Direct Connect** (dedicated private link, set up in weeks), often both |
| **Identity** | One directory for both sides: AWS IAM Identity Center or IAM federated with the company's existing directory (e.g. Microsoft Active Directory) |
| **Data** | Replication and backup: AWS DataSync, AWS Storage Gateway, AWS Backup, database replication, or simple tools like `aws s3 sync` |
| **Management** | One way to monitor and patch both: AWS Systems Manager can manage on-prem servers too; CloudWatch can collect their logs |

### Running AWS on-premises
For workloads that must stay on-prem but want AWS's APIs and services, AWS offers:
- **AWS Outposts**: AWS-designed, AWS-managed racks or servers in your data centre, running services like EC2, EBS and RDS locally.
- **Amazon ECS Anywhere / Amazon EKS Anywhere**: run AWS-managed container orchestration on your own servers.
- **AWS Local Zones** (AWS-owned, in metro areas) and **AWS Wavelength** (in telecom networks) bring AWS closer to users without being on your premises.

### How a backup-to-cloud hybrid works (what you'll build)
~~~text
 Office (on-prem)                         AWS Region ap-south-1
+------------------+   encrypted HTTPS   +----------------------+
| file server      | ------------------> | S3 bucket            |
| invoices/*.csv   |   aws s3 sync       | (copies stored       |
+------------------+   (only new or      |  across multiple AZs)|
                         changed files)  +----------------------+
                                                   |
                         restore anywhere          v
                                         +----------------------+
                                         | DR site / new office |
                                         +----------------------+
~~~
The office keeps working as before. The cloud adds off-site durability, and a restore can happen anywhere with internet access. This is how many companies take their **first step** into hybrid cloud.
