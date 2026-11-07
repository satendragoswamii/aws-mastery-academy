## Where SDK code runs, and how it gets credentials

~~~text
                    the SAME application code: new S3Client({ region })   (no keys)
                                         |
        +----------------+---------------+----------------+------------------+
        |                |               |                |                  |
   Developer laptop   EC2 instance    ECS task        Lambda function    GitHub Actions
   aws sso login ->   instance        task role ->    execution role ->  OIDC token ->
   profile in         profile ->      container       environment        web identity
   ~/.aws/config      IMDS            endpoint        variables          role
        |                |               |                |                  |
        +----------------+---------------+----------------+------------------+
                                         |
                    temporary credentials found by the default chain
                                         |
                                         v
                       signed HTTPS requests to S3, DynamoDB, SQS...
~~~

### A typical serverless order service
~~~text
API Gateway -> Lambda (Node.js, SDK v3)
                 - clients created OUTSIDE the handler, reused across invocations
                 - DynamoDB document client: PutCommand with ConditionExpression
                 - S3: PutObjectCommand for the receipt PDF
                 - errors: ConditionalCheckFailedException -> "already paid" (HTTP 409)
                           anything unexpected -> re-throw (Lambda logs it, alarms fire)
~~~

### Design rules engineers follow
| Rule | Why |
|---|---|
| Create clients once, reuse them | Reuses connections; much faster in Lambda |
| Never put keys in code or config files in Git | The chain finds role credentials |
| Always paginate List/Describe calls | One page is rarely everything |
| Use waiters after create/delete | Resources aren't ready instantly |
| Catch specific error types, re-throw the rest | Hidden errors become data loss |
| Make writes idempotent or conditional | Retries and duplicate requests happen |
| Pass Region explicitly or via `AWS_REGION` | Avoid "Region is missing" and wrong-Region writes |

### Endpoint override (how this lab works)
The `endpoint` option sends a client's requests to a different URL. The academy uses it to reach Floci at `http://localhost:4566`; real projects use it for VPC endpoints, FIPS endpoints or local emulators in tests. `forcePathStyle: true` makes the S3 client use `http://host/bucket/key` addresses, which local emulators need.
