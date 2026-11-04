## A crash-proof order queue

**Lab tier: ✅ Verified executable in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-04.

**Scenario:** a sweet shop's website puts each order in a queue, and a packing worker processes them. You'll play the worker: first one that **crashes**, then one that **succeeds**, and you'll make sure no order is ever lost or packed twice.

> **Important habit:** every command includes `--endpoint-url http://localhost:4566`.

### Step 1: Create the dead-letter queue
Orders that fail too often will go here.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs create-queue \
  --queue-name ama-l1-orders-dlq --query QueueUrl --output text
~~~

Expected output:

~~~text
http://localhost:4566/000000000000/ama-l1-orders-dlq
~~~

### Step 2: Create the order queue
- `VisibilityTimeout` 5: a received order is hidden for 5 seconds. If it isn't deleted by then, it comes back. (Real systems use 30 seconds or more; 5 makes the lab quick.)
- `RedrivePolicy`: after **2** failed receives, move the order to the DLQ.

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs create-queue --queue-name ama-l1-orders \
  --attributes '{"VisibilityTimeout":"5","RedrivePolicy":"{\"deadLetterTargetArn\":\"arn:aws:sqs:ap-south-1:000000000000:ama-l1-orders-dlq\",\"maxReceiveCount\":\"2\"}"}' \
  --query QueueUrl --output text
~~~

Expected output:

~~~text
http://localhost:4566/000000000000/ama-l1-orders
~~~

The `RedrivePolicy` value is JSON inside a JSON string, hence the `\"` escapes.

To save typing, store the two URLs:

~~~bash
Q=http://localhost:4566/000000000000/ama-l1-orders
DLQ=http://localhost:4566/000000000000/ama-l1-orders-dlq
~~~

### Part 1: The worker that crashes

#### Step 3: A customer places an order

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs send-message --queue-url $Q \
  --message-body '{"orderId":"ORD-2001","item":"laddoo box"}' --query MessageId --output text
~~~

Expected output (your ID will differ):

~~~text
1a35e221-89f3-45cc-abab-ebe2c30d1142
~~~

The website can now tell the customer "order received", even if no worker is running.

#### Step 4: The worker picks it up, then "crashes"

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $Q \
  --attribute-names ApproximateReceiveCount \
  --query 'Messages[0].[Body,Attributes.ApproximateReceiveCount]' --output text
~~~

Expected output:

~~~text
{"orderId":"ORD-2001","item":"laddoo box"}	1
~~~

The `1` means this is the first time it's been received. Now pretend the worker crashed: **don't** delete the message.

Another worker looks straight away:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $Q \
  --query 'Messages[0].Body' --output text
~~~

~~~text
None
~~~

The order is **invisible**, not gone. Nobody else can pick it up while the first worker might still be working on it.

#### Step 5: The order comes back
Wait **6 seconds** (longer than the visibility timeout), then receive again:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $Q \
  --attribute-names ApproximateReceiveCount \
  --query 'Messages[0].[Body,Attributes.ApproximateReceiveCount]' --output text
~~~

~~~text
{"orderId":"ORD-2001","item":"laddoo box"}	2
~~~

The crashed worker didn't lose the order. It's being retried, for the **second** time. Pretend this worker crashes too.

#### Step 6: The poison message is moved aside
Wait 6 seconds and try once more:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $Q \
  --query 'Messages[0].Body' --output text
~~~

~~~text
None
~~~

It's not in the order queue any more. Look in the DLQ:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $DLQ \
  --query 'Messages[0].Body' --output text
~~~

~~~text
{"orderId":"ORD-2001","item":"laddoo box"}
~~~

After `maxReceiveCount` (2) failed attempts, SQS moved it to the dead-letter queue. It's **kept** for a human to investigate, and it no longer blocks other orders.

### Part 2: The worker that succeeds, safely

#### Step 7: A table that records each order once

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table \
  --table-name ama-l1-processed-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S \
  --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --query 'TableDescription.TableStatus' --output text
~~~

~~~text
ACTIVE
~~~

#### Step 8: A new order, received by a worker

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs send-message --queue-url $Q \
  --message-body '{"orderId":"ORD-2002","item":"kaju katli"}' --query MessageId --output text
RH=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $Q \
  --query 'Messages[0].ReceiptHandle' --output text)
~~~

`RH` now holds the **receipt handle**: proof of *this* receive, needed to delete the message.

#### Step 9: Do the work, idempotently
The worker records "packed", but **only if this order hasn't been recorded before**:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb put-item \
  --table-name ama-l1-processed-orders \
  --item '{"orderId":{"S":"ORD-2002"},"status":{"S":"packed"}}' \
  --condition-expression 'attribute_not_exists(orderId)'
~~~

No output: the order is recorded. Now imagine the message is delivered **again** (a retry after a timeout, or SQS's rare duplicate delivery). Run the **same command** again:

~~~text
aws: [ERROR]: An error occurred (ConditionalCheckFailedException) when calling the PutItem operation: The conditional request failed
~~~

The second attempt is rejected, so the order can't be packed twice. A real worker treats this error as "already done" and moves on. That's **idempotency**.

#### Step 10: Confirm the work is done: delete the message

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs delete-message --queue-url $Q --receipt-handle "$RH"
~~~

No output means success. Wait 6 seconds and check that it never comes back:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs receive-message --queue-url $Q \
  --query 'Messages[0].Body' --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs get-queue-attributes --queue-url $Q \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible \
  --query Attributes --output table
~~~

~~~text
None
--------------------------------------------------------------------------
|                           GetQueueAttributes                           |
+------------------------------+-----------------------------------------+
|  ApproximateNumberOfMessages |  ApproximateNumberOfMessagesNotVisible  |
+------------------------------+-----------------------------------------+
|  0                           |  0                                      |
+------------------------------+-----------------------------------------+
~~~

**The order of steps matters:** do the work → record it idempotently → delete the message. If the worker crashed between any two steps, the message would come back and the retry would be safe.

### Step 11: Clean up

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs delete-queue --queue-url $Q
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs delete-queue --queue-url $DLQ
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table \
  --table-name ama-l1-processed-orders --query 'TableDescription.TableName' --output text
~~~

~~~text
ama-l1-processed-orders
~~~

> **Never delete queues you didn't create.** Your Floci has a pre-existing queue named `smoke` (in us-east-1). It isn't part of this course; leave it alone.

### Floci vs. real AWS
- **Queue URLs:** real SQS URLs look like `https://sqs.ap-south-1.amazonaws.com/123456789012/ama-l1-orders`. Floci uses `http://localhost:4566/000000000000/…`.
- **Retry and DLQ behaviour** matched real SQS semantics in this run: invisibility during the timeout, reappearance after it, and a move to the DLQ after `maxReceiveCount` receives.
- **Receive count in the DLQ:** Floci reported `ApproximateReceiveCount` 4 for the message in the DLQ. Treat that number as approximate in any system; don't build logic on its exact value after a redrive.
- **Duplicates:** real standard queues can occasionally deliver a message twice even without a crash. Floci won't show you that, which is why step 9 simulates it.
