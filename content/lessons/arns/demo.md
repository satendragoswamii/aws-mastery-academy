## Reading, using and writing ARNs

**Lab tier: 🟢 Fully supported in Floci** for every command below. These exact commands were run with AWS CLI 2.35.9 against Floci 2.4.0 on 2026-11-07. The account ID is Floci's `000000000000`; on real AWS it is your 12-digit account number.

> Work in one Terminal window from start to finish: step 1 saves the KMS key ARN in `$KEY`, and later steps use it.

### Step 1: Collect ARNs from six services

~~~bash
mkdir -p ~/ama-arns && cd ~/ama-arns
aws --endpoint-url http://localhost:4566 --region ap-south-1 sts get-caller-identity --query Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs create-queue --queue-name ama-l2-arn-orders --query QueueUrl --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/ama-l2-arn-orders --attribute-names QueueArn --query Attributes.QueueArn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sns create-topic --name ama-l2-arn-alerts --query TopicArn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table --table-name ama-l2-arn-stock --attribute-definitions AttributeName=item,AttributeType=S --key-schema AttributeName=item,KeyType=HASH --billing-mode PAY_PER_REQUEST --query TableDescription.TableArn --output text
KEY=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 kms create-key --description 'ama arn lesson' --query KeyMetadata.Arn --output text); echo "$KEY"
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager create-secret --name ama-l2-arn/db-password --secret-string 'lab-only-not-real' --query ARN --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 logs create-log-group --log-group-name /ama/l2/arn-app
aws --endpoint-url http://localhost:4566 --region ap-south-1 logs describe-log-groups --log-group-name-prefix /ama/l2/arn --query 'logGroups[].arn' --output text
~~~

~~~text
arn:aws:iam::000000000000:root
http://localhost:4566/000000000000/ama-l2-arn-orders
arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders
arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts
arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l2-arn-stock
arn:aws:kms:ap-south-1:000000000000:key/c3638a6e-f570-4ee7-8c5d-bf2128c59238
arn:aws:secretsmanager:ap-south-1:000000000000:secret:ama-l2-arn/db-password-RGV758
arn:aws:logs:ap-south-1:000000000000:log-group:/ama/l2/arn-app:*
~~~

Every AWS resource has an ARN, including **you**. The queue is the odd one out: SQS gives you a **URL** to work with, and you ask for the ARN separately.

- The caller ARN (`…:root`) has **no Region** because IAM is global.
- SQS, SNS, DynamoDB, KMS, Secrets Manager and CloudWatch Logs are Regional, so their ARNs contain `ap-south-1` **and** the account.
- The resource part looks different for each service: a bare name (SQS, SNS), `type/name` (DynamoDB, KMS), or `type:name` (Secrets Manager, Logs).
- Secrets Manager added **six random characters** (`-RGV758` here) to the end of the ARN. Yours will differ.
- The log group ARN ends in `:*`, meaning "this log group and every log stream in it".

### Step 2: ARNs with empty fields, paths and special accounts

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 mb s3://ama-l2-arn-files
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-user --user-name ama-l2-arn-dev --path /team/backend/ --query User.Arn --output text
cat > trust.json <<'JSON'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":"arn:aws:iam::000000000000:root"},"Action":"sts:AssumeRole"}]}
JSON
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-role --role-name ama-l2-arn-deployer --path /ci/ --assume-role-policy-document file://trust.json --query Role.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sts assume-role --role-arn arn:aws:iam::000000000000:role/ci/ama-l2-arn-deployer --role-session-name build-42 --query AssumedRoleUser.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam get-policy --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess --query Policy.Arn --output text
~~~

~~~text
make_bucket: ama-l2-arn-files
arn:aws:iam::000000000000:user/team/backend/ama-l2-arn-dev
arn:aws:iam::000000000000:role/ci/ama-l2-arn-deployer
arn:aws:sts::000000000000:assumed-role/ama-l2-arn-deployer/build-42
arn:aws:iam::aws:policy/ReadOnlyAccess
~~~

- **S3 bucket ARNs have no Region and no account** (`arn:aws:s3:::name`) because bucket names are unique worldwide. Note the **three colons**.
- **IAM ARNs have no Region** but do have the account. The **path** (`/team/backend/`, `/ci/`) becomes part of the ARN.
- When you assume a role, your temporary identity is an **assumed-role ARN** in the `sts` service: `assumed-role/ROLE-NAME/SESSION-NAME`. The role's path is **dropped** here, and the session name you chose (`build-42`) appears, which is how CloudTrail tells sessions apart.
- AWS managed policies use the word **`aws` in the account field**: `arn:aws:iam::aws:policy/ReadOnlyAccess`.

