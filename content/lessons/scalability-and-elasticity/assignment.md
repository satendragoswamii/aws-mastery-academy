## Independent assignment: plan and rehearse a festival sale

An online sweets shop normally needs **2** web servers. On the three days before Diwali it needs up to **8**. It must never run fewer than 2 (one per AZ), and finance has capped the fleet at **10**.

### Part A: Design (no AWS needed)
1. Choose **min, max and desired** values for normal days, and explain each.
2. Which **scaling policies** would you use for (a) the known Diwali rush and (b) unexpected spikes? Explain why using both makes sense.
3. The app currently stores shopping carts in server memory. Explain what goes wrong at scale-in, and how to fix it.
4. Would you scale the database **up** or **out**? Justify it.

### Part B: Rehearse on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.

1. Create a launch template `ama-l1-sweets` (`t3.micro`, image `ami-0abcdef1234567891`).
2. Create an ASG `ama-l1-sweets-asg` with your Part A values, across **ap-south-1a** and **ap-south-1b**.
3. Show the instances and their AZs once the group is filled.
4. Add a **scheduled action** that sets desired capacity to 8 at a future date and time, and list it with `describe-scheduled-actions`.
5. Simulate the rush: set desired capacity to 8, wait, and show 8 instances across both AZs.
6. Simulate the end of the sale: return to your normal desired capacity and show the result.
7. Try to exceed the finance cap and paste the error.
8. Show the last 5 scaling activities.
9. Clean up: delete the group (with its instances) and the template, then prove nothing is left running.

### Part C: Reflect (100–150 words)
Your manager asks, "Why not just run 8 servers all the time? It's simpler." Answer with numbers: compare instance-hours over a 30-day month (3 peak days at 8, 27 normal days at 2) against 8 servers all month.

### Self-assessment
- [ ] Min is at least 2 and spread over 2 AZs; max is no more than 10.
- [ ] You named scheduled scaling for Diwali and target tracking for surprises.
- [ ] You moved carts out of server memory (e.g. DynamoDB or ElastiCache).
- [ ] Part C: 8 × 720 = 5,760 instance-hours versus (8 × 72) + (2 × 648) = 1,872, about 67% less.
- [ ] Nothing named `ama-l1-sweets*` remains.
