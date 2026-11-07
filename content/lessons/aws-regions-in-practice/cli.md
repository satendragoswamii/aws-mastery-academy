## CLI reference for this lesson

### Finding Regions and resources
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 ec2 describe-regions --filters Name=opt-in-status,Values=opt-in-not-required,opted-in --query 'Regions[].RegionName' --output text` | Enabled Regions only |
| `aws --endpoint-url http://localhost:4566 ec2 describe-regions --all-regions` | All Regions, including disabled opt-in ones |
| `aws --endpoint-url http://localhost:4566 s3api get-bucket-location --bucket B` | Which Region a bucket lives in (`None`/`null` means us-east-1) |
| `aws --endpoint-url http://localhost:4566 sqs get-queue-attributes --queue-url URL --attribute-names QueueArn` | The ARN shows the Region |
| `for r in $REGIONS; do aws --endpoint-url http://localhost:4566 --region $r …; done` | Inventory across Regions |

### Copying and replicating
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 --region DEST s3 cp s3://src/key s3://dest/key` | Server-side copy between Regions (no `--source-region` in this academy) |
| `aws --endpoint-url http://localhost:4566 secretsmanager create-secret … --add-replica-regions Region=R` | Secret with a replica |
| `aws --endpoint-url http://localhost:4566 secretsmanager replicate-secret-to-regions --secret-id S --add-replica-regions Region=R` | Add a replica later |
| `aws --endpoint-url http://localhost:4566 secretsmanager remove-regions-from-replication --secret-id S --remove-replica-regions R` | Remove a replica |
| `aws --endpoint-url http://localhost:4566 kms create-key --multi-region` | Primary multi-Region key (`mrk-…`) |
| `aws --endpoint-url http://localhost:4566 kms replicate-key --key-id K --replica-region R` | Replica key in another Region |

### Fencing Regions
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam simulate-custom-policy --policy-input-list "$(cat policy.json)" --action-names A --context-entries ContextKeyName=aws:RequestedRegion,ContextKeyValues=R,ContextKeyType=string` | Test a Region policy before using it |

### Try it yourself
1. Extend the step 3 inventory loop to also count S3 buckets **per Region** (hint: `list-buckets` is global, so use `get-bucket-location` for each bucket).
2. Change `india-only.json` to allow only `eu-west-1` and `eu-central-1`, and test `ec2:RunInstances` in `eu-central-1`, `ap-south-1`, and `cloudfront:CreateDistribution` in `us-east-1`. Explain each result.
3. Add a second replica of the step 5 secret in `eu-west-1` with `replicate-secret-to-regions`, then list its `ReplicationStatus`. Clean up both replicas before deleting it.