### Step 3: Take an ARN apart

An ARN is six fields separated by colons, but the **resource part may contain colons too**. This shell function splits on the first five colons only (the last variable of `read` gets everything left over):

~~~bash
arnparts() { IFS=: read -r prefix partition service region account resource <<< "$1"; printf 'partition=%s service=%s region=%s account=%s resource=%s\n' "$partition" "$service" "${region:-(none)}" "${account:-(none)}" "$resource"; }
arnparts arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders
arnparts arn:aws:s3:::ama-l2-arn-files
arnparts arn:aws:iam::000000000000:user/team/backend/ama-l2-arn-dev
arnparts 'arn:aws:logs:ap-south-1:000000000000:log-group:/ama/l2/arn-app:*'
echo 'arn:aws:logs:ap-south-1:000000000000:log-group:/ama/l2/arn-app:*' | cut -d: -f6
echo 'arn:aws:logs:ap-south-1:000000000000:log-group:/ama/l2/arn-app:*' | cut -d: -f6-
~~~

~~~text
partition=aws service=sqs region=ap-south-1 account=000000000000 resource=ama-l2-arn-orders
partition=aws service=s3 region=(none) account=(none) resource=ama-l2-arn-files
partition=aws service=iam region=(none) account=000000000000 resource=user/team/backend/ama-l2-arn-dev
partition=aws service=logs region=ap-south-1 account=000000000000 resource=log-group:/ama/l2/arn-app:*
log-group
log-group:/ama/l2/arn-app:*
~~~

- Empty fields print as `(none)`: S3 has neither Region nor account; IAM has no Region.
- `cut -d: -f6` returned only `log-group` and silently lost the rest. Use `-f6-` ("field 6 **to the end**") or the function above. Never split an ARN on every colon.

### Step 4: ARNs as inputs

Many APIs accept an ARN wherever they need to identify something:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sns subscribe --topic-arn arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts --protocol sqs --notification-endpoint arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders --query SubscriptionArn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb describe-table --table-name arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l2-arn-stock --query Table.TableStatus --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms create-alias --alias-name alias/ama-l2-arn-app --target-key-id "$KEY"
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms describe-key --key-id arn:aws:kms:ap-south-1:000000000000:alias/ama-l2-arn-app --query KeyMetadata.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager describe-secret --secret-id arn:aws:secretsmanager:ap-south-1:000000000000:secret:ama-l2-arn/db-password --query Name --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 resourcegroupstaggingapi tag-resources --tags project=ama-arn --resource-arn-list arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l2-arn-stock --query FailedResourcesMap
aws --endpoint-url http://localhost:4566 --region ap-south-1 resourcegroupstaggingapi get-resources --tag-filters Key=project,Values=ama-arn --query 'ResourceTagMappingList[].ResourceARN' --output text | tr '\t' '\n'
~~~

~~~text
arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts:d7cd802e-658d-49f9-87f2-1dad8a8a3a0e
ACTIVE
arn:aws:kms:ap-south-1:000000000000:key/c3638a6e-f570-4ee7-8c5d-bf2128c59238
ama-l2-arn/db-password
arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l2-arn-stock
arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts
arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders
~~~

1. **SNS subscribe** needs the queue's **ARN** (not its URL). The subscription has its own ARN: the topic ARN plus `:` and an ID.
2. **DynamoDB** accepts the table ARN instead of the table name.
3. **KMS aliases have ARNs too** (`…:alias/ama-l2-arn-app`); `describe-key` follows the alias to the real key ARN.
4. **Secrets Manager** accepts a **partial ARN** without the random suffix.
5. **The tagging API works only with ARNs**: one call tags an SNS topic, an SQS queue and a DynamoDB table, and `get-resources` finds them all by tag, across services. `tag-resources` printed nothing because no resource failed.

### Step 5: Three wrong ARNs, and one right one

