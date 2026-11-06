## Mixing pricing models in one architecture

A real shop rarely uses one pricing model. It matches each part of the system to the cheapest model that fits:

~~~text
 requests per hour
   ^
   |            peak (sale day)          <- Spot (extra, interruptible) + On-Demand
   |        _/\_        _/\_
   |   ____/    \______/    \____         <- On-Demand via Auto Scaling (daily peaks)
   |  |                          |
   |  |##########################|        <- Savings Plan / Reserved (24/7 baseline)
   +--+--------------------------+------> time
~~~

| Component | Usage pattern | Pricing choice | Why |
|---|---|---|---|
| Web/app servers, baseline | 24/7, predictable | Compute Savings Plan (1 year) | Big discount, flexible if instance types change |
| Web/app servers, peaks | Daily spikes | On-Demand in an Auto Scaling group | No commitment for capacity used a few hours a day |
| Image-resizing batch jobs | Can retry, not urgent | Spot (several instance types, several AZs) | Up to 90% off; interruptions just mean a retry |
| Database (RDS) | 24/7 | RDS Reserved Instance | Savings Plans don't cover RDS |
| Order archive | Rarely read | S3 Standard-IA / Glacier | Storage class is a pricing model too |
| Static images | Read globally | CloudFront | Cheaper data transfer out than serving from EC2 |
| Dev/test servers | Office hours | On-Demand, scheduled stop at night | Switched-off resources cost nothing (except storage) |

### Governance around it
~~~text
AWS Organizations (consolidated billing: one bill, shared volume discounts and Savings Plans)
   |-- Budgets per account (alerts at 80% and forecasted 100%)
   |-- Cost allocation tags: team=shop, env=prod
   `-- Cost Explorer: monthly review of coverage, utilisation and anomalies
~~~
