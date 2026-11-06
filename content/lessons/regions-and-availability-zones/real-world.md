## In the real world

### "We had two servers, so we were safe"
A team runs two web servers and a database, but launched all of them into the same subnet without thinking. When that AZ has a problem, everything stops at once. Two servers in one AZ protect against a server failing, not against an AZ failing. The fix is a subnet in each AZ and an Auto Scaling group across them.

### The volume that couldn't follow
An instance in ap-south-1a has an impaired host. The engineer launches a replacement in ap-south-1b and tries to attach the old data volume, which fails, because EBS is AZ-bound. The recovery: snapshot, restore into 1b. Teams now keep regular snapshots (AWS Backup or Data Lifecycle Manager) and keep shared data on EFS or S3 instead.

### The NAT gateway in one AZ
A company saves money with one NAT gateway in ap-south-1a for all private subnets. When 1a has trouble, servers in 1b and 1c lose internet access too, even though they're healthy. Lesson: AZ-scoped infrastructure that other AZs depend on needs a copy in each AZ.

### Cross-AZ bills
A microservices platform spreads dozens of chatty services randomly across three AZs. The data transfer line on the bill becomes significant. The team uses AZ-aware routing (keeping calls within the same AZ where possible), which reduces both cost and latency.
