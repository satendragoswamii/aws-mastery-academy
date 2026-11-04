## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
- **Domain 1, task 1.2:** Well-Architected Reliability pillar; design principles **"automatically recover from failure"** and building **loosely coupled** architectures.
- **Domain 3, task 3.7 (application integration):** recognise **Amazon SQS** (queues, decoupling), **Amazon SNS** (publish/subscribe notifications) and **Amazon EventBridge** (event bus).
- **Domain 3:** durability of **Amazon S3** (designed for 11 nines).

### What the exam expects
| Question wording | Answer |
|---|---|
| "decouple application components", "loosely coupled" | **Amazon SQS** |
| "buffer requests during traffic spikes" | SQS between the tiers |
| "messages that can't be processed after several attempts" | **Dead-letter queue** |
| "send one message to many subscribers (email, SMS, other queues)" | **Amazon SNS** |
| "react to events from many AWS services and SaaS apps" | **Amazon EventBridge** |
| "keep operating without interruption if a component fails" | Fault tolerance |
| "designed for 99.999999999% durability" | Amazon S3 |

### Exam traps
- **HA vs. fault tolerance:** "minimal downtime" → HA; "no interruption", "no data loss" → fault tolerance.
- **SQS vs. SNS:** SQS is a queue that consumers **pull** from (one consumer per message); SNS **pushes** a copy to every subscriber. They're often combined ("fan-out": SNS topic → several SQS queues).
- **Durability ≠ availability.** S3 is designed for 11 nines of *durability* (not losing data) and 99.99% *availability* for S3 Standard (being reachable).
- **Receiving doesn't delete** an SQS message.

### Developer – Associate and Solutions Architect – Associate
Expect visibility timeout tuning, long polling, DLQs and redrive, FIFO versus standard, SQS as a Lambda event source with partial batch failures, SNS fan-out, and idempotent consumer design.
