## A scripted mini Well-Architected review of the shop backend

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci doesn't have the **Well-Architected Tool** or **Trusted Advisor** (both return `UnknownOperationException`), so we check real settings of real (Floci) resources with a small script instead. Every check reads the setting through the AWS API.

> Work in an empty folder: `mkdir -p ~/ama-wa && cd ~/ama-wa`.

### Step 1: Build the "first draft" backend
A bucket for receipts and logs, and an orders table with fixed capacity, the way many first versions start:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket --bucket ama-l1-wa-shop \
  --create-bucket-configuration LocationConstraint=ap-south-1 --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table --table-name ama-l1-wa-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PROVISIONED --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --query 'TableDescription.[TableName,TableStatus]' --output text
~~~

~~~text
/ama-l1-wa-shop
ama-l1-wa-orders	ACTIVE
~~~

### Step 2: Write the review script and run it
Create `wa-review.sh` with this content:

~~~bash
#!/bin/bash
# Mini Well-Architected review of the shop backend on Floci.
A="aws --endpoint-url http://localhost:4566 --region ap-south-1"
B=ama-l1-wa-shop; T=ama-l1-wa-orders
check() { if [ "$2" = "$3" ]; then echo "PASS  $1"; else echo "FAIL  $1 (found: ${2:-nothing})"; fi; }
check "Operational excellence: bucket has an Owner tag" \
  "$($A s3api get-bucket-tagging --bucket $B --query 'TagSet[?Key==`Owner`]|[0].Value' --output text 2>/dev/null)" "shop-team"
check "Operational excellence: alarm on order-table throttling" \
  "$($A cloudwatch describe-alarms --alarm-names ama-l1-wa-throttles --query 'length(MetricAlarms)' --output text)" "1"
check "Security: bucket blocks public policies" \
  "$($A s3api get-public-access-block --bucket $B --query PublicAccessBlockConfiguration.BlockPublicPolicy --output text 2>/dev/null)" "True"
check "Reliability: bucket versioning enabled" \
  "$($A s3api get-bucket-versioning --bucket $B --query Status --output text)" "Enabled"
check "Reliability: table point-in-time recovery" \
  "$($A dynamodb describe-continuous-backups --table-name $T --query ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus --output text)" "ENABLED"
check "Performance efficiency: table scales with spiky traffic (on-demand)" \
  "$($A dynamodb describe-table --table-name $T --query 'Table.BillingModeSummary.BillingMode' --output text)" "PAY_PER_REQUEST"
check "Cost optimization: old logs move to a cheaper storage class" \
  "$($A s3api get-bucket-lifecycle-configuration --bucket $B --query 'Rules[0].Transitions[0].StorageClass' --output text 2>/dev/null)" "STANDARD_IA"
check "Sustainability: logs are deleted when no longer needed" \
  "$($A s3api get-bucket-lifecycle-configuration --bucket $B --query 'Rules[0].Expiration.Days' --output text 2>/dev/null)" "365"
~~~

The script is run with `bash` (so the `$A` variable splits into words in any shell):

~~~bash
bash wa-review.sh
~~~

~~~text
FAIL  Operational excellence: bucket has an Owner tag (found: nothing)
FAIL  Operational excellence: alarm on order-table throttling (found: 0)
PASS  Security: bucket blocks public policies
FAIL  Reliability: bucket versioning enabled (found: None)
FAIL  Reliability: table point-in-time recovery (found: DISABLED)
FAIL  Performance efficiency: table scales with spiky traffic (on-demand) (found: None)
FAIL  Cost optimization: old logs move to a cheaper storage class (found: nothing)
FAIL  Sustainability: logs are deleted when no longer needed (found: nothing)
~~~

Seven findings. The one PASS is a **secure default**: new buckets get Block Public Access automatically.

### Step 3: Operational excellence: ownership and an alarm
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-bucket-tagging --bucket ama-l1-wa-shop \
  --tagging 'TagSet=[{Key=Owner,Value=shop-team},{Key=Environment,Value=lab}]'
