## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.2: Identify components of the AWS global infrastructure.**

| Question wording | Answer |
|---|---|
| "physical location with multiple isolated data centre clusters" | **Region** |
| "one or more discrete data centres with redundant power and networking" | **Availability Zone** |
| "deliver content to users with low latency, caching" | **Edge locations** (CloudFront) |
| "run applications that need single-digit-millisecond latency in a large city" | **Local Zones** |
| "ultra-low latency for 5G mobile devices" | **Wavelength Zones** |
| "run AWS services on premises" | **AWS Outposts** |
| "achieve high availability" | Deploy across **multiple AZs** |
| "disaster recovery for a Region-wide event" | Use **multiple Regions** |
| "factors when choosing a Region" | **Compliance, latency/proximity to users, service availability, pricing** |
| "improve global application availability and performance using the AWS network" | **AWS Global Accelerator** |

### Exam traps
- **Each Region has multiple AZs (at least three for current Regions)**, and AZs are not the same as edge locations.
- **Edge locations outnumber Regions** many times over.
- **Data doesn't leave a Region automatically.** You must configure replication.
- **IAM, Route 53 and CloudFront are global**; EC2 instances are AZ-scoped; S3 buckets are Regional (with a global namespace).
- **High availability = multiple AZs; disaster recovery for Regional events = multiple Regions.**

### Solutions Architect – Associate (SAA-C03)
Expect multi-AZ and multi-Region designs, Route 53 routing policies (latency, failover, geolocation), CloudFront vs. Global Accelerator, data residency constraints, and opt-in Regions with SCPs.
