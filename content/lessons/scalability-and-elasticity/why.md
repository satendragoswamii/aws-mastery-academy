## Why scalability and elasticity matter

### Demand is never flat
Real traffic goes up and down:
- **Daily cycles**: busy in the day, quiet at night.
- **Weekly cycles**: food delivery peaks on weekends.
- **Seasonal peaks**: festival sales, exam results, tax deadlines, IPL final nights.
- **Surprises**: a product goes viral, a news story links to you.

### The on-premises problem
~~~text
capacity bought  ----------------------------------------------  (for the peak)
                         /\                      /\
demand        ___/\_____/  \___/\_______________/  \____/\____
              ^ money wasted on idle capacity most of the time
~~~
You either buy for the peak (wasting money) or buy for the average (crashing at the peak). The previous lessons called this **guessing capacity**.

### The elastic answer
~~~text
capacity        __/--\____/----\__/--\______________/----\___/--\___
demand          ___/\_____/  \___/\_______________/  \____/\____
                capacity follows demand, with a little headroom
~~~
- **Lower cost**: you don't pay for idle servers at night.
- **Better experience**: the site stays fast during peaks.
- **Less risk**: a viral moment becomes an opportunity, not an outage.

### Why scale out rather than up?
| | Scale up | Scale out |
|---|---|---|
| Limit | The largest instance type | Practically unlimited |
| Downtime | Often a restart | None. Add instances alongside |
| Availability | Still one machine (single point of failure) | Many machines across AZs |
| Cost granularity | Big steps | Small steps |
| Application change | None | Must be **stateless** |

Cloud-native systems prefer **scaling out**, because it also improves availability. Databases are the usual exception: they're often scaled up first, then out with read replicas.

### Why Auto Scaling also means self-healing
An Auto Scaling group checks instance health. If an instance fails, the group **terminates and replaces it** automatically to get back to the desired capacity. So the same feature that gives you elasticity also gives you resilience.

## Why this matters for you
- "Elasticity" and "scale out" are among the most frequent words in CLF-C02 and SAA-C03 answers.
- **Design principle** from the AWS Well-Architected Framework: *stop guessing your capacity needs*. Elasticity is how you follow it.
