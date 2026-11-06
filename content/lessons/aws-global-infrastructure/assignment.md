## Independent assignment: place a learning app for India and the Gulf

An online learning company serves students in India and the UAE. Videos are the main content. Student records from India must stay in India; records from UAE students must stay in the UAE. The app must survive the loss of a data centre.

### Part A: Design (no AWS needed)
1. Choose a Region for Indian students and one for UAE students (give codes and names). Which of them are opt-in?
2. How many AZs would you use in each Region, and why?
3. How would you deliver videos quickly to both countries without copying student records across borders?
4. Draw the architecture in ASCII like the one in "Architecture".

### Part B: Explore on Floci
Always use `--endpoint-url http://localhost:4566`. Name resources starting `ama-l1-edu`.
1. Show both chosen Regions with their opt-in status in one table.
2. List the AZs and zone IDs of both Regions.
3. Create one bucket in each Region (`ama-l1-edu-in-…`, `ama-l1-edu-ae-…`) and prove each bucket's location.
4. Create a CloudFront distribution in front of the Indian bucket and show its domain and origin.
5. Clean up: disable and delete the distribution, delete both buckets, and prove nothing `ama-l1-edu` remains.

### Part C: Explain (100–150 words)
The CTO suggests putting everything in us-east-1 "because it's cheapest and has every service". Explain what's wrong with that for this company.

### Self-assessment
- [ ] Each country's records stay in an in-country Region (e.g. ap-south-1 / me-central-1).
- [ ] Each Region uses at least two AZs.
- [ ] Videos use CloudFront; records are not replicated across countries.
- [ ] Part C mentions data residency first, then latency.
- [ ] No `ama-l1-edu` resources or distributions remain.
