## Three recoveries: undo a deletion, restore a table, use a second Region

**Lab tier: 🟡 Partially supported in Floci.** These commands were run against Floci 2.4.0 on 2026-11-04. S3 versioning, DynamoDB backups and restores, and copying between Regions all work in Floci. **Automatic S3 Replication does not**: Floci accepts the configuration but never copies anything. So in Part C you copy to the second Region yourself, which is exactly the **backup and restore** strategy.

> **Important habit:** every command includes `--endpoint-url http://localhost:4566`. Run the lab from your home folder (`cd ~`).

### Part A: Undo an accidental deletion (S3 Versioning)

#### Step 1: Create a bucket and turn on versioning

~~~bash
cd ~
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket --bucket ama-l1-shop-data \
  --create-bucket-configuration LocationConstraint=ap-south-1 --query Location --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-bucket-versioning \
  --bucket ama-l1-shop-data --versioning-configuration Status=Enabled
~~~

~~~text
/ama-l1-shop-data
~~~

(`put-bucket-versioning` prints nothing on success.)

#### Step 2: Upload the price list, then overwrite it with a mistake

~~~bash
echo "laddoo 450, barfi 520" > prices.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 cp prices.txt s3://ama-l1-shop-data/prices.txt --no-progress
echo "laddoo 4.50, barfi 5.20" > prices.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 cp prices.txt s3://ama-l1-shop-data/prices.txt --no-progress
~~~

~~~text
upload: ./prices.txt to s3://ama-l1-shop-data/prices.txt
upload: ./prices.txt to s3://ama-l1-shop-data/prices.txt
~~~

The second upload has the wrong prices (₹4.50 instead of ₹450).

#### Step 3: The disaster: someone deletes it

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rm s3://ama-l1-shop-data/prices.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 ls s3://ama-l1-shop-data/
~~~

~~~text
delete: s3://ama-l1-shop-data/prices.txt
~~~

`s3 ls` prints nothing. The file looks gone.

#### Step 4: Look at the history

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-object-versions --bucket ama-l1-shop-data \
  --prefix prices.txt \
  --query '[Versions[].[VersionId,IsLatest,Size,LastModified], DeleteMarkers[].[VersionId,IsLatest,`delete-marker`,LastModified]][]' \
  --output text
~~~

Expected output (your version IDs and times will differ):

~~~text
c64026ad-5fa3-493d-b9af-235c300746ac	False	24	2026-11-04T13:06:22+00:00
be23258f-3a7e-43f0-98ae-58840508ac01	False	22	2026-11-04T13:06:21+00:00
2a826792-e609-414b-a4be-56ff216e56e9	True	delete-marker	2026-11-04T13:06:22+00:00
~~~

Nothing was really deleted. S3 added a **delete marker** on top, and both versions are still stored:
- **22 bytes**: the original, correct price list.
- **24 bytes**: the mistaken one.

#### Step 5: Restore the correct version
Copy the good version back as the new current version. Use **your** 22-byte version ID:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api copy-object --bucket ama-l1-shop-data --key prices.txt \
  --copy-source 'ama-l1-shop-data/prices.txt?versionId=be23258f-3a7e-43f0-98ae-58840508ac01' \
  --query VersionId --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 cp s3://ama-l1-shop-data/prices.txt -
~~~

~~~text
fabc431c-83da-4462-9002-896d314d9ad8
laddoo 450, barfi 520
~~~

The correct prices are back, as a **new** version (the mistakes are still in the history, too). `s3 cp … -` prints a file to the screen.

### Part B: Restore a deleted table (DynamoDB backup)

#### Step 6: A table with data

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table --table-name ama-l1-loyalty \
  --attribute-definitions AttributeName=customerId,AttributeType=S \
  --key-schema AttributeName=customerId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --query TableDescription.TableStatus --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb put-item --table-name ama-l1-loyalty \
  --item '{"customerId":{"S":"C-1"},"name":{"S":"Asha"},"points":{"N":"1200"}}'
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb put-item --table-name ama-l1-loyalty \
  --item '{"customerId":{"S":"C-2"},"name":{"S":"Ravi"},"points":{"N":"300"}}'
~~~

~~~text
ACTIVE
~~~

#### Step 7: The nightly backup

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-backup --table-name ama-l1-loyalty \
  --backup-name ama-l1-loyalty-nightly --query 'BackupDetails.[BackupName,BackupStatus]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb list-backups --table-name ama-l1-loyalty \
  --query 'BackupSummaries[].[BackupName,BackupStatus]' --output text
~~~

~~~text
ama-l1-loyalty-nightly	CREATING
ama-l1-loyalty-nightly	AVAILABLE
~~~

#### Step 8: The disaster: the table is deleted

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table --table-name ama-l1-loyalty \
  --query TableDescription.TableName --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb list-tables --output text
~~~

~~~text
ama-l1-loyalty
~~~

`list-tables` prints nothing: the table is gone. **The backup isn't.** On-demand backups live on after the table is deleted.

#### Step 9: Restore, and measure your RTO

~~~bash
BACKUP_ARN=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb list-backups \
  --table-name ama-l1-loyalty --query 'BackupSummaries[0].BackupArn' --output text)
time ( aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb restore-table-from-backup \
         --target-table-name ama-l1-loyalty --backup-arn "$BACKUP_ARN" --query 'TableDescription.TableStatus' --output text \
       && aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb wait table-exists --table-name ama-l1-loyalty )
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb scan --table-name ama-l1-loyalty \
  --query 'Items[].[customerId.S,name.S,points.N]' --output text
~~~

Expected output (timing will differ):

~~~text
CREATING
( aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb      )  0.40s user 0.11s system 49% cpu 1.032 total
C-1	Asha	1200
C-2	Ravi	300
~~~

Both customers are back. On Floci the restore took about **1 second**. **On real AWS, restoring a table takes minutes to hours depending on its size**, and you must also count the time to notice the problem and decide to restore. Measuring this is how you learn your **real** RTO.

The RPO here is "everything since the last backup". Any loyalty points earned after step 7 would be lost, which is why production tables also use **point-in-time recovery** (see the CLI section).

### Part C: Keep a copy in a second Region

#### Step 10: Create the recovery bucket in Hyderabad

~~~bash
echo "C-1,Asha,1200" > customers.csv
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 cp customers.csv s3://ama-l1-shop-data/customers.csv --no-progress
aws --endpoint-url http://localhost:4566 --region ap-south-2 s3api create-bucket --bucket ama-l1-shop-data-dr \
  --create-bucket-configuration LocationConstraint=ap-south-2 --query Location --output text
~~~

~~~text
upload: ./customers.csv to s3://ama-l1-shop-data/customers.csv
/ama-l1-shop-data-dr
~~~

> **Floci vs. real AWS:** Hyderabad is an **opt-in** Region (remember `not-opted-in` from the *Data centres* lesson). Floci lets you create the bucket anyway. Real AWS requires the Region to be enabled for your account first.

#### Step 11: Copy everything to the recovery Region

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-2 s3 sync s3://ama-l1-shop-data s3://ama-l1-shop-data-dr --no-progress
aws --endpoint-url http://localhost:4566 --region ap-south-2 s3 ls s3://ama-l1-shop-data-dr/
aws --endpoint-url http://localhost:4566 --region ap-south-2 s3 cp s3://ama-l1-shop-data-dr/prices.txt -
~~~

~~~text
copy: s3://ama-l1-shop-data/customers.csv to s3://ama-l1-shop-data-dr/customers.csv
copy: s3://ama-l1-shop-data/prices.txt to s3://ama-l1-shop-data-dr/prices.txt
2026-11-04 18:36:45         14 customers.csv
2026-11-04 18:36:45         22 prices.txt
laddoo 450, barfi 520
~~~

If Mumbai were unavailable, the shop could now run from the Hyderabad copy. Notice that only the **current** versions were copied: the mistaken versions stayed behind.

> **⚠️ Safety: never add `--source-region` in this course.** When this lesson was tested, `aws --endpoint-url http://localhost:4566 s3 sync … --source-region ap-south-1 --region ap-south-2` sent the read request to **real AWS**, not Floci. Real AWS answered `InvalidAccessKeyId` because your credentials are dummies, so nothing happened, but the request still left your Mac. On real AWS, `--source-region` is a normal option for cross-Region copies; here, leave it out.

### Step 12: Clean up
A versioned bucket can't be removed until **every version and delete marker** is deleted, and `s3 rb --force` doesn't remove old versions. This command deletes them all:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api delete-objects --bucket ama-l1-shop-data \
  --delete "$(aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-object-versions --bucket ama-l1-shop-data \
  --query '{Objects: [Versions[].{Key:Key,VersionId:VersionId}, DeleteMarkers[].{Key:Key,VersionId:VersionId}][]}' --output json)" \
  --query 'length(Deleted)'
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rb s3://ama-l1-shop-data
aws --endpoint-url http://localhost:4566 --region ap-south-2 s3 rb s3://ama-l1-shop-data-dr --force
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table --table-name ama-l1-loyalty \
  --query TableDescription.TableName --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-backup --backup-arn "$BACKUP_ARN" \
  --query 'BackupDescription.BackupDetails.BackupStatus' --output text
rm ~/prices.txt ~/customers.csv
~~~

~~~text
5
remove_bucket: ama-l1-shop-data
delete: s3://ama-l1-shop-data-dr/customers.csv
delete: s3://ama-l1-shop-data-dr/prices.txt
remove_bucket: ama-l1-shop-data-dr
ama-l1-loyalty
DELETED
~~~

The `5` is the number of versions and markers deleted. The recovery bucket wasn't versioned, so `--force` was enough there.

### Floci vs. real AWS
- **S3 Replication:** Floci accepts `put-bucket-replication` but doesn't copy objects. In real AWS, replication (with versioning on both buckets and an IAM role) copies new objects automatically.
- **Opt-in Regions:** Floci allows `ap-south-2` without opting in; real AWS doesn't.
- **Restore speed:** instant on Floci; minutes to hours on real AWS.
- **Versioning, delete markers, backups and restores** behaved like real AWS in this run.
