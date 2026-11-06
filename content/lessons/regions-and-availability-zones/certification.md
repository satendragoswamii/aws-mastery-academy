## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.2** (Regions and AZs, high availability) and **Domain 1** (Well-Architected reliability: design for failure).

| Question wording | Answer |
|---|---|
| "make an application highly available" | Deploy across **multiple Availability Zones** |
| "protect against the failure of a single data centre" | **Multiple AZs** |
| "protect against a Region-wide outage / natural disaster" | **Multiple Regions** |
| "block storage for EC2 in the same AZ" | **Amazon EBS** |
| "file storage shared by instances in multiple AZs" | **Amazon EFS** |
| "object storage, durable across multiple AZs" | **Amazon S3** |
| "move an EBS volume's data to another AZ" | **Snapshot, then create a volume from it** |
| "distribute traffic across instances in multiple AZs" | **Elastic Load Balancing** |

### Exam traps
- **EBS volumes are AZ-scoped**; snapshots are Regional.
- **Subnets are AZ-scoped; a VPC is Regional.**
- **S3 One Zone-IA** stores data in a single AZ (cheaper, less resilient). Not for data you can't recreate.
- "Two instances" isn't high availability if they're in the same AZ.

### Solutions Architect – Associate (SAA-C03)
Expect Multi-AZ RDS vs. read replicas, NAT gateway per AZ, Auto Scaling across AZs with an ALB, EBS snapshot and AMI copying across Regions, EFS vs. EBS, and cross-AZ data transfer costs.
