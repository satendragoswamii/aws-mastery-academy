## Independent assignment: price a tuition-centre website

A tuition centre runs a website and a nightly job that generates student reports.
- Website: needs **2 x t3.small** all the time, and **2 more** from 4 pm to 10 pm every day for homework traffic.
- Report job: needs **4 x m5.large** for 2 hours every night. If it's interrupted, it can restart.
- The centre may move to a newer instance family next year.

### Part A: Price it (use Floci's price list)
1. Use the Pricing API (step 1) to look up the On-Demand hourly price of `t3.small` and `m5.large` in us-east-1. Show the commands and output.
2. Calculate the monthly On-Demand cost (30 days) of: the 2 always-on servers, the 2 peak servers, and the report job. Show your working.
3. Choose a pricing model for each of the three parts and justify it in one sentence each. Which commitment type fits "may change instance family"?

### Part B: Protect the budget on Floci
1. Create a monthly cost budget `ama-l1-tuition` at **your total from A2, rounded up**.
2. Add two alerts: actual > 80% and **forecasted** > 100%.
3. Show the budget table and both notifications. Then delete it and prove it's gone.

### Part C: Explain (100–150 words)
The owner asks: "Can't we just put everything on Spot? It's the cheapest." Answer them.

### Self-assessment
- [ ] The prices came from the Pricing API, not from memory.
- [ ] The peak servers are costed for 6 hours/day, the job for 2 hours/day.
- [ ] Always-on servers use a commitment (Compute Savings Plan because of the family change); peaks use On-Demand; the job uses Spot.
- [ ] Part C explains interruption: the website must not go down when Spot capacity is reclaimed.
- [ ] No `ama-l1-tuition` budget remains.
