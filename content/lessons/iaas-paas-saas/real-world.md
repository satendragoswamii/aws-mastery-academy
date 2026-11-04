## In the real world

### A typical modernisation path
An insurance company moves its claims system to AWS in stages:

1. **Lift and shift (IaaS):** copy the existing servers to EC2 as they are. Fast, little change, and the team learns AWS.
2. **Re-platform (managed):** move the Oracle or PostgreSQL databases from EC2 to Amazon RDS. Patching and backups become AWS's job. The team stops getting paged at night for full disks.
3. **Re-architect (serverless) for new features:** document uploads go to S3, and a Lambda function processes each file as it arrives.
4. **Replace with SaaS where it isn't core:** the old self-hosted email and HR systems become SaaS subscriptions.

Each step moves effort away from running infrastructure and towards the business. (You'll meet these as the migration strategies **rehost, replatform, refactor, repurchase** in a later lesson.)

### Startups often begin serverless
With no existing servers, a two-person startup can build an API on API Gateway, Lambda and DynamoDB, pay almost nothing until users arrive, and never patch a server.

### Why IaaS remains huge
EC2 is still one of AWS's most used services. Common reasons:
- Commercial software that's certified only on specific OS versions.
- High-performance computing, game servers and machine-learning training needing specific hardware (GPUs, high memory).
- Teams that need full control for compliance or performance tuning.

### On the job
You'll often be asked: **"Can we use a managed service for this?"** A good answer checks:
1. Does a managed or serverless service meet the functional need (engine, version, features)?
2. Does it meet the non-functional needs (latency, compliance, limits like Lambda's 15-minute maximum)?
3. What is the total cost, **including the people time** saved?
4. How hard would it be to move away later (lock-in)?
