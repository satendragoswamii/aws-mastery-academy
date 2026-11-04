## Why have different service models?

Because different teams want to spend their effort on different things.

### The trade-off: control versus effort
| | More control | Less work |
|---|---|---|
| IaaS | ✅ choose the exact OS, settings, software | ❌ you patch, back up, scale, secure the OS |
| PaaS | some (engine version, size, parameters) | ✅ provider patches and operates the platform |
| SaaS | little (settings, users) | ✅✅ nothing to run |

There's no universally "best" model. A hospital might use **SaaS** for email, **PaaS** (Amazon RDS) for its patient-booking database, and **IaaS** (EC2) for a medical imaging product that needs a specific OS configuration.

### Why companies move "up the stack"
Every task the provider takes over is a task your team doesn't do, and those tasks are exactly the **undifferentiated heavy lifting** from the previous lessons:
- OS installation and **security patching**.
- Database installation, upgrades and **backups**.
- **Replication and failover** for high availability.
- **Capacity planning and scaling**.

A small team that moves its database from EC2 to Amazon RDS might win back several days of work every month, and get automated backups and Multi-AZ failover it never had time to build.

### Why some things stay on IaaS
- **Special requirements**: a database engine or version that isn't offered as a managed service, kernel tuning, custom agents.
- **Licensing**: some commercial software is licensed per physical core or per server.
- **Lift-and-shift**: moving an existing application as-is, quickly, before improving it later.
- **Learning**: understanding servers makes you better at using the managed services built on them.

### Why serverless is popular
Serverless removes even the idea of a server: no instance sizes, no idle servers, automatic scaling, and **billing only for actual use**. For spiky or unpredictable workloads, a bill of almost nothing when idle is a big advantage. The trade-offs are less control over the runtime and some limits (for example, Lambda functions can run for at most 15 minutes).

## Why this matters for you
Service models appear on **every** AWS exam, usually in disguise:
- *"Which option has the least operational overhead?"*: the most managed one that meets the requirements.
- *"Who is responsible for patching the guest OS on EC2?"*: the customer (IaaS).
- *"Who is responsible for patching the database engine on RDS?"*: AWS (managed service).
