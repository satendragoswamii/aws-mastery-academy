## Security and best practices

### Control where your data can go
1. **Pick Regions on purpose.** Write down approved Regions for each kind of data (e.g. "customer data only in ap-south-1 and ap-south-2").
2. **Leave unused opt-in Regions disabled**, so nobody can create resources there.
3. **Deny unapproved Regions** with a Service Control Policy using the `aws:RequestedRegion` condition (exempting global services). A leaked key then can't launch resources anywhere else.
4. **Turn on CloudTrail and GuardDuty in every Region**, including ones you don't use. Attackers like Regions nobody watches.

### Use the edge for security too
- **CloudFront + AWS WAF** filters attacks at the edge before they reach your servers.
- **AWS Shield Standard** protects every CloudFront distribution and Route 53 zone against common DDoS attacks at no extra cost.
- Keep S3 origins **private** with **Origin Access Control**, so users can only go through CloudFront and never hit the bucket directly.
- Serve everything over **HTTPS**; CloudFront certificates come from ACM in `us-east-1`.

### Availability is security too
The **A** in the CIA triad. Spreading across AZs, and keeping backups in a second Region, protects availability against outages.

### In this lab
- Floci's Regions aren't real places, so nothing you create leaves your Mac.
- Everything uses the `ama-l1-geo` prefix, and step 5 removes it.
