## How high availability is built

### 1. Find the single points of failure
Draw the system and ask of each box: **"if this one fails, does the service stop?"** Typical SPOFs:
- One web server, one database, one NAT gateway, one AZ.
- One person who knows how to deploy.
- One DNS provider, one payment provider, one certificate that expires.

### 2. Add redundancy, in independent places
Duplicates only help if they don't fail **together**. That's why AWS designs AZs to be independent (separate power, cooling and network) and why you put copies in **different AZs**, not just on different servers.

| Pattern | How it works | Example |
|---|---|---|
| **Active-active** | All copies serve traffic at once | Web servers in 2–3 AZs behind a load balancer |
| **Active-passive** | A standby takes over when the primary fails | RDS Multi-AZ standby |

### 3. Detect failures: health checks
A load balancer sends a request to every target on a schedule. A **target group** defines how:

| Setting | Meaning | Demo value |
|---|---|---|
| Health check path | URL to request | `/health` |
| Interval | Seconds between checks | 5 |
| Healthy threshold | Consecutive successes to become healthy | 2 |
| Unhealthy threshold | Consecutive failures to become unhealthy | 2 |
| Success codes | HTTP codes that count as healthy | 200 (default) |

~~~text
time ->   check  check  check  check  check  check
server A   OK     OK     FAIL   FAIL   ...          -> unhealthy after 2 failures (~10 s)
server B   OK     OK     OK     OK     OK     OK    -> healthy, keeps receiving traffic
~~~

Target states you'll see: `initial` (being registered), `healthy`, `unhealthy`, `draining` (being removed while in-flight requests finish) and `unused`.

**What should `/health` check?** It should answer "can this server do its job?" A static page proves only that the web server runs. A deeper check might also test the database connection, but if the database fails, a deep check marks **every** server unhealthy at once. Design health checks carefully.

### 4. Recover automatically
- **Route around it**: the load balancer stops sending traffic to unhealthy targets.
- **Replace it**: an Auto Scaling group with ELB health checks terminates unhealthy instances and launches new ones.
- **Fail over**: managed databases promote a standby (RDS Multi-AZ typically fails over in about a minute or two).
- **Re-admit it**: when a target passes the healthy threshold again, traffic returns. You'll see this in the demo.

### 5. Test it
An HA design you haven't tested is a hope, not a design. Teams run **game days**, deliberately failing instances or AZs, and AWS offers **AWS Fault Injection Service** to inject failures in a controlled way.

### HA in managed services
| Service | HA built in? |
|---|---|
| Amazon S3, DynamoDB, SQS, Lambda | Yes, across multiple AZs, automatically |
| Elastic Load Balancing | Yes, if you enable it in multiple AZs |
| Amazon RDS | With **Multi-AZ** enabled |
| Amazon EC2 | **No.** You design it: multiple instances, multiple AZs, ASG + ELB |
