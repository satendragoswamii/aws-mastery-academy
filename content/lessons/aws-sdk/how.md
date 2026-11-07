## How the SDK works

### Client, command, send
~~~text
const s3 = new S3Client(config)            created ONCE (Region, credentials, endpoint, retries)
const cmd = new PutObjectCommand(input)    one object per API operation, input = API parameters
const out = await s3.send(cmd)             signs, sends, retries, parses
out.$metadata                              httpStatusCode, requestId, attempts, totalRetryDelay
~~~
Version 3 of the JavaScript SDK is **modular**: you install only the clients you use (`@aws-sdk/client-s3`), which keeps Lambda packages small.

### Where credentials come from (default chain, SDK for JavaScript v3)
~~~text
1. credentials passed in code          (lab only: the dummy test keys in lab-config.mjs)
2. environment variables               AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_SESSION_TOKEN
3. shared config/credentials files     the profile named by AWS_PROFILE (or default),
                                       including SSO and role_arn settings
4. web identity token                  e.g. EKS pods, GitHub Actions OIDC
5. container credentials               ECS task role
6. instance metadata (IMDS)            EC2 instance profile
~~~
**Caution:** when **both** `AWS_PROFILE` and environment keys are set, the version used in this lesson (3.1163) chose the **profile** and printed a warning that this may change. The CLI and other SDKs have their own precise rules. Never set two sources at once.

Region follows a similar chain: code, then `AWS_REGION`, then the profile's `region`. If none is found you get `Region is missing`.

### Paginators
~~~text
request 1  ->  page 1 + NextContinuationToken "abc"
request 2  (token "abc")  ->  page 2 + token "def"
request 3  (token "def")  ->  page 3, no token: done
~~~
`for await (const page of paginateListObjectsV2(...))` does this loop for you.

### Waiters
A waiter polls (for example `HeadBucket` or `DescribeTable`) with growing pauses until the resource is ready, fails, or `maxWaitTime` seconds pass. It returns `{ state: "SUCCESS" }` or throws.

### Errors and retries
| Kind | Example | Retried? |
|---|---|---|
| Client fault (4xx, `$fault: "client"`) | `NoSuchKey`, `AccessDenied`, `ValidationException`, `ConditionalCheckFailedException` | No: fix the request or handle it |
| Throttling | `ThrottlingException`, `ProvisionedThroughputExceededException`, `SlowDown` | Yes, with back-off |
| Server fault (5xx) | `InternalError`, `ServiceUnavailable` | Yes |
| Network | `ECONNREFUSED`, `ECONNRESET`, timeouts | Yes |

Default: **standard** retry mode, **3** attempts in total, exponential back-off with jitter. Change it with `maxAttempts` and `retryMode` (`standard` or `adaptive`) on the client.

### The DynamoDB document client
The low-level client needs typed values (`{ "qty": { "N": "2" } }`). `DynamoDBDocumentClient` from `@aws-sdk/lib-dynamodb` converts plain JavaScript objects (`{ qty: 2 }`) in both directions.
