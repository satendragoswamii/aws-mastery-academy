## AWS CLI commands in this lesson

### Amazon SQS
| Command | What it does |
|---|---|
| `aws sqs create-queue --queue-name … --attributes '{…}'` | Creates a queue (optionally with visibility timeout and redrive policy) |
| `aws sqs get-queue-url --queue-name …` | Looks up a queue's URL by name |
| `aws sqs get-queue-attributes --queue-url … --attribute-names All` | Shows settings and approximate message counts |
| `aws sqs set-queue-attributes --queue-url … --attributes '{…}'` | Changes settings on an existing queue |
| `aws sqs send-message --queue-url … --message-body '…'` | Adds a message |
| `aws sqs receive-message --queue-url …` | Receives up to 10 messages (they become invisible) |
| `aws sqs delete-message --queue-url … --receipt-handle …` | Confirms processing; removes the message |
| `aws sqs change-message-visibility … --visibility-timeout N` | Gives a worker more time on one message |
| `aws sqs purge-queue --queue-url …` | Deletes **all** messages (use only on lab queues) |
| `aws sqs delete-queue --queue-url …` | Deletes the queue |

### DynamoDB conditional write
| Command | What it does |
|---|---|
| `aws dynamodb put-item … --condition-expression 'attribute_not_exists(orderId)'` | Writes only if no item with that key exists, the basis of idempotent processing |

### Useful `receive-message` options
| Option | Effect |
|---|---|
| `--max-number-of-messages 10` | Receive up to 10 at once (default 1) |
| `--wait-time-seconds 20` | **Long polling**: wait up to 20 s for a message instead of returning empty immediately. Cheaper and faster than repeated short polls |
| `--visibility-timeout 60` | Override the queue's timeout for this receive |
| `--attribute-names ApproximateReceiveCount` | Show how many times this message has been received |

### Queue attributes you'll use most
| Attribute | Default | Meaning |
|---|---|---|
| `VisibilityTimeout` | 30 s (max 12 h) | Hidden time after a receive |
| `MessageRetentionPeriod` | 4 days (1 min – 14 days) | How long unprocessed messages are kept |
| `ReceiveMessageWaitTimeSeconds` | 0 | Default long-polling wait |
| `RedrivePolicy` | none | DLQ ARN and `maxReceiveCount` |
| `DelaySeconds` | 0 | Delay before a new message becomes visible |

### Try it yourself
Check the queue's settings after step 2:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 sqs get-queue-attributes --queue-url $Q \
  --attribute-names VisibilityTimeout RedrivePolicy MessageRetentionPeriod --output json
~~~

You should see your 5-second visibility timeout, the redrive policy, and the default retention of `345600` seconds (4 days).
