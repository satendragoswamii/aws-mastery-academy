## Independent assignment: a Region plan for a hospital booking app

A hospital chain in Chennai is building an appointment booking app. Patient data must stay in India, users are mostly in Tamil Nadu, and the app must keep working if one Region has a major problem.

### Part A: Plan (no AWS needed)
1. Choose a primary and a disaster-recovery Region, and justify each choice with the four Region questions.
2. List every piece of data and configuration that must exist in the second Region **before** an outage, and the AWS feature that gets it there.
3. Which disaster-recovery strategy (backup and restore, pilot light, warm standby, active/active) would you recommend for appointment booking, and why?

### Part B: Build it on Floci
Use `--endpoint-url http://localhost:4566` **and** an explicit `--region` on every command.
1. In `ap-south-1`, create a queue `ama-l2-hosp-bookings`, a table `ama-l2-hosp-patients` (key `patientId`) and a bucket `ama-l2-hosp-reports-mumbai`. Create bucket `ama-l2-hosp-reports-hyd` in `ap-south-2` and copy one report file into it from Mumbai.
2. Create a secret `ama-l2-hosp-db` (made-up value) with a replica in `ap-south-2`, and read it **from** `ap-south-2`.
3. Create a multi-Region KMS key with a replica in `ap-south-2`; encrypt a short text in Mumbai and decrypt it in Hyderabad.
4. Write `inventory.sh` (run with `bash`) that loops over all enabled Regions and prints only Regions containing `ama-l2-hosp` queues, tables or buckets (use `get-bucket-location` for buckets).
5. Write `india-only.json` and test it with the simulator for `dynamodb:CreateTable` in `ap-south-2` and `eu-west-1`, and `iam:CreateRole` in `us-east-1`.
6. Clean up every resource in both Regions (replicas first) and show `inventory.sh` printing nothing.

### Part C: Explain (100–150 words)
Explain to the hospital's managers why "we have backups" is not enough for disaster recovery unless they are in another Region and tested.

### Self-assessment
- [ ] Every command has `--endpoint-url http://localhost:4566` and `--region`; none uses `--source-region`.
- [ ] The secret and the decryption were read in `ap-south-2`.
- [ ] The simulator showed `allowed`, `explicitDeny` and `allowed` for the three tests.
- [ ] `inventory.sh` found resources in both Regions before clean-up, and nothing after.
- [ ] Replicas were removed before primaries.
