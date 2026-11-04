## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 3, task 3.2 (AWS global infrastructure):** the relationship between data centres, Availability Zones and Regions; using multiple AZs for high availability; choosing Regions for data sovereignty, latency and service availability.
- **Domain 2 (Security and compliance):** physical and environmental security is **AWS's** responsibility; **AWS Artifact** is where you get compliance reports.
- **Domain 1, Sustainability pillar:** AWS's efficient data centres help customers lower their carbon footprint compared with typical on-prem rooms.

### What the exam expects
| If the question says… | Think… |
|---|---|
| "one or more discrete data centres with redundant power, networking and connectivity" | Availability Zone (this is AWS's own definition) |
| "physical location with multiple, isolated AZs" | Region |
| "highly available", "survive the failure of a data centre" | Deploy across **multiple AZs** |
| "data must remain in a specific country" | Choose the right **Region**; data doesn't leave a Region unless you move it |
| "download SOC / ISO / PCI reports" | **AWS Artifact** |
| "who is responsible for the physical security of the data centre" | **AWS** |

### Exam traps
- **An AZ isn't always exactly one data centre.** It's "one or more" data centres.
- **Multi-AZ ≠ multi-Region.** Multi-AZ protects against a data-centre failure. Multi-Region protects against a Region-wide event, and is costlier.
- **You can't choose a specific building**, and you can't visit one.
- **Edge locations aren't AZs.** They're for content delivery (CloudFront) and come in a later lesson.

### Solutions Architect – Associate (SAA-C03)
Expect scenarios where you must spot a **single-AZ** design as the weakness, and choose Multi-AZ RDS, multi-AZ Auto Scaling groups or cross-Region replication as the fix.