Most ARN mistakes produce "not found" or "access denied", not "bad ARN". Each of these is one small field wrong:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sns publish --topic-arn arn:aws:sns:eu-west-1:000000000000:ama-l2-arn-alerts --message 'wrong Region'
aws --endpoint-url http://localhost:4566 --region ap-south-1 sts assume-role --role-arn arn:aws:iam::000000000000:role/ama-l2-arn-deployer --role-session-name build-43 --query AssumedRoleUser.Arn --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager describe-secret --secret-id arn:aws:secretsmanager:ap-south-1:000000000000:secret:ama-l2-arn/db-password-ZZZZZZ --query Name --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sns publish --topic-arn arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts --message 'right Region' --query MessageId --output text
~~~

~~~text
aws: [ERROR]: An error occurred (NotFound) when calling the Publish operation: Topic does not exist.

aws: [ERROR]: An error occurred (AccessDenied) when calling the AssumeRole operation: User: arn:aws:iam::000000000000:root is not authorized to perform: sts:AssumeRole on resource: arn:aws:iam::000000000000:role/ama-l2-arn-deployer

aws: [ERROR]: An error occurred (ResourceNotFoundException) when calling the DescribeSecret operation: Secrets Manager can't find the specified secret.
7b677848-52e4-40d6-9f85-e218cf2e77c8
~~~

| ARN mistake | What happened |
|---|---|
| Region `eu-west-1` instead of `ap-south-1` | The topic doesn't exist there, so `NotFound` |
| Role ARN without its path `/ci/` | A different (non-existent) role, so `AccessDenied` |
| Secret ARN with a made-up suffix `-ZZZZZZ` | `ResourceNotFoundException` |

The last command, with the correct ARN, published successfully. When something "doesn't exist", **compare the ARN field by field** with the one AWS gave you.

### Step 6: ARNs in policies, and the bucket-versus-object mistake

In IAM policies the `Resource` element is a list of ARNs, and they may contain wildcards: `*` matches any characters (including `/`), and `?` matches exactly one. The simulator tests a policy without needing real users:

