## Why high availability matters

### Downtime is expensive
When a system is down:
- **Revenue stops**: an online shop down for an hour during a sale loses that hour's orders, and some customers for good.
- **Trust drops**: users remember the payment app that failed at the checkout.
- **Teams lose time**: engineers fix incidents instead of building features.
- **There may be penalties**: contracts and regulators can require minimum availability.

### Everything fails eventually
Disks die, servers crash, software has bugs, networks drop packets, power fails, people make mistakes. At AWS's scale, hardware failures happen **every day**. The question isn't *whether* something fails, but *what happens to your users when it does*.

### Why the cloud makes HA affordable
On-premises, true HA means a second data centre, duplicate hardware and complex networking. Few companies can afford it. In AWS:
- Every Region has **at least three AZs**, ready to use, at no extra setup cost.
- **Load balancers** and **Auto Scaling** are managed services, not hardware you buy.
- Many services are **redundant by default**: S3 and DynamoDB store data across multiple AZs automatically.
- **RDS Multi-AZ** gives a database a standby in another AZ, with automatic failover, through one setting.

You still pay for the extra capacity (two servers instead of one), but not for buildings.

### Why "how many nines" is a business decision
Each extra nine costs more: more redundancy, more automation, more testing. A school's internal timetable app doesn't need four nines; a payments platform might. Good engineers ask **"what does an hour of downtime cost?"** and design to match.

### Why your availability is limited by your weakest link
Components in a chain multiply:

~~~text
Web tier 99.9%  x  App tier 99.9%  x  Database 99.9%  =  ~99.7% overall
~~~

Adding a single non-redundant component lowers the whole system's availability. That's why HA must cover **every** layer, including DNS, authentication, databases and third-party APIs.

## Why this matters for you
"How do we make this highly available?" is one of the most common questions in AWS exams and interviews. The core answer, **multiple AZs, a load balancer with health checks, and Auto Scaling or Multi-AZ managed services**, will serve you in hundreds of scenarios.
