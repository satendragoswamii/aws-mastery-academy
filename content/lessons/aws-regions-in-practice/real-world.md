## In the real world

### The mystery bill from São Paulo
A startup in Bengaluru found charges from `sa-east-1` on its bill, a Region nobody had ever used. Leaked credentials had been used to launch large instances there. After cleaning up, the team added an SCP allowing only `ap-south-1` and `ap-south-2`, enabled GuardDuty in every Region, and set up a monthly cost check grouped by Region.

### Data residency as a design input
A fintech company processing Indian card payments must keep that data in India. Its architects chose Mumbai as primary and Hyderabad for disaster recovery, so even the backup copy stays in the country. The Region fence SCP turns that rule into something AWS enforces, not just a policy document.

### Disaster recovery that actually worked
During a drill, a team switched traffic to its standby Region and found the application couldn't start: the database password secret and the container images existed only in the primary Region. They added Secrets Manager replicas and ECR replication, and the next drill passed. Drills exist to find exactly these gaps.

### The "missing" Lambda function
A developer spent an hour convinced a deployment had failed. The function was there, in `us-east-1`, because the deployment tool used the default profile's Region. The team now sets the Region explicitly in every pipeline and profile.

### Latency you can measure
An e-commerce site hosted in `us-east-1` for customers in India moved to `ap-south-1`. Page response times for Indian users improved noticeably, simply because requests no longer crossed the world. Choosing the Region close to users is often the cheapest performance improvement available.