~~~bash
cat > reports-broken.json <<'JSON'
{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:ListBucket","s3:GetObject"],"Resource":"arn:aws:s3:::ama-l2-arn-files"}]}
JSON
cat > reports-fixed.json <<'JSON'
{"Version":"2012-10-17","Statement":[
 {"Effect":"Allow","Action":"s3:ListBucket","Resource":"arn:aws:s3:::ama-l2-arn-files"},
 {"Effect":"Allow","Action":"s3:GetObject","Resource":"arn:aws:s3:::ama-l2-arn-files/reports/*"},
 {"Effect":"Allow","Action":"sqs:SendMessage","Resource":"arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-*"},
 {"Effect":"Allow","Action":"s3:PutObject","Resource":"arn:aws:s3:::ama-l2-arn-files/home/${aws:username}/*"}]}
JSON
sim() { printf '%-16s %-62s %s\n' "$2" "$3" "$(aws --endpoint-url http://localhost:4566 --region ap-south-1 iam simulate-custom-policy --policy-input-list "$(cat $1)" --action-names $2 --resource-arns $3 --context-entries ContextKeyName=aws:username,ContextKeyValues=ama-l2-arn-dev,ContextKeyType=string --query 'EvaluationResults[0].EvalDecision' --output text)"; }
echo '--- broken policy'
sim reports-broken.json s3:ListBucket arn:aws:s3:::ama-l2-arn-files
sim reports-broken.json s3:GetObject arn:aws:s3:::ama-l2-arn-files/reports/jan.csv
echo '--- fixed policy'
sim reports-fixed.json s3:GetObject arn:aws:s3:::ama-l2-arn-files/reports/jan.csv
sim reports-fixed.json s3:GetObject arn:aws:s3:::ama-l2-arn-files/reports/2026/q1.csv
sim reports-fixed.json s3:GetObject arn:aws:s3:::ama-l2-arn-files/hr/salaries.csv
sim reports-fixed.json sqs:SendMessage arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders
sim reports-fixed.json sqs:SendMessage arn:aws:sqs:eu-west-1:000000000000:ama-l2-arn-orders
sim reports-fixed.json sqs:SendMessage arn:aws:sqs:ap-south-1:000000000000:AMA-L2-ARN-orders
sim reports-fixed.json s3:PutObject arn:aws:s3:::ama-l2-arn-files/home/ama-l2-arn-dev/cv.pdf
sim reports-fixed.json s3:PutObject arn:aws:s3:::ama-l2-arn-files/home/priya/cv.pdf
~~~

~~~text
--- broken policy
s3:ListBucket    arn:aws:s3:::ama-l2-arn-files                                  allowed
s3:GetObject     arn:aws:s3:::ama-l2-arn-files/reports/jan.csv                  implicitDeny
--- fixed policy
s3:GetObject     arn:aws:s3:::ama-l2-arn-files/reports/jan.csv                  allowed
s3:GetObject     arn:aws:s3:::ama-l2-arn-files/reports/2026/q1.csv              allowed
s3:GetObject     arn:aws:s3:::ama-l2-arn-files/hr/salaries.csv                  implicitDeny
sqs:SendMessage  arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders          allowed
sqs:SendMessage  arn:aws:sqs:eu-west-1:000000000000:ama-l2-arn-orders           implicitDeny
sqs:SendMessage  arn:aws:sqs:ap-south-1:000000000000:AMA-L2-ARN-orders          implicitDeny
s3:PutObject     arn:aws:s3:::ama-l2-arn-files/home/ama-l2-arn-dev/cv.pdf       allowed
s3:PutObject     arn:aws:s3:::ama-l2-arn-files/home/priya/cv.pdf                implicitDeny
~~~

**The broken policy** allowed `s3:GetObject` on `arn:aws:s3:::ama-l2-arn-files`. That is the **bucket**; objects are `arn:aws:s3:::ama-l2-arn-files/KEY`. So listing worked but reading every file was denied. This is the most common ARN mistake in real policies.

**The fixed policy** shows how ARN patterns behave:
- `reports/*` matched `reports/jan.csv` **and** `reports/2026/q1.csv` (`*` crosses `/`), but not `hr/salaries.csv`.
- `ama-l2-arn-*` matched only in `ap-south-1`: the Region is part of the ARN, so `eu-west-1` was denied.
- `AMA-L2-ARN-orders` was denied: **ARN matching is case-sensitive**.
- `home/${aws:username}/*` is a **policy variable**: user `ama-l2-arn-dev` may write only under its own folder, not under `priya`'s.

`${aws:username}` is why the heredoc uses `'JSON'` in quotes: the shell must not try to expand it. The policy is passed as `"$(cat file)"`, not `file://` (see lesson 25).

### Step 7: Clean up

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 resourcegroupstaggingapi untag-resources --tag-keys project --resource-arn-list arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts arn:aws:sqs:ap-south-1:000000000000:ama-l2-arn-orders arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l2-arn-stock --query FailedResourcesMap
aws --endpoint-url http://localhost:4566 --region ap-south-1 sns delete-topic --topic-arn arn:aws:sns:ap-south-1:000000000000:ama-l2-arn-alerts
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs delete-queue --queue-url http://localhost:4566/000000000000/ama-l2-arn-orders
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table --table-name ama-l2-arn-stock --query TableDescription.TableName --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rb s3://ama-l2-arn-files --force
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user --user-name ama-l2-arn-dev
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-role --role-name ama-l2-arn-deployer
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager delete-secret --secret-id ama-l2-arn/db-password --force-delete-without-recovery --query Name --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 logs delete-log-group --log-group-name /ama/l2/arn-app
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms delete-alias --alias-name alias/ama-l2-arn-app
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms schedule-key-deletion --key-id "$KEY" --pending-window-in-days 7 --query KeyId --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 resourcegroupstaggingapi get-resources --tag-filters Key=project,Values=ama-arn --query 'length(ResourceTagMappingList)'
cd ~ && rm -r ~/ama-arns
~~~

~~~text
ama-l2-arn-stock
remove_bucket: ama-l2-arn-files
ama-l2-arn/db-password
arn:aws:kms:ap-south-1:000000000000:key/c3638a6e-f570-4ee7-8c5d-bf2128c59238
0
~~~

Tags are removed first (see "Floci vs. real AWS"). The KMS key can't be deleted immediately; it waits 7 days. The final `0` confirms no tagged resources remain.

### Floci vs. real AWS
- **Account ID:** Floci always uses `000000000000`. Real ARNs show your 12-digit account ID.
- **Malformed or wrong-Region SNS ARN:** Floci answers `NotFound`; real AWS answers `InvalidParameter` for a malformed ARN and usually `NotFound` (or an endpoint/Region error) for a wrong Region.
- **Stale tags:** after deleting a DynamoDB table or SNS topic, Floci still lists its ARN in `resourcegroupstaggingapi get-resources`. Real AWS removes it. That is why step 7 untags first.
- **Assumed-role ARN, partial secret ARNs, KMS alias ARNs, policy wildcards, case sensitivity and policy variables** all behaved as on real AWS.
