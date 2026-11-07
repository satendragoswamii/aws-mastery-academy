## Security and best practices

### Watch every Region, not just the ones you use
- Enable **CloudTrail** as a multi-Region (ideally organisation-wide) trail.
- Enable **GuardDuty**, **Security Hub** and **AWS Config** in **all** enabled Regions. Attackers with stolen credentials often launch resources in Regions they hope you ignore.
- Run an inventory (Resource Explorer, Config aggregator, or a loop like step 3) regularly, and look at costs **by Region**.

### Fence the account
- Use an **SCP** with `aws:RequestedRegion` to deny all but approved Regions, exempting global services with `NotAction`. Test it with the policy simulator before attaching it.
- Leave **opt-in Regions disabled** unless you need them.
- Remember the fence covers **API requests**; it doesn't stop users in other countries from reaching your applications. Data residency also depends on where replicas, backups and logs are stored.

### Replicas are copies of sensitive data
- A replica secret or bucket must be protected **as strongly as the original**: same encryption, access controls and monitoring in both Regions.
- Replicating encrypted data needs a key that works in the destination: a **multi-Region KMS key**, or re-encryption with a key in that Region.
- Deleting the primary doesn't automatically delete everything everywhere. Clean up replicas deliberately, as in step 8.

### Region-specific mistakes to avoid
- Don't use `--source-region` in this academy: it sends the source side of a copy to real AWS, ignoring `--endpoint-url`.
- Don't hard-code one Region's endpoint into an application that might fail over; read the Region from configuration.
- IAM is global: a policy change affects **every Region at once**, so test it carefully.

### The academy's own safety rules
Every command here passed both `--endpoint-url http://localhost:4566` and an explicit `--region`, and all resources, replicas and keys were removed or scheduled for deletion in step 8. The secret value was a made-up lab value.
