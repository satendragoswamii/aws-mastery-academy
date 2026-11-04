## A fault-tolerant order pipeline

~~~text
  Customers
      |
  ALB + web tier (multi-AZ, Auto Scaling)          <- highly available
      |  send-message ("order received" shown immediately)
      v
  +-----------------------------+      after 3 failed attempts      +----------------------+
  | SQS queue: orders           | --------------------------------> | SQS DLQ: orders-dlq  |
  | visibility timeout 60 s     |                                    | CloudWatch alarm     |
  +-----------------------------+                                    | when it isn't empty  |
      |  receive-message                                              +----------------------+
      v
  Order workers (Auto Scaling, scale on queue length)
      |  idempotent: conditional write on orderId
      v
  DynamoDB: orders (3 AZs)   +   S3: invoices (multi-AZ, 11 nines durability)
~~~

### What happens when things fail
| Failure | Effect |
|---|---|
| A worker crashes mid-order | The message reappears after 60 s; another worker processes it; the conditional write prevents a duplicate |
| All workers are down for an hour | Orders queue up (SQS keeps messages for 4 days by default, up to 14); workers catch up when they return |
| A malformed order crashes every worker | After 3 attempts it moves to the DLQ; the alarm notifies the team; other orders keep flowing |
| A traffic spike | The queue absorbs it; workers scale out on queue depth |
| One AZ fails | Web tier and workers continue in other AZs; SQS, DynamoDB and S3 are multi-AZ already |

### The two halves
- The **web tier** is **highly available**: failures are routed around quickly.
- The **order pipeline** is **fault tolerant**: no order is ever lost or processed twice, even while components crash.

### Anti-patterns to spot
- A worker that **deletes the message first**, then processes it. A crash after the delete loses the order.
- **No DLQ**: a poison message is retried forever.
- **Visibility timeout shorter than processing time**: every slow order is processed twice.
- **Non-idempotent handlers**: duplicates cause double charges.
- **Synchronous chains** of services calling each other: one slow service takes down the chain.
