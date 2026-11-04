## Why fault tolerance matters

### Some failures can't be "recovered" afterwards
High availability gets the service back quickly. But for some work, *quickly back* isn't good enough:
- An **order** received during a 30-second outage is gone if nothing stored it.
- A **payment** half-processed when a server crashed might be charged and never recorded, or recorded twice.
- A **sensor reading** from a factory machine can't be re-measured later.

For work like this, the system must be designed so that **a crash never loses or duplicates anything**.

### Tightly coupled systems fail together
~~~text
Website ---calls directly---> Order service ---calls directly---> Warehouse system
   if the warehouse system is slow or down, the order service waits, then the website hangs,
   and the customer sees an error, although only the last component was broken.
~~~
One slow component spreads failure **upstream**. This is called a **cascading failure**.

### Loosely coupled systems absorb failure
~~~text
Website ---> [ queue ] ---> Order workers ---> [ queue ] ---> Warehouse system
   the website only needs the queue to accept the order.
   if the warehouse is down for an hour, orders wait in the queue and are processed later.
~~~
The customer gets "Order received!" immediately. The rest happens when it can.

### Retries are dangerous without idempotency
When something fails, the natural fix is to **try again**. But:
- A network timeout doesn't tell you whether the first attempt **succeeded**.
- SQS standard queues deliver **at least once**, occasionally twice.

So the receiver must make repeats harmless (**idempotency**): "ship order ORD-2001" must ship it once, however many times the message arrives.

### Poison messages
Some messages will **always** fail, for example a malformed order. Retrying them forever wastes capacity and fills logs. A **dead-letter queue** moves them aside after a few attempts, so the rest of the work flows and the bad message is kept for investigation.

### Why the cloud helps
Building durable queues and multi-copy storage yourself is hard. AWS provides them as managed, multi-AZ services:
- **Amazon SQS**: durable queues, visibility timeouts, dead-letter queues.
- **Amazon SNS and EventBridge**: publish events to many receivers.
- **Amazon S3**: objects stored redundantly across multiple AZs, designed for 11 nines of durability.
- **DynamoDB**: data replicated across three AZs in a Region.

## Why this matters for you
"Decouple the components using Amazon SQS" is one of the most common correct answers on AWS exams, and idempotency is a classic interview topic.
