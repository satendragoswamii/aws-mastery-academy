## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 2, task 2.3:** access management, IAM policies and resources.

| Question wording | Answer |
|---|---|
| "uniquely identifies an AWS resource" | **ARN** (Amazon Resource Name) |
| "the element of a policy that says which resources" | **`Resource`**, a list of ARNs |
| "which part of an ARN is empty for IAM?" | The **Region** (IAM is global) |

### Solutions Architect – Associate (SAA-C03) and Security – Specialty (SCS-C02)
- Bucket ARN versus object ARN (`bucket` vs `bucket/*`) appears in many policy questions.
- Policy variables such as `${aws:username}` for per-user prefixes.
- `aws:SourceArn` and `aws:SourceAccount` to prevent the **confused deputy** problem in resource-based policies.
- Cross-account access: principals are ARNs with the other account's ID.
- Partitions: `aws`, `aws-cn`, `aws-us-gov`.

### Developer – Associate (DVA-C02)
- Lambda qualified ARNs (`:version` or `:alias`) versus unqualified ARNs.
- Services connected by ARN: SNS subscriptions, EventBridge targets, Step Functions tasks.

### Exam traps
- `arn:aws:s3:::bucket` doesn't allow reading objects.
- Wildcards are case-sensitive, and `*` crosses `/`.
- An assumed-role ARN uses `sts` and omits the role path.
- Secrets Manager ARNs end in a random suffix; policies use `secret:name-*`.
