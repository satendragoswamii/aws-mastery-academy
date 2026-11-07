## Security and best practices

### Least privilege is written in ARNs
- Replace `"Resource": "*"` with the exact ARNs a workload needs. Step 6 showed how precise patterns can be: one prefix, one Region, one user's folder.
- Keep wildcards **narrow and at the end** (`orders-*`, `reports/*`). A wildcard in the account or Region field widens access to every account or Region.
- Test every pattern with the **policy simulator** before attaching it, including requests that should be **denied**.

### Watch the bucket-versus-object split
- Bucket actions (ListBucket, GetBucketPolicy) use `arn:aws:s3:::bucket`; object actions (GetObject, PutObject) use `arn:aws:s3:::bucket/*`.
- Granting `arn:aws:s3:::bucket*` by accident also matches **other buckets** whose names start the same way (`bucket-backup`, `bucket-prod`).

### Resource-based policies and confused deputies
- When a service (SNS, S3 events, CloudWatch) writes to your resource, restrict it with `aws:SourceArn` and `aws:SourceAccount` so only **your** topic or bucket can use that permission.
- Principals in bucket, key and trust policies are ARNs. Double-check the account ID: a typo grants access to a stranger's account.

### Are ARNs secret?
ARNs, including account IDs, are **identifiers, not credentials**. Knowing one doesn't grant access. Still, avoid publishing them unnecessarily: account IDs help attackers target phishing and enumeration. Never treat an ARN as proof of identity.

### The academy's own safety rules
Every command used `--endpoint-url http://localhost:4566` and `--region ap-south-1`. The secret value was a made-up lab value, every resource was deleted, and the KMS key was scheduled for deletion.
