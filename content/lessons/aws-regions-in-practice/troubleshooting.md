## Troubleshooting

### Lab issues (seen on Floci 2.4.0 with AWS CLI 2.35.9)
| Symptom | Cause | Fix |
|---|---|---|
| `BucketAlreadyOwnedByYou` when creating a bucket in another Region | Bucket names are global (step 2, on purpose) | Choose a different name, e.g. with the Region in it |
| Every simulator result is `implicitDeny`, even for allowed requests | The policy was passed with `file://`; for this list parameter the CLI split it into one item per character | Pass it as `--policy-input-list "$(cat policy.json)"` |
| `ParameterNotFound` for `/aws/service/global-infrastructure/...` | Floci doesn't include AWS's public parameters | Real AWS only |
| `UnsupportedOperation … CreateSnapshot is not supported` | Floci has no EBS snapshots | Cross-Region snapshot copies are real AWS only |
| `KMSInvalidStateException … is pending deletion` | The key was already scheduled for deletion | Nothing to do; it is already on its way out |

### Real-world Region problems
| Message | Cause | Fix |
|---|---|---|
| A resource "disappeared" | Console/CLI pointed at a different Region | Check the Region selector or `aws configure list`; run an all-Regions inventory |
| `PermanentRedirect` / `The bucket you are attempting to access must be addressed using the specified endpoint` | S3 request sent to the wrong Region | Use the bucket's Region (`get-bucket-location`) |
| `AccessDenied … with an explicit deny in a service control policy` | A Region fence SCP blocks that Region | Use an approved Region, or ask for the SCP to be changed |
| A global service breaks after adding a Region SCP | The service wasn't exempted with `NotAction` | Add it to the exemptions |
| `AuthFailure` or `OptInRequired` in a newer Region | The opt-in Region isn't enabled | Enable it in Account settings (if allowed) |
| `KMS … key not found` when decrypting in another Region | A single-Region key was used | Use a multi-Region key, or re-encrypt with a key in that Region |
| Unexpected data transfer charges | Data moved between Regions | Keep apps and data in the same Region; review replication |
| An inventory loop skips a Region you used | That Region is opt-in and not enabled, so the filtered list omits it | Use `describe-regions --all-regions`, or enable the Region |
