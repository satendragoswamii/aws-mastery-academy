## Why the global infrastructure matters

### Choosing a Region: the four questions
Every project starts by choosing a Region. Ask in this order:

1. **Compliance and data residency.** Do laws or contracts require data to stay in a country? Indian banking and government rules, the EU's GDPR and many customer contracts can decide this for you. This is not negotiable, so it comes first.
2. **Latency.** Where are your users? A shop for customers in India belongs in Mumbai or Hyderabad, not Oregon. Every extra thousand kilometres adds round-trip time.
3. **Service availability.** New services and features often launch in a few Regions first. Check that everything you need exists in your chosen Region.
4. **Price.** The same instance can cost different amounts in different Regions. N. Virginia is often the cheapest; newer or smaller Regions can cost more.

### Availability Zones make high availability affordable
On-premises, surviving a data-centre failure means building a second data centre. In AWS, **every Region already has at least three AZs**. Spreading an application across two or three AZs is one setting in an Auto Scaling group or `Multi-AZ` on a database. This is the basis of almost every highly available AWS design.

### Regions make disaster recovery and global reach possible
- **Disaster recovery:** keep backups or a standby copy in a second Region (for example, Mumbai primary, Hyderabad standby) for events that affect a whole Region.
- **Going global:** serve customers in Europe from a European Region, with the same templates and tools.

### Edge locations make everything feel fast
Most of a web page is static content: images, scripts, videos. Serving these from an edge location near the user (CloudFront) cuts load time dramatically and takes load off your servers.

### Opt-in Regions are a safety feature
New Regions are disabled until you enable them. That means a leaked access key can't create resources in a Region you never use, and data can't accidentally land in a country you didn't approve.

## Why this matters for you
CLF-C02 task 3.2 is entirely about this lesson's components. Every later lesson assumes you can say "deploy across two AZs in ap-south-1, with CloudFront in front", and know what that means.
