## What are cloud pricing models?

### The simple version
Buying servers is like **buying a car**: a big payment up front, and you pay for it whether you drive or not. The cloud is like **taxis, rentals and leases**:
- **Taxi (On-Demand):** pay per trip, no commitment, highest price per kilometre.
- **Long-term lease (Reserved Instances / Savings Plans):** promise to use it for 1–3 years, get a big discount.
- **Standby seat (Spot):** very cheap, but the driver may ask you to get out with two minutes' notice.
- **Private car with your name on it (Dedicated Hosts):** a whole physical server just for you.

A pricing model is simply the **deal** you choose for each workload.

### The professional version
AWS pricing rests on three principles: **pay as you go**, **save when you commit**, and **pay less per unit as you use more** (volume tiers, such as S3 storage). For compute, the purchase options are:

| Option | Commitment | Discount vs. On-Demand | Interruption? | Best for |
|---|---|---|---|---|
| On-Demand | None | 0% | No | Short, spiky, unknown workloads; testing |
| Savings Plans | $/hour for 1 or 3 years | Up to ~72% | No | Steady compute, changing instance types |
| Reserved Instances | Instance attributes for 1 or 3 years | Up to ~72% | No | Steady, predictable usage (also RDS, ElastiCache…) |
| Spot Instances | None | Up to ~90% | **Yes, 2-minute notice** | Fault-tolerant batch, CI, rendering |
| Dedicated Hosts / Instances | Optional | Costs more | No | Licensing, compliance |
| Capacity Reservations | None (pay while reserved) | 0% | No | Guaranteeing capacity in an AZ |

### What you're actually billed for
Almost every AWS bill is a sum of four kinds of meters:
1. **Compute time:** per second or hour (EC2, Fargate), or per request and GB-second (Lambda).
2. **Storage:** per GB-month (S3, EBS, snapshots).
3. **Requests/operations:** per million requests (S3 GETs, API Gateway calls, DynamoDB on-demand).
4. **Data transfer:** inbound free; outbound to the internet and cross-AZ/cross-Region charged.

### What you'll do
On Floci you'll look up a real On-Demand price through the **Pricing API**, compare **Spot** prices across AZs, check **Cost Explorer**, and create a **budget** with an 80% alert.
