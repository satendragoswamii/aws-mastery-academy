## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.1: methods of deploying and operating in the AWS Cloud.**

| Question wording | Answer |
|---|---|
| "all AWS tools ultimately interact with AWS through…" | **APIs** (signed HTTPS requests) |
| "access AWS programmatically from an application" | **AWS SDKs** (calling AWS APIs) |
| "record of API calls made in an account" | **AWS CloudTrail** |
| "programmatic access credentials" | **Access key ID + secret access key** (or temporary credentials) |

### Developer – Associate (DVA-C02) and SysOps (SOA-C02)
- **Exponential backoff with jitter** for throttling errors (`ThrottlingException`, `ProvisionedThroughputExceededException`).
- **Pagination**: `NextToken`, `--max-items`, `--page-size`, `--starting-token`, and that the CLI paginates automatically.
- **SigV4**: signing requests, presigned URLs (signature in the query string), and clock skew errors.
- **HTTP status codes**: 4xx (client, mostly don't retry) vs. 5xx (server, retry).
- **Idempotency tokens** (`ClientToken`) for safe retries.

### Exam traps
- The console doesn't have private powers: anything the console does is an API call the CLI/SDK can make.
- **Throttling is a 400-series error but is retryable.**
- Access keys sign requests; they are **not** sent with them.
