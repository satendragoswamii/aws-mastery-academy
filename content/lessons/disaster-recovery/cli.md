## AWS CLI commands in this lesson

### S3 Versioning
| Command | What it does |
|---|---|
| `aws s3api put-bucket-versioning --bucket … --versioning-configuration Status=Enabled` | Turns versioning on (it can later be *suspended*, never fully turned off) |
| `aws s3api get-bucket-versioning --bucket …` | Shows `Enabled`, `Suspended`, or nothing (never enabled) |
| `aws s3api list-object-versions --bucket … --prefix …` | Lists every version and delete marker |
| `aws s3api get-object --bucket … --key … --version-id … <file>` | Downloads one specific version |
| `aws s3api copy-object --bucket … --key … --copy-source 'bucket/key?versionId=…'` | Makes an old version current again |
| `aws s3api delete-object --bucket … --key … --version-id …` | Permanently deletes one version (or removes a delete marker) |

Undelete by removing the delete marker (use the marker's version ID):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api delete-object \
  --bucket ama-l1-shop-data --key prices.txt --version-id <delete-marker-version-id>
~~~

The previous version becomes current again.

### DynamoDB backups
| Command | What it does |
|---|---|
| `aws dynamodb create-backup --table-name … --backup-name …` | On-demand full backup |
| `aws dynamodb list-backups --table-name …` | Lists backups (they survive table deletion) |
| `aws dynamodb restore-table-from-backup --target-table-name … --backup-arn …` | Restores into a new table |
| `aws dynamodb update-continuous-backups --table-name … --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true` | Turns on point-in-time recovery |
| `aws dynamodb restore-table-to-point-in-time --source-table-name … --target-table-name … --restore-date-time …` | Restores to a chosen second (last 35 days) |
| `aws dynamodb delete-backup --backup-arn …` | Deletes a backup |

Turn on PITR (verified on Floci):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb update-continuous-backups --table-name ama-l1-loyalty \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --query 'ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus' --output text
~~~

~~~text
ENABLED
~~~

### Cross-Region copies
| Command | What it does |
|---|---|
| `aws s3 sync s3://source s3://destination` | Copies new and changed objects (in this course: `--region` of the destination, **no** `--source-region`) |
| `aws s3api put-bucket-replication --bucket … --replication-configuration file://…` | Sets up automatic replication (real AWS; accepted but not performed by Floci) |
