## In the real world

### The leaked key in a public repository
A student pushed a project with an access key hard-coded in a config file. Within an hour, bots had found it and launched expensive instances for cryptocurrency mining. Teams now forbid keys in code entirely: applications get credentials from roles through the default chain, and secret-scanning tools block commits containing keys.

### "The report says we have 1,000 customers"
A nightly job listed S3 objects without pagination. It worked for months, until the bucket passed 1,000 objects and the report silently stopped growing. The fix was one line: use the paginator. Code reviews in many teams now flag any `List`/`Describe` call without one.

### Paying twice
A checkout service retried a timed-out request; the first request had actually succeeded, so the customer was charged twice. The team added a DynamoDB conditional write (`status = NEW`) plus an idempotency key per checkout, so duplicates are refused with `ConditionalCheckFailedException`.

### Fast Lambda functions
Moving `new DynamoDBClient()` from inside the handler to the top of the file cut average response times noticeably, because later invocations reuse the client and its open connections instead of creating them every time.

### Local tests with an endpoint override
Many teams run integration tests against local emulators, exactly as this academy does with Floci, by setting the client `endpoint` in test configuration only. The production code is unchanged; only the configuration differs.
