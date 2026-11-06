## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 4: Billing, Pricing, and Support (12%)**, task 4.1 (compare pricing models) and task 4.2 (billing, budget and cost-management resources).

| Question wording | Answer |
|---|---|
| "short-term, unpredictable workload that can't be interrupted" | **On-Demand** |
| "steady state usage for 1 or 3 years, lowest cost" | **Reserved Instances** or **Savings Plans** |
| "flexible commitment across instance families, Regions, Fargate and Lambda" | **Compute Savings Plans** |
| "fault-tolerant, flexible start and end times, lowest cost" | **Spot Instances** |
| "use existing server-bound software licences" | **Dedicated Hosts** |
| "reserve capacity in a specific AZ without a long-term commitment" | **On-Demand Capacity Reservations** |
| "estimate the cost of an architecture before building it" | **AWS Pricing Calculator** |
| "visualise and analyse past spending, forecast" | **AWS Cost Explorer** |
| "alert when costs exceed a threshold" | **AWS Budgets** |
| "most detailed billing data" | **AWS Cost and Usage Report (Data Exports)** |
| "one bill for many accounts, combined volume discounts" | **AWS Organizations consolidated billing** |
| "track costs by department or project" | **Cost allocation tags** |

### Exam traps
- **Spot interruption notice is 2 minutes.** Never pick Spot for "must not be interrupted".
- **Data transfer IN is free**; data transfer OUT to the internet is charged.
- **Budgets alert; they don't automatically stop charges** (unless you configure budget actions).
- **Pricing Calculator = before; Cost Explorer = after.**
- **3-year, all-upfront** is the largest commitment discount.

### Solutions Architect – Associate (SAA-C03)
Expect cost-optimised design questions: Spot fleets and mixed-instance Auto Scaling groups, Savings Plans vs. RIs, S3 storage classes and lifecycle rules, reducing data-transfer cost with CloudFront and VPC endpoints, and NAT gateway cost.
