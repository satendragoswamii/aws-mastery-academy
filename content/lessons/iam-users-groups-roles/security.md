## Security and best practices

### People
- Use **IAM Identity Center** (federation) for people where possible; when using IAM users, give permissions **only through groups**.
- Review group membership regularly, and remove leavers the same day.
- Avoid inline policies on individual users; they are easy to forget during reviews.

### Workloads
- Every workload gets **its own role** with the narrowest permissions. Never share one role between unrelated applications.
- On EC2, require **IMDSv2** so credentials can't be stolen through simple request forgery.
- Never copy access keys onto servers or into container images when a role can be used.

### Trust policies deserve as much care as permissions
- Trust specific principals: a service, one account, or specific role ARNs. Avoid `"Principal": {"AWS": "*"}`, which would let anyone in the world try to assume the role.
- For third parties, require an **external ID**, and grant read-only permissions with short sessions.
- For roles used by people, require **MFA** with `aws:MultiFactorAuthPresent` in the trust policy.
- Remember that this lab can't test trust policies (Floci doesn't evaluate them). Use **IAM Access Analyzer** on real AWS to find roles that external accounts can assume.

### Monitor role use
CloudTrail records every `AssumeRole`, with the caller and the session name. Set meaningful session names (`build-1873`, a user name) so investigations are quick.

### The academy's own safety rules
All commands used `--endpoint-url http://localhost:4566`. Account `111122223333` is AWS's documentation example ID, not a real partner. Every user, group, role, profile and instance was removed at the end.
