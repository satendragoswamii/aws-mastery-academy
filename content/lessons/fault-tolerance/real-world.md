## In the real world

### E-commerce flash sales
During a flash sale, an online store takes orders far faster than its warehouse system can process them. Orders go into an SQS queue; the customer sees "Order confirmed" in under a second. Workers drain the queue over the next hour. If the warehouse system goes down briefly, nothing is lost: the queue simply grows, then shrinks.

### Food delivery: "your order was placed twice"
A delivery app had a bug: when the payment service timed out, the app retried, and some customers were charged twice. The fix was an **idempotency key** per checkout, sent with every payment attempt, so the payment provider ignored duplicates. This pattern is now standard in payment APIs.

### Media processing
A video platform puts each uploaded video in a queue for transcoding. Some corrupted files crash the transcoder every time. With a **dead-letter queue** (maxReceiveCount 3), these files are moved aside, an alarm alerts the team, and the thousands of good videos keep flowing.

### Banking ledgers
Banks need strict ordering per account (a deposit must be applied before the withdrawal that depends on it). They use **FIFO queues** or event streams with one ordered group per account, plus idempotent writes keyed on transaction IDs.

### Fault tolerance has a cost
Every extra copy, queue and retry costs money and adds complexity. Teams decide per component:
- **Losing an order or payment**: unacceptable. Fault tolerant.
- **Losing a "recently viewed" list**: acceptable. Highly available is enough.

### On the job
You'll design queue-based workflows, set visibility timeouts and redrive policies, make consumers idempotent, monitor DLQ depth with alarms, and replay DLQ messages after fixing bugs (SQS supports **DLQ redrive** back to the source queue).
