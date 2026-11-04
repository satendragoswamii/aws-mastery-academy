## Security and best practices

### Messages are data: protect them
Queues often carry personal data (names, addresses, order contents).
1. **Encrypt at rest.** SQS supports server-side encryption, with SQS-managed keys (SSE-SQS, the default for new queues) or your own AWS KMS key (SSE-KMS) when you need key-level control and audit.
2. **Encrypt in transit.** The CLI and SDKs use HTTPS; you can enforce it with a queue policy that denies requests where `aws:SecureTransport` is false.
3. **Don't put secrets in messages.** Send an order ID, not a card number. The worker looks up sensitive data from a protected store.

### Least privilege for producers and consumers
| Who | Needs | Doesn't need |
|---|---|---|
| Website (producer) | `sqs:SendMessage` on the order queue | Receive, delete, purge |
| Worker (consumer) | `sqs:ReceiveMessage`, `sqs:DeleteMessage`, `sqs:ChangeMessageVisibility` on the order queue; `dynamodb:PutItem` on its table | Send to other queues, `sqs:PurgeQueue`, `sqs:DeleteQueue` |
| Operators | Read DLQ, redrive | Day-to-day write access |

A compromised website that can only **send** can't read or delete everyone's orders.

### Fault tolerance protects against attacks too
- A traffic flood fills the **queue**, not your database. Workers process at a safe rate.
- A malicious, malformed message ends up in the **DLQ** after a few attempts, instead of crashing workers forever. Treat DLQ contents as untrusted input when you investigate them.

### Safe operations
- **`purge-queue` and `delete-queue` are destructive.** They delete every message. Restrict them with IAM, and never run them on queues you don't own (in this course, never touch the pre-existing `smoke` queue).
- **Alarm on the DLQ.** A filling DLQ is often the first sign of a bug or an attack.
- **Idempotency keys** also protect customers against double charges caused by attackers replaying requests.
