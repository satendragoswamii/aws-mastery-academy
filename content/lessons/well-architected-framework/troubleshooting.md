## Troubleshooting

### Lab issues (seen on Floci 2.4.0)
| Symptom | Cause | Fix |
|---|---|---|
| Every check FAILs, even after the fixes | You ran it with zsh (`zsh wa-review.sh` or `source`), which doesn't split `$A` into words; the errors are hidden by `2>/dev/null` | Run it with `bash wa-review.sh` |
| Every check FAILs with `found: nothing` | The bucket/table names in the script don't match what you created, or step 1 wasn't run | Check `B=` and `T=` in the script; run step 1 |
| `UnknownOperationException` from `aws wellarchitected …` or `aws support …` | Floci doesn't have the WA Tool or Trusted Advisor | Expected. Use the scripted review |
| Alarm state `INSUFFICIENT_DATA` | No metric data on Floci | Expected. The check only requires the alarm to exist |
| `ValidationException … is protected against deletion` | Deletion protection is on (from the CLI exercise) | `update-table --no-deletion-protection-enabled`, then delete |
| `BucketNotEmpty` on `delete-bucket` | Objects (or old versions) are in the bucket | Delete objects and versions first (`s3api list-object-versions`) |

### Review findings you can't fix immediately
- Record them as **risks** with an owner and a date, or as **accepted risks** with a reason.
- Prioritise **high-risk issues** that affect data, security or availability.
- Re-run the review after each fix: automated checks make that free.
