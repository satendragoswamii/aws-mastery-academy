## In the real world

### Payments: every minute counts
A payments company processes thousands of transactions a minute. Its API runs in three AZs behind load balancers, its database uses a Multi-AZ setup, and every dependency (DNS, secrets, queues) is a multi-AZ managed service. When one AZ has a power event, dashboards show a dip in capacity and a database failover, and customers see a few slow requests, not an outage.

### The most common real failure isn't hardware
Large providers' post-incident reports repeatedly show that **changes**, such as a bad configuration push, an expired certificate or a faulty deployment, cause more outages than hardware. Because a change usually reaches every server, redundancy doesn't help. Mature teams add:
- **Gradual rollouts** (one AZ or a small percentage first).
- **Automatic rollback** when health checks or error rates worsen.
- **Change freezes** around critical events.

### Health checks that lie
A team's `/health` page returned 200 as long as the web server process was running, even when the app couldn't reach its database. The load balancer kept sending users to servers that showed errors. They changed `/health` to check the app's critical path, carefully, so that a database outage wouldn't mark every server unhealthy at once.

### "We're on AWS, so we're highly available"
A common misunderstanding. AWS gives you highly available **building blocks**. A single EC2 instance in one AZ is exactly as available as one server in one data centre. **HA is a property of your design**, not of the provider.

### On the job
- Review architectures for SPOFs.
- Set and test health checks and thresholds.
- Define availability targets (SLOs) with the business, and an **error budget** of acceptable downtime.
- Run failure drills: terminate an instance, fail over a database, and watch what users would experience.
