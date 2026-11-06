## What are AWS APIs?

### The simple version
Imagine ordering at a restaurant through a hatch. You can't walk into the kitchen; you pass a **written order slip** through the hatch, and a **plate** (or a note saying "sorry, sold out") comes back.

AWS works the same way. Every service (S3, EC2, DynamoDB…) has a hatch, its **API**, and every action is an order slip: an **HTTPS request**. The console, the command line, your programs: they're all just different ways of writing order slips. And every slip carries a **signature**, so the kitchen knows it really came from you.

### The professional version
Each AWS service exposes a public API over HTTPS:
| Part | Example |
|---|---|
| **Endpoint** | `https://dynamodb.ap-south-1.amazonaws.com` |
| **Operation** | `DescribeTable`, `PutItem`, `CreateBucket`, `RunInstances` |
| **Input parameters** | `{"TableName": "orders"}` |
| **Output** | JSON or XML describing the result |
| **Errors** | An error code + message + HTTP status + request ID |
| **Authentication** | Signature Version 4 in the `Authorization` header |

### Three request styles (protocols)
AWS services were built over many years, so they speak a few dialects:

| Style | Used by | What it looks like |
|---|---|---|
| **JSON** | DynamoDB, Lambda (mostly), KMS, Secrets Manager, CloudWatch Logs | `POST /` with header `X-Amz-Target: DynamoDB_20120810.DescribeTable` and a JSON body |
| **Query** | SQS (classic), EC2, IAM, SNS, STS | `POST /` with a form body `Action=ListQueues&Version=2012-11-05`; XML response |
| **REST** | S3, API Gateway, Route 53, Lambda's newer APIs | The resource is in the URL path (`GET /bucket/key`), HTTP verbs and status codes carry meaning |

You almost never write these by hand: the CLI and SDKs are generated from AWS's **service models** and handle the style, signing, retries and pagination for you. But knowing what's underneath explains error messages, permissions and odd behaviours.

### What you'll do
On Floci you'll take the CLI apart with `--debug` to see the real HTTP request, sign requests yourself with `curl`, see all three API styles, read an error response, page through results, and discover that the **Region is part of the signature**.
