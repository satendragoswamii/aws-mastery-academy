## Independent assignment: responsibility map for a school's results portal

A school runs its exam-results portal on AWS: a website on **EC2**, student records in **RDS MySQL**, PDF report cards in **S3**, and a **Lambda** function that emails parents when results are published.

### Part A: Map it (no AWS needed)
1. For each of the four services, write a table with two columns, **AWS** and **School**, listing at least four responsibilities each.
2. Classify each as inherited, shared or customer-specific: physical access to servers, patching, training staff, deciding that report cards are personal data.
3. A parent reports they could open another child's report card by changing a number in the URL. Whose responsibility is this, and which layer failed?
4. Which of the school's responsibilities would disappear if it moved the website from EC2 to a managed service? Name a suitable service.

### Part B: Baseline on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`.
1. Find any security groups allowing **RDP (port 3389)** from 0.0.0.0/0 and paste the result (it may be empty).
2. Set a password policy: minimum length 16, all character types, reuse prevention 10. Show it.
3. Turn on EBS encryption by default and prove a new 1 GiB volume (`ama-l1-school-vol`) is encrypted.
4. Create the Config rules `S3_BUCKET_PUBLIC_READ_PROHIBITED` and `ENCRYPTED_VOLUMES` (names starting `ama-l1-school`) and list them.
5. Restore everything: delete the rules, the volume and the password policy, and turn encryption by default off. Prove each is back to default.

### Part C: Explain (100–150 words)
The school's principal says: "We moved to AWS, so security is now Amazon's job." Write a polite reply.

### Self-assessment
- [ ] Every service's table puts data, IAM and access configuration under School.
- [ ] Part A3 identifies an application authorisation bug (customer responsibility).
- [ ] The new volume showed `Encrypted: True` without passing `--encrypted`.
- [ ] Step 5 restored all defaults, with proof.
- [ ] Part C explains "security of" vs. "security in" the cloud with an example.
