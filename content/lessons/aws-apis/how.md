## How an AWS API call works

### The life of one request
~~~text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb describe-table --table-name ama-l1-api-orders
  |   (shown below as it would go to real AWS; in the lab the URL is http://localhost:4566/)
  1. Build:    POST https://dynamodb.ap-south-1.amazonaws.com/
               X-Amz-Target: DynamoDB_20120810.DescribeTable
               Content-Type: application/x-amz-json-1.0
               {"TableName": "ama-l1-api-orders"}
  2. Sign:     SigV4 with your secret key -> Authorization header
  3. Send:     over HTTPS (TLS)
  4. AWS:      check signature -> IAM authorisation -> perform operation -> log to CloudTrail
  5. Answer:   200 + JSON body   (or an error code, HTTP status and request ID)
  6. Client:   retry if retryable, follow pagination, print the result
~~~

### Signature Version 4, step by step
~~~text
1. Canonical request   = method + path + query + sorted headers + SHA-256(body)
2. String to sign      = "AWS4-HMAC-SHA256"
                         + timestamp            20261106T155308Z
                         + credential scope     20261106/ap-south-1/dynamodb/aws4_request
                         + SHA-256(canonical request)
3. Signing key         = HMAC chain: secret -> date -> Region -> service -> "aws4_request"
4. Signature           = HMAC-SHA256(signing key, string to sign)
5. Header              Authorization: AWS4-HMAC-SHA256 Credential=AKIA…/20261106/ap-south-1/dynamodb/aws4_request,
                       SignedHeaders=…, Signature=…
~~~
Consequences:
- The **secret key is never sent**.
- The signature is tied to a **date, Region and service**. Sign for the wrong Region and the request goes nowhere useful.
- If your computer's **clock** is far off, requests fail (`SignatureDoesNotMatch` / `RequestTimeTooSkewed`).

### Errors
| HTTP status | Meaning | Examples | Retry? |
|---|---|---|---|
| 400 | Bad request / client error | `ValidationException`, `ResourceNotFoundException` (DynamoDB), `ThrottlingException` | Only throttling |
| 403 | Forbidden | `AccessDenied`, `UnrecognizedClientException`, `SignatureDoesNotMatch` | No: fix credentials or permissions |
| 404 | Not found (REST APIs) | `NoSuchBucket`, `NoSuchKey` | No |
| 409 | Conflict | `BucketAlreadyOwnedByYou`, `OperationAborted` | Maybe later |
| 500 / 503 | Server error / slow down | `InternalError`, `ServiceUnavailable`, `SlowDown` | Yes, with backoff |

### Retries with exponential backoff and jitter
~~~text
attempt 1 fails (throttled) -> wait ~0.1 s
attempt 2 fails             -> wait ~0.2 s (random within range)
attempt 3 fails             -> wait ~0.4 s
...                            up to a maximum number of attempts
~~~
The random **jitter** stops thousands of clients retrying at the same instant.

### Pagination patterns
| Service style | Request | Response |
|---|---|---|
| Most JSON APIs | `NextToken` / `ExclusiveStartKey` | `NextToken` / `LastEvaluatedKey` |
| S3 `ListObjectsV2` | `ContinuationToken`, `MaxKeys` | `IsTruncated`, `NextContinuationToken` |
| Older query APIs | `Marker`, `MaxItems` | `IsTruncated`, `Marker` |

The CLI follows tokens automatically. `--max-items` limits the total shown, `--page-size` sets results per request, and `--no-paginate` returns only the first page.
