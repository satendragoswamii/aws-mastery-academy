## In the real world

### The forgotten tutorial
A student follows a tutorial, creates a NAT gateway and a load balancer, finishes, and closes the laptop. A NAT gateway and a load balancer each cost money every hour they exist, whether or not traffic flows. A month later there's a bill. The fix: a budget alert on day one, and always run the clean-up step, exactly as these lessons do.

### The startup that saved 60%
A startup ran everything On-Demand for its first year, which was the right choice while the architecture was changing every month. Once traffic stabilised, it bought a 1-year Compute Savings Plan covering its minimum 24/7 usage, moved its nightly data-processing jobs to Spot, and scheduled dev environments to stop at night. Same system, a much smaller bill.

### The video platform's data-transfer bill
A video site served files straight from EC2 instances. Its biggest bill line was **data transfer out**, not compute. Putting CloudFront in front (cheaper per GB and cached closer to viewers) cut both cost and load time.

### Big companies: FinOps
Large organisations have **FinOps** teams: engineers and finance working together. Every resource is tagged with an owner, each team sees its own costs in Cost Explorer, commitments (Savings Plans, RIs) are bought centrally through consolidated billing, and **Cost Anomaly Detection** alerts when spending suddenly changes.
