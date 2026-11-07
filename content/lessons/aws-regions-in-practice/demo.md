## One account, many Regions: placing, finding, copying and fencing resources

**Lab tier: 🟢 Fully supported in Floci** for every command below. These exact commands were run with AWS CLI 2.35.9 against Floci 2.4.0 on 2026-11-07. Two real-AWS features this lesson describes, the service-availability catalogue in Systems Manager and EBS snapshot copies, are not available in Floci; they appear only in "How it works", clearly labelled.

> **Every command names its Region with `--region`.** That is the habit this lesson builds: when you work across Regions, never rely on a default. Work in one Terminal window: `mkdir -p ~/ama-regions && cd ~/ama-regions`.

### Step 1: The same name in two Regions is two different things
~~~bash
mkdir -p ~/ama-regions && cd ~/ama-regions
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs create-queue --queue-name ama-l2-reg-orders --query QueueUrl --output text
aws --endpoint-url http://localhost:4566 --region eu-west-1 sqs create-queue --queue-name ama-l2-reg-orders --query QueueUrl --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs send-message --queue-url http://localhost:4566/000000000000/ama-l2-reg-orders --message-body 'order from Pune' --query MessageId --output text
for r in ap-south-1 eu-west-1; do
  aws --endpoint-url http://localhost:4566 --region $r sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/ama-l2-reg-orders --attribute-names QueueArn ApproximateNumberOfMessages --query 'Attributes.[QueueArn,ApproximateNumberOfMessages]' --output text
done
aws --endpoint-url http://localhost:4566 --region us-east-1 sqs list-queues --queue-name-prefix ama-l2-reg --query 'length(QueueUrls || `[]`)'
~~~

~~~text
http://localhost:4566/000000000000/ama-l2-reg-orders
http://localhost:4566/000000000000/ama-l2-reg-orders
809f9034-0c28-4b78-9f53-329cd817e772
arn:aws:sqs:ap-south-1:000000000000:ama-l2-reg-orders	1
arn:aws:sqs:eu-west-1:000000000000:ama-l2-reg-orders	0
0
~~~

Two queues with the **same name**, one in Mumbai and one in Ireland. They are completely separate: the message sent in Mumbai is only in Mumbai's queue, the **ARN contains the Region**, and from `us-east-1` there are none at all. (Floci shows the same queue URL in both Regions; real AWS URLs include the Region, such as `https://sqs.ap-south-1.amazonaws.com/…`.)

### Step 2: Global services and global names
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-user --user-name ama-l2-reg-auditor --query User.Arn --output text
aws --endpoint-url http://localhost:4566 --region eu-west-1 iam get-user --user-name ama-l2-reg-auditor --query User.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 mb s3://ama-l2-reg-menus-mumbai
aws --endpoint-url http://localhost:4566 --region eu-west-1 s3 mb s3://ama-l2-reg-menus-dublin
aws --endpoint-url http://localhost:4566 --region eu-west-1 s3api create-bucket --bucket ama-l2-reg-menus-mumbai --create-bucket-configuration LocationConstraint=eu-west-1
aws --endpoint-url http://localhost:4566 --region us-east-1 s3api list-buckets --query 'Buckets[?starts_with(Name,`ama-l2-reg`)].Name' --output text
for b in mumbai dublin; do aws --endpoint-url http://localhost:4566 --region us-east-1 s3api get-bucket-location --bucket ama-l2-reg-menus-$b --output text; done
~~~

~~~text
arn:aws:iam::000000000000:user/ama-l2-reg-auditor
arn:aws:iam::000000000000:user/ama-l2-reg-auditor
make_bucket: ama-l2-reg-menus-mumbai
make_bucket: ama-l2-reg-menus-dublin

aws: [ERROR]: An error occurred (BucketAlreadyOwnedByYou) when calling the CreateBucket operation: Your previous request to create the named bucket succeeded and you already own it.
ama-l2-reg-menus-mumbai	ama-l2-reg-menus-dublin
ap-south-1
eu-west-1
~~~

- **IAM is global:** the user created "in" Mumbai is visible from Ireland, and its ARN has **no Region** (`arn:aws:iam::…`).
- **S3 is Regional, but bucket names are global:** each bucket lives in one Region, yet the name `ama-l2-reg-menus-mumbai` can't be reused in Ireland. `list-buckets` from any Region shows every bucket; `get-bucket-location` tells you where each one lives.

