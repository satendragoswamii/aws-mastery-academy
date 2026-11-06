## Independent assignment: secure a clinic's patient files

A small clinic wants to store scanned prescriptions in AWS. Requirements: files must never be public, must be encrypted with a key the clinic controls, receptionists may upload but not delete, doctors may read, and the app's database password must not be in the code.

### Part A: Design (no AWS needed)
1. List which **CIA** property each requirement protects.
2. Write two IAM policies in JSON: `receptionist` (upload only, to `prescriptions/*`) and `doctor` (read only, `prescriptions/*`, plus list the bucket).
3. Which **two** permissions does a doctor need to read an SSE-KMS file? Where is each one granted?
4. Name four layers of defence in depth for this system, and what each one stops.

### Part B: Build it on Floci
Always use `--endpoint-url http://localhost:4566` and `--region ap-south-1`. Name everything starting `ama-l1-clinic`.
1. Create a KMS key with alias `alias/ama-l1-clinic-key` and prove that encrypt/decrypt works.
2. Create the bucket with all four Block Public Access settings on and SSE-KMS default encryption with your key. Show both configurations.
3. Prove that a public bucket policy is refused, and paste the error.
4. Upload a sample file with SSE-KMS and show its encryption with `head-object`.
5. Create the two users with your policies, and use `simulate-principal-policy` to show a table of `PutObject`, `GetObject` and `DeleteObject` for each.
6. Store the database password in Secrets Manager, encrypted with your key.
7. Clean up everything, schedule the key for deletion (7 days), and prove nothing `ama-l1-clinic` remains (the key in `PendingDeletion` is fine).

### Part C: Explain (100–150 words)
On Floci, your receptionist's own access keys could probably delete a file. Explain why that happens, what real AWS would do, and how the simulator lets you prove your design anyway.

### Self-assessment
- [ ] Neither policy uses `"*"` for actions or resources.
- [ ] The simulator shows receptionist: Put allowed, Get/Delete denied; doctor: Get allowed, Put/Delete denied.
- [ ] Block Public Access refused the public policy.
- [ ] The secret is encrypted with your key, not the default.
- [ ] Part C correctly says Floci doesn't enforce IAM, and real AWS would return AccessDenied.