aws --endpoint-url http://localhost:4566 --region ap-south-1 cloudwatch put-metric-alarm --alarm-name ama-l1-wa-throttles \
  --namespace AWS/DynamoDB --metric-name ThrottledRequests --dimensions Name=TableName,Value=ama-l1-wa-orders \
  --statistic Sum --period 300 --evaluation-periods 1 --threshold 1 --comparison-operator GreaterThanOrEqualToThreshold
~~~

Both print nothing on success. Now everyone knows who owns the bucket, and someone hears about it when orders are being throttled.

### Step 4: Reliability: protect against mistakes
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-bucket-versioning --bucket ama-l1-wa-shop \
  --versioning-configuration Status=Enabled
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb update-continuous-backups --table-name ama-l1-wa-orders \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
  --query 'ContinuousBackupsDescription.PointInTimeRecoveryDescription.PointInTimeRecoveryStatus' --output text
~~~

~~~text
ENABLED
~~~

Overwritten or deleted receipts can be recovered from older versions; the orders table can be restored to any second in the last 35 days.

### Step 5: Performance efficiency: match capacity to traffic
Sale days are spiky; fixed capacity of 5 would throttle. On-demand scales instantly:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb update-table --table-name ama-l1-wa-orders \
  --billing-mode PAY_PER_REQUEST --query 'TableDescription.BillingModeSummary.BillingMode' --output text
~~~

~~~text
PAY_PER_REQUEST
~~~

### Step 6: Cost optimization and sustainability: one lifecycle rule
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-bucket-lifecycle-configuration --bucket ama-l1-wa-shop \
  --lifecycle-configuration '{"Rules":[{"ID":"old-logs","Status":"Enabled","Filter":{"Prefix":"logs/"},"Transitions":[{"Days":30,"StorageClass":"STANDARD_IA"}],"Expiration":{"Days":365}}]}'
~~~

~~~text
{
    "TransitionDefaultMinimumObjectSize": "all_storage_classes_128K"
}
~~~

Logs move to the cheaper Standard-IA class after 30 days (**cost**) and are deleted after a year (**sustainability**: no storage for data nobody needs). The output says objects smaller than 128 KB aren't transitioned by default, since moving tiny objects costs more than it saves.

### Step 7: Review again
~~~bash
bash wa-review.sh
~~~

~~~text
PASS  Operational excellence: bucket has an Owner tag
PASS  Operational excellence: alarm on order-table throttling
PASS  Security: bucket blocks public policies
PASS  Reliability: bucket versioning enabled
PASS  Reliability: table point-in-time recovery
PASS  Performance efficiency: table scales with spiky traffic (on-demand)
PASS  Cost optimization: old logs move to a cheaper storage class
PASS  Sustainability: logs are deleted when no longer needed
~~~

### Step 8: Clean up
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 cloudwatch delete-alarms --alarm-names ama-l1-wa-throttles
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table --table-name ama-l1-wa-orders \
  --query TableDescription.TableName --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api delete-bucket --bucket ama-l1-wa-shop
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-buckets --query 'Buckets[?starts_with(Name,`ama-l1-wa`)].Name' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb list-tables --query 'TableNames[?starts_with(@,`ama-l1-wa`)]' --output text
~~~

~~~text
ama-l1-wa-orders
~~~

The bucket was empty, so it deletes even with versioning on. The last two commands print nothing: everything is gone.

### Floci vs. real AWS
- **No Well-Architected Tool or Trusted Advisor** on Floci. In real AWS, the Tool is free in the console. Trusted Advisor's full checks need a Business support plan or higher.
- **Alarms:** Floci's alarm stays in `INSUFFICIENT_DATA` because there's no real traffic; real AWS would evaluate DynamoDB's metrics.
- **Lifecycle rules** are stored but Floci never actually transitions or expires objects.
- **Billing mode:** a real provisioned table may report `BillingModeSummary` as missing (as here) or as `PROVISIONED`; the script treats anything other than `PAY_PER_REQUEST` as not on-demand. Real AWS also limits how often you can switch billing modes.
- **Matched real AWS:** Block Public Access on by default for new buckets, versioning, PITR status and lifecycle configuration.
