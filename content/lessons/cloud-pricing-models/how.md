## How cloud pricing works

### 1. Reading a price
Every AWS price is **unit price x quantity**, often with tiers:

| Service | Unit | Example (us-east-1, Linux, On-Demand) |
|---|---|---|
| EC2 | per instance-hour (billed per second) | t3.micro $0.0104/hour |
| EBS gp3 | per GB-month | 20 GB volume |
| S3 Standard | per GB-month, plus per request | storage + GET/PUT |
| Lambda | per request + per GB-second | 1M requests |
| Data transfer out | per GB, tiered | after 100 GB/month free |

Prices **differ by Region** (Mumbai is usually a little more expensive than N. Virginia) and change over time. Always check the current price with the **AWS Pricing Calculator** or the **Pricing API**.

### 2. Monthly estimate: the formula
~~~text
monthly cost = hourly price x hours running x number of instances
             + storage GB x price per GB-month
             + requests x price per request
             + GB out to the internet x price per GB
~~~
One t3.micro all month: 720 h x $0.0104 = **$7.49**. Run it only during office hours (≈ 220 h): **$2.29**. Switching things off is a pricing model too.

### 3. How commitments discount
~~~text
              cost per hour
On-Demand     ##########################  100%
Savings Plan  ##############              ~ 50-70% of On-Demand (1yr / 3yr, payment option)
Spot          ###                         ~ 10-40% of On-Demand (varies, interruptible)
~~~
More upfront payment and a longer term give a bigger discount (3-year all-upfront is the cheapest commitment).

### 4. How Spot works
~~~text
AWS capacity in ap-south-1a: [used by On-Demand/RI][ spare ]
                                                    ^ Spot runs here, cheaply
On-Demand demand rises -> AWS needs the spare -> 2-minute interruption notice -> Spot instance stopped/terminated
~~~
Design for interruption: checkpoint work, use many instance types and AZs, and let an Auto Scaling group replace capacity.

### 5. Free things and free tiers
- Inbound data transfer, IAM, VPC itself, CloudFormation (for AWS resources), Auto Scaling (you pay for instances).
- **Free Tier**: new accounts get free usage or credits for a period, plus "always free" offers (e.g. Lambda's monthly free requests). The details changed in July 2025; you'll study them in the Free Tier lesson.

### 6. The cost-management tools
| Tool | Answers |
|---|---|
| **AWS Pricing Calculator** | "What will this design cost?" (before you build) |
| **Pricing API** | Programmatic price lookup |
| **Cost Explorer** | "What did I spend, on what, and what's the forecast?" |
| **AWS Budgets** | "Tell me before I spend more than X" |
| **Cost and Usage Report / Data Exports** | Line-by-line billing data for analysis |
| **Cost allocation tags** | "Which team or project spent it?" |
| **Compute Optimizer / Trusted Advisor** | "What could I right-size or switch off?" |
