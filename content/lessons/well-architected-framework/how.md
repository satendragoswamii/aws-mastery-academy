## How a Well-Architected review works

### The review cycle
~~~text
1. Choose a workload         "the shop backend"
2. Answer the questions      per pillar, with evidence (in the Well-Architected Tool)
3. Identify risks            high-risk issues (HRI), medium-risk issues (MRI)
4. Prioritise                what hurts most, what's cheapest to fix
5. Improve                   owners and dates for each fix
6. Measure and repeat        after big changes, or every 6-12 months
~~~
It's **not an audit**. Nobody "fails". The output is a prioritised improvement plan.

### Example questions (paraphrased) and practices
| Pillar | Question | A practice that answers it | Check used in the demo |
|---|---|---|---|
| Operational excellence | How do you know who owns a resource and when something is wrong? | Tagging; alarms on key metrics | `Owner` tag; throttling alarm |
| Security | How do you protect your data at rest? | Block public access; encryption | `BlockPublicPolicy = True` |
| Reliability | How do you back up data? | Versioning; point-in-time recovery | S3 versioning; DynamoDB PITR |
| Performance efficiency | How do you select the right resource? | Match capacity mode to traffic | On-demand billing mode |
| Cost optimization | How do you manage cost over time? | Storage tiering | Lifecycle transition to Standard-IA |
| Sustainability | How do you reduce stored data? | Delete what you don't need | Lifecycle expiration at 365 days |

### Turning practices into automated checks
A human review once a year finds problems late. Teams automate what they can:

~~~text
best practice  ->  automated check                    ->  where
"no public data"   S3 Block Public Access + Config rule   account baseline
"backups on"       Config rule / AWS Backup policy        every account
"alarms exist"     IaC template always creates them       CI/CD pipeline
"tagged owner"     tag policy (Organizations)             at creation time
"costs visible"    Budgets + Cost Anomaly Detection       billing
~~~
`wa-review.sh` in the demo is a tiny version of this idea: each check reads a real setting through the API and prints PASS or FAIL.

### Trade-offs, in numbers
| Choice | Reliability | Cost | Performance |
|---|---|---|---|
| Single AZ | Low | Lowest | Fine |
| Multi-AZ | High | + standby/extra capacity | Fine |
| Multi-Region active-passive | Higher | + second Region (scaled down) | Fine |
| Multi-Region active-active | Highest | About 2x | Best for global users |
