## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws s3api create-bucket --bucket <b> --create-bucket-configuration LocationConstraint=<region>` | Creates a bucket in a chosen Region |
| `aws s3 sync <local-dir> s3://<bucket>` | Uploads new and changed files (backup direction) |
| `aws s3 sync s3://<bucket> <local-dir>` | Downloads new and changed files (restore direction) |
| `aws s3 ls s3://<bucket> --recursive` | Lists every object, with size and date |
| `aws s3 rb s3://<bucket> --force` | Deletes all objects, then the bucket (lab clean-up only) |

### `s3 sync` options that matter
| Option | Effect | Use when |
|---|---|---|
| `--exclude "<pattern>"` | Skips matching files | Leaving out temp files, caches, secrets |
| `--include "<pattern>"` | Re-includes files after an exclude | `--exclude "*" --include "*.csv"` copies only CSVs |
| `--delete` | Removes destination files missing from the source | Mirroring a website build, **not** for backups |
| `--dryrun` | Shows what would happen; changes nothing | **Always** before a `--delete` you're unsure about |
| `--no-progress` | Hides the live progress line | Scripts, logs, and cleaner output |
| `--size-only` | Compares by size only, not timestamp | Rare; when timestamps aren't reliable |

### Patterns are relative to the source folder
`--exclude "*.tmp"` matches `.tmp` files anywhere under the folder you're syncing. To exclude a folder: `--exclude "cache/*"`.

### Try it yourself
Back up only CSV files, and preview first:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 sync ama-office s3://ama-l1-office-backup \
  --exclude "*" --include "*.csv" --dryrun
~~~

On the demo data, before step 7's clean-up, this prints `(dryrun) upload: …` only for CSVs that aren't yet in the bucket, and nothing if the backup is already up to date.

### Habit: preview destructive commands
`--dryrun` exists for `s3 sync`, `s3 cp` and `s3 rm` (and many EC2 commands accept `--dry-run`, with a hyphen). Use it whenever a command can delete or overwrite.
