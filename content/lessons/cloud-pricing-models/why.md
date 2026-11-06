## Why pricing models matter

### The same workload can cost very different amounts
A server running all year at On-Demand rates might cost X. The same server on a 3-year Savings Plan can cost well under half of X. A batch job on Spot can cost a tenth. Choosing the right model is often the **biggest cost lever** you have, bigger than tuning code.

### CapEx becomes OpEx
Buying servers is **capital expenditure**: a large payment up front, sized for a guessed peak, depreciated over years. Cloud is **operational expenditure**: pay monthly for what you use. That frees cash, lowers the risk of a new project (stop it and the costs stop), and lets a small team try ideas without asking for a hardware budget.

### Surprise bills are real
Beginners' surprise bills almost always come from:
- something left running (an instance, a NAT gateway, a load balancer) after a tutorial,
- outbound **data transfer**,
- a leaked access key used for crypto-mining,
- an expensive instance type chosen by mistake.

A budget with alerts, set on day one, catches all of these early.

### Cost is an architecture pillar
The Well-Architected Framework has a **Cost Optimization** pillar. Architects are expected to explain not just that a design works, but what it costs and how it could cost less: right-sizing, auto scaling, the right storage class, and the right purchase option.

## Why this matters for you
CLF-C02 **Domain 4 (Billing, Pricing, and Support)** is about 12% of the exam, and pricing-model questions are some of the easiest marks once you know the table in "What". For your own learning, a budget alert protects you if you ever use a real AWS account.
