## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.1:** know the ways to access AWS: the console, the CLI, SDKs and infrastructure as code.

| Question wording | Answer |
|---|---|
| "developers want to call AWS services from their application code in Java/Python" | **AWS SDKs** |
| "language-specific APIs for AWS services" | **AWS SDKs** |
| "how should an application on EC2 get credentials?" | **An IAM role (instance profile)**, not access keys |

### Developer – Associate (DVA-C02)
- The **default credential provider chain** and why roles beat embedded keys.
- **Pagination** (continuation tokens, paginators) and **waiters**.
- **Exponential back-off with jitter** for `ThrottlingException` / `ProvisionedThroughputExceededException`; SDKs retry automatically.
- Error categories: **4xx client errors are not retried** (fix the request), **5xx and throttling are**.
- DynamoDB **conditional writes** (`ConditionExpression`, `ConditionalCheckFailedException`) and the **document client**.
- Reuse SDK clients outside the Lambda handler.
- Endpoint overrides, Region configuration, `$metadata.requestId` for support cases.

### Exam traps
- "Increase retries" alone doesn't fix sustained throttling; back-off, spreading load, or more capacity does.
- Putting access keys in environment variables of a Lambda function is wrong; use the **execution role**.
- `ConditionalCheckFailedException` is an expected business outcome, not a server problem; it is not retried.
- A `List` call returning exactly 1,000 S3 keys usually means "there are more pages".
