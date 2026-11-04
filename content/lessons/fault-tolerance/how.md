## How fault tolerance works

### 1. Active redundancy
Instead of a standby that must be "switched on", every copy is already working:
- **S3** writes each object to multiple devices across multiple AZs before confirming the upload.
- **DynamoDB** replicates every write across three AZs.
- **Auto Scaling groups** run extra instances, so losing one only reduces spare capacity.

### 2. Queues and the message lifecycle
Amazon SQS is the core fault-tolerance tool between components. Follow one message:

~~~text
 producer                 SQS queue                         consumer (worker)
    | send-message  --->  [ msg ] visible
    |                        |      <--- receive-message ---  picks it up
    |                     [ msg ] INVISIBLE for the visibility timeout
    |                        |                                processing...
    |                        |   case A: success
    |                        |      <--- delete-message ----  "done": message removed for good
    |                        |   case B: worker crashes, or is too slow
    |                     [ msg ] visible again after the timeout  -> another worker retries
    |                        |   case C: it keeps failing
    |                     receive count > maxReceiveCount  -> moved to the DEAD-LETTER QUEUE
~~~

Key rules:
- **Receiving doesn't remove a message.** Only `delete-message` does, and only the consumer that finished the work should call it.
- **The visibility timeout** must be longer than the longest normal processing time, or messages reappear while still being worked on (duplicate processing).
- **The redrive policy** (`maxReceiveCount` + a DLQ) caps the number of attempts.

### 3. Idempotent consumers
Make every handler safe to run twice:
- Use a **unique ID** per piece of work (the order ID).
- Before acting, check whether that ID was already handled, using a **conditional write** to a database ("insert only if not exists").
- Use **idempotency keys** with payment providers, so a repeated charge request is ignored.

### 4. Retries with backoff
When calling another service fails, retry, but:
- **Wait longer each time** (exponential backoff: 100 ms, 200 ms, 400 ms…).
- **Add randomness** (jitter), so thousands of clients don't retry at the same instant.
- **Give up after a few tries** and send the work to a DLQ or show a clear error.

The AWS SDKs and CLI already retry many failed AWS API calls this way.

### 5. Graceful degradation
When a non-essential part fails, keep the essential part working:
- Recommendations service down? Show the product page without recommendations.
- Review service slow? Load reviews later, not before the page.

### 6. Static stability
A design is **statically stable** when it keeps working during a failure **without needing to change anything**. For example, run enough capacity in each AZ that, if one AZ fails, the others can carry the load **before** Auto Scaling adds more. AWS uses this principle in its own services.

### Choosing the queue type
| | SQS Standard | SQS FIFO |
|---|---|---|
| Delivery | At least once (occasional duplicates) | Exactly-once processing within a deduplication window |
| Order | Best effort | Strict order within a message group |
| Throughput | Nearly unlimited | High, with limits per API and per group |
| Use when | Order doesn't matter, idempotent consumers | Order matters (e.g. bank transactions per account) |
