## A highly available three-tier architecture

~~~text
                          Users
                            |
                 Amazon Route 53 (DNS, itself highly available)
                            |
         Application Load Balancer (nodes in AZ a and AZ b)
               health checks every few seconds
                /                              \
  +---------------------------+   +---------------------------+
  | AZ ap-south-1a            |   | AZ ap-south-1b            |
  |  [web] [web]              |   |  [web] [web]              |  Auto Scaling group
  |                           |   |                           |  (min 2, spread across AZs)
  |  [RDS primary] ------------------> [RDS standby]          |  Multi-AZ, synchronous
  |                           |   |                           |  replication, auto failover
  +---------------------------+   +---------------------------+
                \                              /
                 Amazon S3 (files), DynamoDB (sessions): multi-AZ by design
~~~

### Walking through failures
| What fails | What happens | Users notice? |
|---|---|---|
| One web instance | Health checks fail; ALB stops routing to it; ASG replaces it | No (others serve) |
| A whole AZ | ALB routes to the healthy AZ; ASG launches replacements there; RDS fails over to the standby if the primary was in that AZ | Brief database failover; otherwise no |
| The RDS primary | RDS promotes the standby and updates the DNS name | A short interruption (typically under a couple of minutes) |
| A bad deployment on all instances | Every instance fails health checks | **Yes.** Redundancy doesn't protect against the same bug everywhere: use gradual deployments and rollback |

### Single-AZ vs. multi-AZ at a glance
~~~text
Not HA:   [ALB] -> [web] [web]  (both in AZ a)  -> [RDS single-AZ]
             AZ a fails = total outage

HA:       [ALB in a+b] -> [web a] [web b] -> [RDS primary a / standby b]
             AZ a fails = service continues from AZ b
~~~

### Costs of HA
- **Double (or more) capacity**: at least one instance per AZ, and an RDS standby you pay for but don't read from.
- **Cross-AZ data transfer** charges for traffic between AZs.
- **Complexity**: more to monitor and test.

These costs are usually far smaller than the cost of downtime, which is why multi-AZ is the default for production.
