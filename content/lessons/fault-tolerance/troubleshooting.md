## Troubleshooting

### Lab problems
| Symptom | Cause | Fix |
|---|---|---|
| `receive-message` prints `None` | No visible message right now: the queue is empty, or the message is still invisible | Wait for the visibility timeout; check `ApproximateNumberOfMessagesNotVisible` |
| `AWS.SimpleQueueService.NonExistentQueue … The specified queue does not exist.` | Wrong URL, wrong Region, or the queue was deleted | `aws sqs get-queue-url --queue-name ama-l1-orders` in the same Region |
| `Invalid type for parameter Attributes` / JSON errors on `create-queue` | Quotes in the nested `RedrivePolicy` JSON | Copy the command exactly; the inner quotes must be `\"` |
| Message never reaches the DLQ | Redrive policy missing, wrong DLQ ARN, or you keep deleting the message | `get-queue-attributes --attribute-names RedrivePolicy`; check the ARN |
| `ConditionalCheckFailedException` | The item already exists. In this lab that's **the point** | Treat as "already processed" and delete the SQS message |
| `$Q` is empty | Variables were set in another Terminal window | Set `Q=…` and `DLQ=…` again |

> **Floci won't catch every mistake.** On Floci 2.4.0, a redrive policy pointing at a DLQ that doesn't exist was accepted without complaint. Always check the DLQ ARN with `get-queue-attributes`.

### Real-world fault-tolerance problems
| Symptom | Likely cause | Fix |
|---|---|---|
| Orders processed twice | Visibility timeout shorter than processing time, or a retry after a crash, with a non-idempotent consumer | Raise the timeout above the worst case; make processing idempotent |
| Orders lost | Worker deleted the message **before** finishing the work | Delete only after the work (and its record) is complete |
| Queue grows and never shrinks | Workers down, too few workers, or one poison message failing forever (no DLQ) | Check worker health; scale workers on queue depth; add a DLQ |
| DLQ filling up silently | No alarm on the DLQ | CloudWatch alarm on `ApproximateNumberOfMessagesVisible` > 0 for the DLQ |
| Messages expire before processing | Retention period too short for a long outage | Increase `MessageRetentionPeriod` (up to 14 days); set the DLQ's retention longer than the source queue's |
| Retries overload a struggling service | Immediate retries without backoff | Exponential backoff with jitter; limit attempts |
| Order of events wrong (refund before payment) | Standard queue, which doesn't guarantee order | FIFO queue with a message group per customer or account |
