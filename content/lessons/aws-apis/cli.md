## Commands and options in this lesson

| Command / option | What it does |
|---|---|
| `aws … --debug` | Prints the full request, signing steps, response and retry decisions (to stderr) |
| `curl --aws-sigv4 "aws:amz:REGION:SERVICE" --user "KEY:SECRET"` | Signs a raw HTTP request with SigV4 (curl 7.75+) |
| `-H 'X-Amz-Target: …'` | Names the operation for JSON-protocol services |
| `-d 'Action=…&Version=…'` | Query-protocol request body |
| `curl -w '\nHTTP %{http_code}\n'` | Prints the HTTP status code |
| `aws s3api list-objects-v2 --max-keys N --no-paginate` | One page only, with N results |
| `--continuation-token TOKEN` | Fetches the next S3 page |
| `--page-size N` | Results per request (CLI still fetches every page) |
| `--max-items N` | Total results to show; prints a `NextToken` to resume |
| `--starting-token TOKEN` | Resumes after `--max-items` |
| `aws dynamodb delete-table` / `aws s3 rb --force` | Clean-up |

### Retry settings for the CLI and SDKs
| Setting | Meaning |
|---|---|
| `AWS_MAX_ATTEMPTS=5` | Total attempts, including the first |
| `AWS_RETRY_MODE=standard` | Exponential backoff with jitter (default in CLI v2) |
| `AWS_RETRY_MODE=adaptive` | Standard plus client-side rate limiting |

### Try it yourself
1. Use `curl --aws-sigv4` to call DynamoDB `ListTables` signed for **ap-south-1**. Then create a table and call it again. Delete the table.
2. Run `aws --endpoint-url http://localhost:4566 --region us-east-1 sqs list-queues --debug 2>&1 | grep -i 'x-amz-target\|Action='`. Which protocol does the CLI v2 use for SQS?
3. With seven objects in a bucket, page through them with `--max-keys 3 --no-paginate` and `--continuation-token`, repeating until `IsTruncated` is `false`. How many requests did it take?

> **Floci note:** resuming with `--max-items` / `--starting-token` doesn't work correctly on Floci 2.4.0 (it starts again from the first key). Use `--continuation-token` as in step 6.
