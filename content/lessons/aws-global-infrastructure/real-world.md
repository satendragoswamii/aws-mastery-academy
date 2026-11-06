## In the real world

### Data residency decides first
An Indian fintech company stores payment data. Indian regulations on payment data storage require it to stay in India. The company runs in **Mumbai (ap-south-1)** with disaster recovery in **Hyderabad (ap-south-2)**: two Regions, both in India. Latency and price were considered only after that.

### Single-AZ outages happen
Over the years, AWS has had incidents affecting one AZ (power events, cooling, networking). Companies deployed across several AZs mostly kept running; those in one AZ went down. This is why "Multi-AZ" appears in almost every production checklist.

### Region-wide incidents are rarer but real
There have been major incidents affecting services across a whole Region, often us-east-1, the oldest and largest. Teams with critical systems keep a tested plan to recover in another Region, and avoid depending on a single Region for things like login.

### Global apps
A streaming or e-commerce company with customers worldwide uses CloudFront for content, deploys its application in several Regions (for example Mumbai, Frankfurt and N. Virginia), and uses Route 53 latency-based routing to send each user to the closest healthy Region.

### Local Zones and Outposts
Game studios use Local Zones to put servers near players in big cities. Manufacturers and hospitals use Outposts when systems must stay on site but should be managed with the same AWS tools as everything else.
