## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1, task 1.2:** the **Reliability** pillar of the Well-Architected Framework; design principles *automatically recover from failure* and *scale horizontally to increase aggregate workload availability*.
- **Domain 3, task 3.2:** using **multiple Availability Zones** for high availability.
- **Domain 3:** **Elastic Load Balancing** (distributes traffic, health checks), **EC2 Auto Scaling** (replaces failed instances), **RDS Multi-AZ** (automatic database failover).

### What the exam expects
| Question wording | Answer |
|---|---|
| "highly available", "survive the failure of a data centre" | Deploy across **multiple AZs** |
| "distribute incoming traffic across multiple EC2 instances" | **Elastic Load Balancing** |
| "route traffic only to healthy instances" | Load balancer **health checks** |
| "automatically replace failed instances" | **Auto Scaling** with health checks |
| "database must fail over automatically to another AZ" | **Amazon RDS Multi-AZ** |
| "which services are highly available by default" | S3, DynamoDB, SQS, Lambda (multi-AZ automatically) |

### Exam traps
- **More instances in one AZ ≠ high availability.** The AZ is still a SPOF.
- **RDS read replicas ≠ Multi-AZ.** Read replicas scale reads; Multi-AZ provides automatic failover. (Some newer deployment options blur this, but the exam distinction holds.)
- **An SLA isn't a design.** AWS SLAs pay service credits; they don't make a single-AZ design highly available.
- **High availability ≠ fault tolerance ≠ disaster recovery.** HA minimises downtime; fault tolerance means no interruption; DR is recovering from a large-scale event. They come in the next two lessons.

### Solutions Architect – Associate (SAA-C03)
Expect to choose between ALB, NLB and Gateway Load Balancer; cross-zone load balancing; Route 53 health checks and failover routing; Multi-AZ versus Multi-Region; and connection draining (deregistration delay).
