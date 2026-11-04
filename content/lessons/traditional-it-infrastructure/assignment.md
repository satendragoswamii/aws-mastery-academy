## Independent assignment: build a mini TCO comparison

You're advising a small coaching institute in Pune. They run their student portal on one ageing server in the office and must decide whether to buy a new server or move to the cloud.

### The facts
- New server, storage and UPS: **₹6,00,000**, expected life **5 years**.
- Electricity and cooling for the server: about **₹4,000 per month**.
- A part-time IT contractor spends **8 hours per month** on it at **₹1,500 per hour**.
- Support contract after year 1: **₹40,000 per year**.
- Traffic is heavy for **3 months a year** (admissions and exam results) and light the rest of the time.
- Last year the server failed for **2 days** during results week.

### Part A: On-prem TCO (no AWS needed)
1. Calculate the 5-year on-prem TCO from the facts above. Show your working.
2. List at least **three costs that are not in the facts** but would exist in reality.
3. Explain what the 2-day outage cost them, even though it doesn't appear on any invoice.

### Part B: The cloud side, on Floci
Using only Floci (always with `--endpoint-url http://localhost:4566`):

1. Find the vCPUs and memory of a `t3.small` and a `t3.medium` with `describe-instance-types`.
2. Launch **two** `t3.small` instances in one command (hint: `--count 2`), tagged `Name=ama-l1-assignment`.
3. List them with a `--query` that shows only ID and state.
4. Terminate **both** in one command, then prove that no non-terminated instance with that tag remains.

Paste your commands and their real output into your notes.

### Part C: Your recommendation
In 150–250 words, recommend **buy** or **move to the cloud**. Use at least three of the six advantages of cloud computing **by name**, and name one honest risk or cost of your recommendation.

### Self-assessment
You've done this well if:
- [ ] Your TCO includes recurring costs, not just the ₹6 lakh.
- [ ] You explained the seasonal traffic in terms of capacity planning.
- [ ] Every Floci command includes `--endpoint-url`, and you cleaned up both instances.
- [ ] Your recommendation is balanced: it names a downside.

> Reference answer for Part A.1: hardware ₹6,00,000 + power ₹2,40,000 (₹4,000 × 60) + contractor ₹7,20,000 (8 × ₹1,500 × 60) + support ₹1,60,000 (₹40,000 × 4) = **₹17,20,000**, nearly three times the purchase price.
