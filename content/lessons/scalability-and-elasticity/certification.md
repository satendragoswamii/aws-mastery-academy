## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1, task 1.1:** elasticity as a benefit of the cloud; "stop guessing capacity".
- **Domain 1, task 1.2:** Well-Architected design principles such as *scale horizontally to increase aggregate workload availability*.
- **Domain 3, task 3.3:** Amazon EC2 Auto Scaling and Elastic Load Balancing as the services that deliver elasticity for EC2.

### What the exam expects
| Question wording | Think… |
|---|---|
| "automatically adjust capacity to meet demand" | Amazon EC2 Auto Scaling (elasticity) |
| "acquire resources as needed and release them when no longer needed" | Elasticity |
| "handle growth", "grow without redesign" | Scalability |
| "distribute traffic across multiple targets" | Elastic Load Balancing |
| "replace unhealthy instances automatically" | Auto Scaling health checks (self-healing) |
| "add more instances" / "use a bigger instance" | Horizontal / vertical scaling |
| "predictable daily traffic pattern" | Scheduled or predictive scaling |

### Exam traps
- **Scalability ≠ elasticity.** Elasticity is automatic and two-way. "Can grow" alone is scalability.
- **Auto Scaling doesn't distribute traffic**; the load balancer does. They're used together.
- **Vertical scaling usually needs downtime** (changing an instance type needs a stop and start). Horizontal scaling doesn't.
- **Auto Scaling itself is free.** You pay for the instances it launches (and CloudWatch extras, if any).

### Solutions Architect – Associate (SAA-C03)
Expect choices between scaling policies (target tracking vs. step vs. scheduled vs. predictive), cooldowns and warm-up, warm pools, mixed instance types with Spot Instances, lifecycle hooks, and stateless design with sessions in ElastiCache or DynamoDB.
