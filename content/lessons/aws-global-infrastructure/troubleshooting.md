## Troubleshooting

### Lab errors (seen on Floci 2.4.0)
| Error | Cause | Fix |
|---|---|---|
| `DistributionNotDisabled … has not been disabled` | You tried to delete an enabled distribution | Disable it with `update-distribution` (step 5), then delete |
| `InvalidIfMatchVersion … If-Match version is missing or not valid` | The ETag is wrong or out of date (real AWS says `PreconditionFailed` for an out-of-date one), or `$DIST` is empty | Fetch a fresh ETag right before each update/delete; check `echo $DIST` |
| `$DIST` is empty | New Terminal window | `cloudfront list-distributions --query 'DistributionList.Items[].Id'` |
| The opt-in filter returns every Region | Floci ignores `opt-in-status` filters | Use `--region-names` as in step 1 |
| `BucketNotEmpty` on `delete-bucket` | Objects are still in the bucket | `aws s3 rm s3://ama-l1-geo-site --recursive` first |

### "My resources disappeared" in real AWS
1. **Check the Region selector** (console, top right) or your CLI `--region`. This is the most common cause by far.
2. Check you're in the right **account** (`aws sts get-caller-identity`).
3. Global services (IAM, Route 53, CloudFront) show the same everywhere. Regional ones don't.

### "I can't use this Region"
- It's probably an **opt-in Region**: enable it under Account settings (or `aws account enable-region`). Enabling can take a few minutes.
- An **SCP** may deny it. Ask your organisation's administrator.
- The service may not be available in that Region yet. Check the AWS Regional Services list.
