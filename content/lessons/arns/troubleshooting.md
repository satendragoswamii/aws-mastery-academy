## Troubleshooting

### Lab issues (seen on Floci 2.4.0 with AWS CLI 2.35.9)
| Symptom | Cause | Fix |
|---|---|---|
| `NotFound … Topic does not exist` when publishing | Wrong Region (or a malformed ARN) in `--topic-arn` (step 5, on purpose) | Copy the ARN from `create-topic` or `list-topics` |
| `AccessDenied … sts:AssumeRole on resource: …role/ama-l2-arn-deployer` | The role's path `/ci/` was left out, so it is a different role | Use the full role ARN, `role/ci/ama-l2-arn-deployer` |
| `ResourceNotFoundException … can't find the specified secret` | Wrong random suffix in a full secret ARN | Use the exact ARN, the name, or the partial ARN without the suffix |
| Simulator says `implicitDeny` for `s3:GetObject` | The policy names the bucket ARN, not `bucket/*` (step 6) | Add a statement for `arn:aws:s3:::bucket/*` |
| `cut` shows only part of the resource | Split on every colon | Use `cut -d: -f6-` |
| `get-resources` still lists a deleted table or topic | Floci keeps stale tag entries | Untag before deleting (step 7) |
| A policy with `${aws:username}` behaves strangely after `cat > file <<JSON` | The shell expanded `${aws:username}` | Quote the heredoc marker: `<<'JSON'` |

### Real-world ARN problems
| Message or symptom | Cause | Fix |
|---|---|---|
| `InvalidParameter … Invalid parameter: TopicArn` | Malformed ARN (typo, missing field) | Copy the ARN rather than typing it |
| `MalformedPolicyDocument … Resource … must be in ARN format` | A name instead of an ARN in `Resource` | Write the full ARN |
| AccessDenied for some files only | Pattern too narrow (wrong prefix, wrong case) | Compare the ARN pattern with the object key character by character |
| Policy works in one Region only | Region hard-coded in the ARN | Use the right Region, or `*` in the Region field if intended |
| Template fails in China or GovCloud | `arn:aws` hard-coded | Use `${AWS::Partition}` |
| Trust policy rejects an assumed role | An assumed-role ARN was used where the role ARN was needed (or the reverse) | Trust policies name the role or account; session ARNs appear in logs and conditions |
| Lambda permission or alias mix-up | Qualified ARN (`function:name:alias`) versus unqualified ARN | Use the form the integration expects |