### Step 3: An inventory across every enabled Region
Resources hide in Regions you forget to look at. This loop asks every Region your account has enabled:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table --table-name ama-l2-reg-stock --attribute-definitions AttributeName=item,AttributeType=S --key-schema AttributeName=item,KeyType=HASH --billing-mode PAY_PER_REQUEST --query TableDescription.TableArn --output text
REGIONS=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 ec2 describe-regions --filters Name=opt-in-status,Values=opt-in-not-required,opted-in --query 'Regions[].RegionName' --output text)
echo "Checking $(echo $REGIONS | wc -w | tr -d ' ') Regions"
for r in $REGIONS; do
  q=$(aws --endpoint-url http://localhost:4566 --region $r sqs list-queues --queue-name-prefix ama-l2-reg --query 'length(QueueUrls || `[]`)')
  t=$(aws --endpoint-url http://localhost:4566 --region $r dynamodb list-tables --query 'length(TableNames[?starts_with(@,`ama-l2-reg`)])')
  [ "$q$t" != "00" ] && echo "$r: queues=$q tables=$t"
done
echo "done"
~~~

~~~text
arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l2-reg-stock
Checking 17 Regions
ap-south-1: queues=1 tables=1
eu-west-1: queues=1 tables=0
done
~~~

Only the Regions that contain something are printed. Real teams run inventories like this (or use **AWS Config**, **Resource Explorer** or **Cost Explorer by Region**) to find forgotten resources that still cost money. The loop takes a few seconds per Region.

### Step 4: Copy data to another Region
~~~bash
printf 'Masala chai 20\nFilter coffee 25\n' > menu.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 cp menu.txt s3://ama-l2-reg-menus-mumbai/menu.txt --no-progress
aws --endpoint-url http://localhost:4566 --region eu-west-1 s3 cp s3://ama-l2-reg-menus-mumbai/menu.txt s3://ama-l2-reg-menus-dublin/menu.txt --no-progress
aws --endpoint-url http://localhost:4566 --region eu-west-1 s3 cp s3://ama-l2-reg-menus-dublin/menu.txt -
~~~

~~~text
upload: ./menu.txt to s3://ama-l2-reg-menus-mumbai/menu.txt
copy: s3://ama-l2-reg-menus-mumbai/menu.txt to s3://ama-l2-reg-menus-dublin/menu.txt
Masala chai 20
Filter coffee 25
~~~

One command copied the object from Mumbai to Ireland; S3 copies server-side, so the data doesn't pass through your computer. For continuous copies you would use **S3 Cross-Region Replication** instead (covered in the S3 lessons).

> **Never add `--source-region` in this academy.** That option makes the CLI send the source side of the copy to **real AWS**, ignoring `--endpoint-url`. Floci copies between Regions without it.

### Step 5: Replicate a secret to a disaster-recovery Region
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager create-secret --name ama-l2-reg-db --secret-string '{"user":"shop","password":"lab-only-not-real"}' --add-replica-regions Region=ap-south-2 --query 'ReplicationStatus[].[Region,Status]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-2 secretsmanager describe-secret --secret-id ama-l2-reg-db --query '[PrimaryRegion,ARN]' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-2 secretsmanager get-secret-value --secret-id ama-l2-reg-db --query SecretString --output text
~~~

~~~text
ap-south-2	InSync
ap-south-1	arn:aws:secretsmanager:ap-south-2:000000000000:secret:ama-l2-reg-db-BN2CMU
{"user":"shop","password":"lab-only-not-real"}
~~~

The secret was created in Mumbai (`ap-south-1`) with a **replica** in Hyderabad (`ap-south-2`). An application failing over to Hyderabad reads the same secret **locally**, with a Hyderabad ARN, even if Mumbai is unavailable. Updates are made on the primary and copied to replicas.

### Step 6: One encryption key in two Regions
~~~bash
KEY=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 kms create-key --multi-region --description 'ama-l2-reg card vault' --query KeyMetadata.KeyId --output text)
echo "$KEY"
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms replicate-key --key-id "$KEY" --replica-region ap-south-2 --query 'ReplicaKeyMetadata.MultiRegionConfiguration.MultiRegionKeyType' --output text
printf 'card-vault-secret' > plain.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms encrypt --key-id "$KEY" --plaintext fileb://plain.txt --query CiphertextBlob --output text | base64 --decode > cipher.bin
aws --endpoint-url http://localhost:4566 --region ap-south-2 kms decrypt --ciphertext-blob fileb://cipher.bin --query Plaintext --output text | base64 --decode; echo
aws --endpoint-url http://localhost:4566 --region ap-south-2 kms describe-key --key-id "$KEY" --query 'KeyMetadata.MultiRegionConfiguration.[MultiRegionKeyType,PrimaryKey.Region]' --output text
~~~

~~~text
mrk-02b371817d8340f7a6fb06ce141a0b82
REPLICA
card-vault-secret
REPLICA	ap-south-1
~~~

Normal KMS keys never leave their Region, so data encrypted in Mumbai can't be decrypted in Hyderabad. A **multi-Region key** (ID starting with `mrk-`) has related copies with the **same key material and key ID** in several Regions, so the ciphertext made in Mumbai was decrypted in Hyderabad without re-encrypting. Your key ID will differ.

### Step 7: Fence the account into approved Regions
Companies often allow only certain Regions (for data residency or cost control). The standard tool is a deny on **`aws:RequestedRegion`**, usually as a Service Control Policy. Test such a policy with the IAM policy simulator:

~~~bash
printf '%s' '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"},{"Effect":"Deny","NotAction":["iam:*","sts:*","organizations:*","cloudfront:*","route53:*","support:*"],"Resource":"*","Condition":{"StringNotEquals":{"aws:RequestedRegion":["ap-south-1","ap-south-2"]}}}]}' > india-only.json
for test in ec2:RunInstances,ap-south-1 ec2:RunInstances,eu-west-1 s3:CreateBucket,us-east-1 iam:CreateUser,us-east-1; do
  action=${test%,*}; region=${test#*,}
  printf '%-18s %-11s ' "$action" "$region"
  aws --endpoint-url http://localhost:4566 --region us-east-1 iam simulate-custom-policy --policy-input-list "$(cat india-only.json)" --action-names "$action" --context-entries "ContextKeyName=aws:RequestedRegion,ContextKeyValues=$region,ContextKeyType=string" --query 'EvaluationResults[0].EvalDecision' --output text
done
~~~

~~~text
ec2:RunInstances   ap-south-1  allowed
ec2:RunInstances   eu-west-1   explicitDeny
s3:CreateBucket    us-east-1   explicitDeny
iam:CreateUser     us-east-1   allowed
~~~

The policy is passed as `"$(cat india-only.json)"`, not `file://`: for this list parameter the CLI would split a `file://` policy into one item per character, and every result would come back `implicitDeny` (we hit exactly that while writing the lesson). Launching in Mumbai is allowed; Ireland and N. Virginia are denied. `iam:CreateUser` is still allowed even though its requested Region is `us-east-1`, because **global services** (IAM, STS, Organizations, CloudFront, Route 53, Support) send their requests to `us-east-1` and must be exempted with `NotAction`, or the policy would break them.

### Step 8: Clean up every Region
~~~bash
for r in ap-south-1 eu-west-1; do aws --endpoint-url http://localhost:4566 --region $r sqs delete-queue --queue-url http://localhost:4566/000000000000/ama-l2-reg-orders; done
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rb s3://ama-l2-reg-menus-mumbai --force
aws --endpoint-url http://localhost:4566 --region eu-west-1 s3 rb s3://ama-l2-reg-menus-dublin --force
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table --table-name ama-l2-reg-stock --query TableDescription.TableName --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user --user-name ama-l2-reg-auditor
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager remove-regions-from-replication --secret-id ama-l2-reg-db --remove-replica-regions ap-south-2 --query ARN --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager delete-secret --secret-id ama-l2-reg-db --force-delete-without-recovery --query Name --output text
aws --endpoint-url http://localhost:4566 --region ap-south-2 kms schedule-key-deletion --key-id "$KEY" --pending-window-in-days 7 --query DeletionDate --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms schedule-key-deletion --key-id "$KEY" --pending-window-in-days 7 --query DeletionDate --output text
for r in ap-south-1 ap-south-2; do aws --endpoint-url http://localhost:4566 --region $r kms describe-key --key-id "$KEY" --query 'KeyMetadata.KeyState' --output text; done
cd ~ && rm -r ~/ama-regions
~~~

~~~text
delete: s3://ama-l2-reg-menus-mumbai/menu.txt
remove_bucket: ama-l2-reg-menus-mumbai
delete: s3://ama-l2-reg-menus-dublin/menu.txt
remove_bucket: ama-l2-reg-menus-dublin
ama-l2-reg-stock
arn:aws:secretsmanager:ap-south-1:000000000000:secret:ama-l2-reg-db-BN2CMU
ama-l2-reg-db
2026-11-14T10:06:00+05:30
2026-11-14T10:06:00+05:30
PendingDeletion
PendingDeletion
~~~

Multi-Region clean-up needs care: the **replica** secret is removed before the primary, the **replica** key is scheduled for deletion before the primary key (on real AWS a primary key stays in `PendingReplicaDeletion` until its replicas are gone), and KMS keys wait at least 7 days. Run the step 3 loop again if you want proof that no queues or tables remain in any Region.

### Floci vs. real AWS
- **Not in Floci:** the public Systems Manager parameters that list which services each Region offers, and EBS `CreateSnapshot` (so cross-Region snapshot copies). Both are shown in "How it works" as real-AWS-only examples.
- **Queue URLs:** Floci uses `http://localhost:4566/ACCOUNT/NAME` in every Region; real AWS URLs include the Region. The ARNs are correct in Floci.
- **`list-buckets`:** real AWS also returns each bucket's `BucketRegion`; Floci returns `None`, so this lesson uses `get-bucket-location`.
- **KMS deletion:** Floci's `schedule-key-deletion` response omits `KeyState` (the key is still correctly `PendingDeletion`, as `describe-key` shows). On real AWS the primary key shows `PendingReplicaDeletion` until its replicas are deleted; Floci shows `PendingDeletion` straight away.
