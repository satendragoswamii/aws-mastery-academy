## Troubleshooting

### Lab issues (seen on Floci 2.4.0 and the Floci UI)
| Symptom | Cause | Fix |
|---|---|---|
| `http://localhost:4500` doesn't load | The `floci-aws-ui` container isn't running | Check with `docker ps`; it starts alongside Floci (don't restart Floci from the academy) |
| A bucket created with the CLI doesn't appear | The page hasn't refreshed | Click **Refresh** in the Storage page |
| The table disappears after deleting | No buckets left, so the UI shows an empty state | Expected |
| `BucketNotEmpty` when deleting from the CLI | Objects are still inside | Use `aws s3 rb s3://NAME --force`, or delete objects first |
| The Region column shows `-` | The Floci UI doesn't display bucket Regions | Use `aws s3api get-bucket-location --bucket NAME` |

### Real AWS console problems
| Problem | Likely cause | Fix |
|---|---|---|
| "My resources disappeared" | Wrong **Region** selected | Check the Region selector; S3 lists all Regions |
| "You don't have permissions to…" | Your IAM identity lacks the action | Ask for the permission; the error names the action |
| Can't sign in as IAM user | Using the root sign-in page, or wrong account ID/alias | Use `https://<account>.signin.aws.amazon.com/console` |
| Session expired | Console sessions are time-limited | Sign in again; Identity Center sessions follow its settings |
| Page shows "Global" instead of a Region | You're in a global service (IAM, Route 53…) | Expected |
| CloudShell not available | Not offered in every Region, or blocked by IAM policy | Switch to a supported Region; check permissions |
