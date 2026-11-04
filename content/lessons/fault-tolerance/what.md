## The simple version

**A fault-tolerant system keeps working, without any interruption, even while something inside it is broken.**

Compare two ways of travelling:
- A **car with a spare tyre** is *highly available*: when a tyre bursts you stop, change it, and continue. There's a short interruption.
- An **aeroplane with several engines** is *fault tolerant*: if one engine fails, the plane keeps flying. Passengers may not even notice.

And for not losing things:
- If you post a letter and the postman falls ill, the letter **waits at the post office** and is delivered by someone else the next day. It isn't lost. That's what a **queue** does for computer tasks.

## The professional version

**Fault tolerance** is a system's ability to continue operating **correctly**, with **no interruption and no data loss**, when components fail.

| | High availability | Fault tolerance |
|---|---|---|
| Goal | Minimise downtime | Zero interruption, zero data loss |
| During a failure | Short disruption or reduced capacity is acceptable | Users notice nothing |
| Typical technique | Redundant components + fast detection + failover | Redundant components **already running** + work never held in one place |
| Cost | Moderate | Higher |
| AWS example | Two AZs behind a load balancer; RDS Multi-AZ failover | SQS holding work through consumer crashes; S3 storing copies across AZs |

Fault tolerance is achieved with:
1. **Redundancy** that's active all the time (no "switching over" needed).
2. **Loose coupling**: components talk through durable intermediaries such as queues, so one failing doesn't stop the others.
3. **Retries** with safe, **idempotent** operations.
4. **Isolation of bad work**: dead-letter queues, so one broken message can't jam the system.
5. **Durable storage**: data kept in several places, so no single failure loses it.

> **Key idea:** a fault-tolerant design assumes components **will** fail mid-task, and makes sure no work is ever held only in a component that can crash.
