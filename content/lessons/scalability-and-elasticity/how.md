## How elasticity works in AWS

### The building blocks
1. **Launch template**: the recipe for one instance (AMI, instance type, security groups, startup script).
2. **Auto Scaling group (ASG)**: uses the template, and has:
   - **Minimum size**: never fewer than this (keeps the service up).
   - **Maximum size**: never more than this (caps cost).
   - **Desired capacity**: how many right now, always between min and max.
   - **Subnets / Availability Zones** to spread instances across.
3. **Scaling policies** change the desired capacity automatically.
4. **A load balancer** (usually) spreads traffic across whatever instances exist right now. New instances register with it automatically.
5. **Amazon CloudWatch** supplies the metrics (CPU, request count) that policies react to.

~~~text
          CloudWatch metric (avg CPU)
                   |
          scaling policy ("keep CPU near 50%")
                   |  changes desired capacity
                   v
 +-----------------------------------------------+
 | Auto Scaling group   min 1  desired 3  max 4  |
 |   AZ a: [i-1] [i-3]        AZ b: [i-2]        |
 +-----------------------------------------------+
                   ^
          load balancer sends traffic to healthy instances
~~~

### The control loop
The ASG constantly compares **what is** with **what should be**:
- Fewer healthy instances than desired → **launch** more (scale out, or replace a failed one).
- More than desired → **terminate** some (scale in), keeping the AZs balanced.

You saw this in the demo: you changed one number, and the group did the work.

### Scaling policies
| Policy | How it works | Good for |
|---|---|---|
| **Target tracking** | "Keep metric X near value Y". AWS calculates how many instances are needed | Most workloads: the recommended default |
| **Step scaling** | "If CPU > 70% add 2; if > 90% add 4" | Fine control over the reaction size |
| **Scheduled scaling** | "At 09:00 Mon–Fri set desired to 6" | Known, predictable patterns |
| **Predictive scaling** | Machine learning forecasts traffic and scales ahead of it | Regular daily or weekly cycles |
| **Manual** | You call `set-desired-capacity` | Testing, one-off events (what you'll do in the demo) |

With target tracking, AWS creates and manages the CloudWatch alarms for you: one to scale out when the metric is above target, one to scale in when it's well below.

### Cooldowns and warm-up
New instances need time to boot and warm up before they help. ASGs use a **warm-up period** so new instances aren't counted until they're ready, which prevents launching too many at once. Scaling in is deliberately more cautious than scaling out.

### Elasticity beyond EC2
Many AWS services are elastic **without** you configuring an ASG:
- **Lambda** runs as many copies of your function as there are requests (up to your concurrency limit).
- **DynamoDB on-demand** adapts to your read and write traffic.
- **S3** stores any amount of data.
- **Aurora Serverless**, **ECS/Fargate service auto scaling** and **Application Auto Scaling** cover databases and containers.
