## Why understanding the API matters

### "Everything is an API call" explains AWS
- **IAM permissions** are written in API terms: `s3:GetObject`, `dynamodb:PutItem`. To grant access, you need to know which API calls a task makes.
- **CloudTrail** records API calls. Reading an audit log means reading API names and parameters.
- **Error messages** come straight from the API: `ResourceNotFoundException`, `AccessDenied`, `ThrottlingException`.
- **Every tool** (console, CLI, SDK, CloudFormation, Terraform) is an API client. Learn the API once and every tool makes sense.

### Automation is built on it
Anything you can click, you can automate, because the console uses the public API too. That's what makes infrastructure as code, deployment pipelines and self-healing systems possible.

### Real-world API behaviour you must handle
| Behaviour | What goes wrong if you ignore it |
|---|---|
| **Pagination** | A script "lists all users" but sees only the first page; the audit misses people |
| **Throttling** | A burst of calls fails at 2 a.m.; the batch job stops halfway |
| **Eventual consistency** | You create something and immediately describe it; it's "not found" for a moment |
| **Idempotency** | A retried "create" after a timeout makes two servers |
| **Regions** | Requests go to the wrong endpoint; resources "don't exist" |

### Debugging gets much easier
When something fails, `--debug` (CLI) or SDK logging shows the exact request, response and request ID. Support engineers will ask for the **request ID**, and now you'll know where to find it.

## Why this matters for you
CLF-C02 expects you to know that the console, CLI and SDKs all use AWS APIs, and when to use each. Developer and SysOps exams test pagination, retries with exponential backoff, throttling and SigV4 directly.
