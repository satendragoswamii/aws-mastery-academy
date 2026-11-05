## Independent assignment: design and build a three-tier network

A hospital booking system needs: a load balancer facing the internet, application servers, and a database holding patient data. It must survive the loss of one AZ.

### Part A: Design (no AWS needed)
1. Choose a VPC CIDR and **six** subnet CIDRs (public, app and data tiers, each in two AZs). Show that none overlap and all fit inside the VPC.
2. For each subnet, state its route table's routes (IGW, NAT gateway or local only).
3. Write the three security groups as rules that reference each other (load balancer → app → database).
4. How many usable addresses does each of your subnets have? Show the calculation.

### Part B: Build it on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`. Tag everything with names starting `ama-l1-hosp`.
1. Create the VPC and all six subnets (ap-south-1a and ap-south-1b).
2. Create and attach an internet gateway, and a public route table associated with **both** public subnets.
3. Create the three security groups with your rules (`--source-group` between tiers).
4. Show a table of all six subnets with CIDR, AZ and available addresses.
5. Show both route tables and which subnets use each.
6. Prove that creating an overlapping subnet fails, and paste the error.
7. Clean up in the right order and prove the VPC is gone.

### Part C: Troubleshoot (100–150 words)
Months later, the app servers can't download security updates from the internet, but the website works. Using the "walk the path" list, explain the most likely cause and the fix.

### Self-assessment
- [ ] No overlapping CIDRs; everything fits in the VPC.
- [ ] Only the public subnets route 0.0.0.0/0 to the internet gateway.
- [ ] The database group allows its port only from the app group.
- [ ] Part C identifies the missing NAT gateway route (or a broken NAT gateway) for the private app subnets.
- [ ] No `ama-l1-hosp` resources remain; the default VPC is untouched.
