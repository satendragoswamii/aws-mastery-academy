## Independent assignment: make a ticket-booking site AZ-resilient

A cinema ticket site runs today on **one** EC2 instance in ap-south-1a with its database files on an EBS volume, and stores ticket PDFs on the same volume. At peak it needs the capacity of 4 servers.

### Part A: Design (no AWS needed)
1. Classify each current component as AZ, Regional or global scope.
2. Redesign it to survive the loss of any one AZ. How many servers per AZ with 2 AZs, and with 3? Show the N/(N−1) calculation.
3. Where should the ticket PDFs live instead of EBS, and why?
4. List two things that would still break if the database stays single-AZ.

### Part B: Build on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`. Name resources starting `ama-l1-cinema`.
1. Launch one instance in each of the three AZs (`ama-l1-cinema-a/b/c`) and show a table of name, AZ and state.
2. Create an 8 GiB gp3 volume in ap-south-1c and prove it can't attach to the 1a instance (paste the error), then attach it to the 1c instance.
3. Prove the instances can't be seen from `--region ap-south-2`.
4. Clean up: detach and delete the volume, terminate all instances, and wait until they're terminated.

### Part C: Explain (100–150 words)
In real AWS, the 1a server's host fails and you must bring its EBS data up in ap-south-1b. Describe the exact steps and commands.

### Self-assessment
- [ ] Part A uses 3 AZs x 2 servers (6) or 2 AZs x 4 servers (8), with the calculation.
- [ ] PDFs moved to S3 (Regional, multi-AZ).
- [ ] The cross-AZ attach error is shown, and the same-AZ attach works.
- [ ] Part C uses create-snapshot, then create-volume from the snapshot in ap-south-1b, then attach.
- [ ] No `ama-l1-cinema` instances are running and the volume is deleted.
