## Troubleshooting

### Lab problems (seen on Floci 2.4.0)
| Symptom | Cause | Fix |
|---|---|---|
| `remove_bucket failed … BucketNotEmpty` after `s3 rb --force` | Versioned bucket: old versions and delete markers remain | Delete all versions with `delete-objects` (step 12), then `s3 rb` |
| `s3 ls` shows nothing, but you never deleted the bucket | The object's latest "version" is a delete marker | `list-object-versions`, then restore as in step 5 |
| `copy-object` restores the wrong content | You used the wrong version ID | Check the sizes and dates in `list-object-versions` |
| `fatal error: … (InvalidAccessKeyId) … ListObjectsV2` during a sync | `--source-region` sent the request to **real AWS** | Remove `--source-region`; keep only `--endpoint-url` and `--region` |
| `ResourceInUseException` on restore | A table with the target name already exists | Restore to a new name, or delete the old table first |
| `$BACKUP_ARN` is empty | Variable set in another window, or the backup was deleted | Re-run the `BACKUP_ARN=$(…)` line |
| Replicated bucket stays empty | Floci doesn't perform S3 Replication | Use `s3 sync` in the lab |

### Real-world DR problems
| Symptom | Likely cause | Fix |
|---|---|---|
| Restore takes far longer than the RTO | Never tested; large data; manual steps | Test restores regularly; automate with IaC; consider pilot light or warm standby |
| Restored data is days old | Backups failing silently, or too infrequent | Monitor backup jobs; use PITR or continuous replication |
| Backups deleted along with production | Same account and same admin rights | Separate backup account; Backup Vault Lock / Object Lock |
| Replica contains the same corruption | Replication copies every change, including bad ones | Keep versioned or point-in-time backups as well |
| Failover works but the app can't start | Secrets, configuration, AMIs or quotas missing in the recovery Region | Copy them too; include them in DR tests |
| Recovery Region not available | Opt-in Region never enabled | Enable it and set it up **before** you need it |
