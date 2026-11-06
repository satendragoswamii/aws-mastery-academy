## Troubleshooting

### Lab errors (seen on Floci 2.4.0)
| Error / symptom | Cause | Fix |
|---|---|---|
| `ResourceNotFoundException … Table: … not found` from curl | The `--aws-sigv4` Region doesn't match where the table is | Sign for `ap-south-1` (step 3) |
| `NoSuchBucket` + `HTTP 404` | The bucket doesn't exist (expected in step 5) | Check the bucket name and Region |
| `{"TableNames":[]}` from an unsigned request | Floci used its default Region | Sign the request with the right Region |
| `--debug` output scrolls for pages | It's very detailed | Pipe through `grep` as in steps 1–2, or `> debug.txt 2>&1` and search |
| `Invalid type for parameter ExclusiveStartKey, value: None` when resuming a DynamoDB `scan` with `--starting-token`, or an S3 resume that starts again from the first key | Floci returned everything in one response, and the CLI's client-side `--max-items` token can't resume it on Floci | Use the service's own paging (`--max-keys` + `--continuation-token` for S3, as in step 6) |

### Real AWS API errors
| Error | Meaning | Fix |
|---|---|---|
| `MissingAuthenticationTokenException` / `MissingAuthenticationToken` | Request not signed (or wrong URL/path) | Use the CLI/SDK, or sign with SigV4 |
| `SignatureDoesNotMatch` | Wrong secret key, modified request, or wrong Region/service in the signature | Check credentials and `--region`; don't edit signed requests |
| `RequestTimeTooSkewed` / `InvalidSignatureException … expired` | Your clock is wrong | Turn on automatic time sync |
| `UnrecognizedClientException` / `InvalidClientTokenId` | Access key doesn't exist (deleted, or a different partition/account) | Check `aws configure list`, rotate keys |
| `AccessDenied` / `AccessDeniedException` | Signature fine, but IAM (or an SCP, resource policy…) denies the action | Grant the specific action; read the message for the action name |
| `ThrottlingException` / `SlowDown` / `TooManyRequestsException` | Too many requests | Retry with backoff; reduce concurrency; request a quota increase |
