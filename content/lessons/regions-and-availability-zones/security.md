## Security and best practices

### Availability (the A in CIA)
1. **Never put all production copies in one AZ.** Use at least two AZs, preferably three.
2. **Duplicate AZ-scoped dependencies** (NAT gateways, standby databases) per AZ.
3. **Back up AZ-bound data** (EBS snapshots, AWS Backup) so you can rebuild in another AZ.
4. **Test it.** Simulate an AZ loss (AWS Fault Injection Service can do this in real AWS) to prove your design survives.

### Data protection
- **Encrypt EBS volumes** (account-level "encryption by default" setting in each Region). Snapshots of encrypted volumes are encrypted too.
- **Snapshots and AMIs can be shared.** Never make them public unless you mean to; public snapshots have leaked data in real incidents.
- Copying snapshots to another Region for DR also copies the data, so check data-residency rules first.

### Region hygiene
- **Know which Regions you use**, and alert on resources created anywhere else (CloudTrail in all Regions, GuardDuty, SCPs).
- Terminated instances disappear, but **volumes may not**: detached volumes keep costing money and keep data. Clean them up.

### In this lab
- Floci instances are local containers; they're terminated in step 6.
- The `ama-l1-` prefix and tags make the lab's resources easy to identify and remove.
