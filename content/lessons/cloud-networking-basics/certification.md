## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.4 (network services)** and **Domain 2 (security)**:

| Question wording | Answer |
|---|---|
| "logically isolated section of the AWS Cloud" | **Amazon VPC** |
| "allows communication between a VPC and the internet" | **Internet gateway** |
| "allows instances in a private subnet to reach the internet but not be reached" | **NAT gateway** |
| "instance-level, stateful firewall" | **Security group** |
| "subnet-level, stateless firewall with allow and deny rules" | **Network ACL** |
| "connect privately to S3 without using the internet" | **VPC endpoint** (gateway endpoint) |
| "connect two VPCs" | **VPC peering** (or Transit Gateway for many) |
| "capture information about IP traffic in a VPC" | **VPC Flow Logs** |
| "DNS service" | **Amazon Route 53** |

### Exam traps
- **Security groups are stateful; NACLs are stateless.** This distinction appears constantly.
- **Security groups have allow rules only.** To *deny* a specific IP, use a NACL.
- **A subnet is in one AZ**; a VPC spans all AZs in its Region.
- **Public vs. private subnet** depends on the route to an internet gateway, not on the name.
- **NAT gateway sits in a public subnet**, serving private subnets.

### Solutions Architect – Associate (SAA-C03)
Expect multi-tier VPC designs, NAT gateway placement for HA (one per AZ), VPC endpoints (gateway vs. interface), peering vs. Transit Gateway, CIDR sizing, and troubleshooting with flow logs and Reachability Analyzer.
