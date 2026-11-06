## AWS CLI commands in this lesson

| Command | What it does | Pillar |
|---|---|---|
| `aws s3api put-bucket-tagging --bucket … --tagging 'TagSet=[…]'` | Tags a bucket | Operational excellence / cost |
| `aws cloudwatch put-metric-alarm …` | Creates an alarm on a metric | Operational excellence |
| `aws cloudwatch describe-alarms --alarm-names …` | Shows alarms and their state | Operational excellence |
| `aws s3api get-public-access-block --bucket …` | Shows a bucket's Block Public Access | Security |
| `aws s3api put-bucket-versioning --versioning-configuration Status=Enabled` | Keeps old versions of objects | Reliability |
| `aws dynamodb update-continuous-backups --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true` | Turns on PITR | Reliability |
| `aws dynamodb update-table --billing-mode PAY_PER_REQUEST` | Switches to on-demand capacity | Performance efficiency / cost |
| `aws s3api put-bucket-lifecycle-configuration …` | Transitions and expires objects | Cost / sustainability |
| `aws wellarchitected create-workload …` | Creates a workload in the WA Tool (real AWS) | All |
| `aws wellarchitected list-lens-review-improvements …` | Lists improvement items (real AWS) | All |

### Making the review script better
`wa-review.sh` is deliberately simple. Ideas to extend it:
- Count FAILs and `exit 1` if there are any, so a CI/CD pipeline could block a deployment.
- Check **encryption** (`get-bucket-encryption`) and **table encryption** (`describe-table` → `SSEDescription`).
- Read the bucket and table names from arguments instead of hard-coding them.

### Try it yourself
1. Add a check "Reliability: table has deletion protection" using `describe-table --query Table.DeletionProtectionEnabled` (expected `True`), run the review, then fix it with `update-table --deletion-protection-enabled`. (Remember to turn it off before deleting the table.)
2. Turn versioning off on purpose (`Status=Suspended`) and run the review. Which line fails?
