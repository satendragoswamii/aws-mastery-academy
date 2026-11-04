## Build a hybrid backup, then recover from a mistake

**Lab tier: ✅ Verified executable in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04.

**Scenario:** a small accounting office keeps invoices on its own file server (on-premises). You'll back them up to cloud storage in Mumbai, keep the backup up to date, survive an accidental deletion, and restore everything at a second site. That's a hybrid setup in miniature.

- Your home folder plays the **office file server**.
- An S3 bucket on Floci plays the **public cloud**.

> **Important habit:** every AWS command includes `--endpoint-url http://localhost:4566`.

### Step 1: Create the "office" files
Run these from your home folder (`cd ~`):

~~~bash
cd ~
mkdir -p ama-office/invoices
echo "INV-001, 12000" > ama-office/invoices/2026-10.csv
echo "INV-002, 8500"  > ama-office/invoices/2026-11.csv
echo "draft"          > ama-office/scratch.tmp
~~~

`scratch.tmp` is a temporary file you **don't** want backed up.

### Step 2: Create the cloud side

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket \
  --bucket ama-l1-office-backup --create-bucket-configuration LocationConstraint=ap-south-1
~~~

Expected output:

~~~text
{
    "Location": "/ama-l1-office-backup"
}
~~~

### Step 3: First backup

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 sync ama-office s3://ama-l1-office-backup \
  --exclude "*.tmp" --no-progress
~~~

Expected output:

~~~text
upload: ama-office/invoices/2026-10.csv to s3://ama-l1-office-backup/invoices/2026-10.csv
upload: ama-office/invoices/2026-11.csv to s3://ama-l1-office-backup/invoices/2026-11.csv
~~~

The `.tmp` file was skipped. Check what's in the cloud:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 ls s3://ama-l1-office-backup --recursive
~~~

~~~text
2026-11-04 18:03:22         15 invoices/2026-10.csv
2026-11-04 18:03:22         14 invoices/2026-11.csv
~~~

### Step 4: New work arrives; back up again
~~~bash
echo "INV-003, 4300" > ama-office/invoices/2026-12.csv
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 sync ama-office s3://ama-l1-office-backup \
  --exclude "*.tmp" --no-progress
~~~

Expected output:

~~~text
upload: ama-office/invoices/2026-12.csv to s3://ama-l1-office-backup/invoices/2026-12.csv
~~~

Only the **new** file was uploaded. `sync` compares both sides and transfers only what's new or changed. That's why it suits regular backups.

### Step 5: An accident in the office
Someone deletes October's invoices on the file server:

~~~bash
rm ama-office/invoices/2026-10.csv
~~~

What would happen if the backup mirrored **exactly** what's in the office? `--delete` makes `sync` remove destination files that no longer exist at the source. Use `--dryrun` to see what it **would** do, without doing it:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 sync ama-office s3://ama-l1-office-backup \
  --exclude "*.tmp" --delete --dryrun
~~~

Expected output:

~~~text
(dryrun) delete: s3://ama-l1-office-backup/invoices/2026-10.csv
~~~

With `--delete`, the accident would have spread to the backup. **Without** it (as in steps 3 and 4), the cloud copy is safe.

### Step 6: Restore at a second site
The office floods. Recover everything at a new location (another folder plays the DR site):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 sync s3://ama-l1-office-backup ama-dr-site --no-progress
ls ama-dr-site/invoices
~~~

Expected output (download order may differ):

~~~text
download: s3://ama-l1-office-backup/invoices/2026-11.csv to ama-dr-site/invoices/2026-11.csv
download: s3://ama-l1-office-backup/invoices/2026-12.csv to ama-dr-site/invoices/2026-12.csv
download: s3://ama-l1-office-backup/invoices/2026-10.csv to ama-dr-site/invoices/2026-10.csv
2026-10.csv
2026-11.csv
2026-12.csv
~~~

All three invoices are back, **including the one deleted in step 5**.

### Step 7: Clean up
`rb --force` deletes every object in the bucket, then the bucket. Use it only on lab buckets.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rb s3://ama-l1-office-backup --force
rm -rf ~/ama-office ~/ama-dr-site
~~~

Expected output:

~~~text
delete: s3://ama-l1-office-backup/invoices/2026-10.csv
delete: s3://ama-l1-office-backup/invoices/2026-11.csv
delete: s3://ama-l1-office-backup/invoices/2026-12.csv
remove_bucket: ama-l1-office-backup
~~~

### Floci vs. real AWS
- The commands and outputs are the same in real AWS, apart from the `Location` value in step 2 (real AWS returns a URL).
- In real AWS the backup travels over the internet using HTTPS. For large volumes, companies use Direct Connect, AWS DataSync or AWS Storage Gateway instead of `s3 sync`.
- Real S3 stores your objects across multiple AZs automatically. In Floci everything is on your Mac, so this lab teaches the workflow, not real off-site protection.
