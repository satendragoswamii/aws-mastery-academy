## SDK and CLI reference for this lesson

### Project setup
| Command | What it does |
|---|---|
| `node --version` | Checks Node.js (18 or newer for SDK v3) |
| `npm init -y` | Creates `package.json` |
| `npm install @aws-sdk/client-s3@3` | Adds one service client (repeat per service) |
| `npm install @aws-sdk/lib-dynamodb@3` | Adds the DynamoDB document client |
| `npm ls --depth=0` | Shows installed versions |

### SDK v3 building blocks (JavaScript)
| Code | Purpose |
|---|---|
| `new S3Client({ region, endpoint, credentials, maxAttempts, retryMode })` | Create a client once |
| `await client.send(new XxxCommand(input))` | Call one API operation |
| `out.$metadata.httpStatusCode / requestId / attempts` | Response metadata |
| `for await (const p of paginateListObjectsV2({ client, pageSize }, input))` | Every page |
| `await waitUntilTableExists({ client, maxWaitTime }, input)` | Wait for a resource |
| `err instanceof NoSuchKey`, `err.name`, `err.$fault` | Handle errors by type |
| `DynamoDBDocumentClient.from(ddbClient)` | Plain objects for DynamoDB |
| `await client.config.credentials()` / `config.region()` | What the chain resolved |

### Environment variables the SDK reads
| Variable | Purpose |
|---|---|
| `AWS_REGION` | Region (beats the profile) |
| `AWS_PROFILE` | Profile in the shared files |
| `AWS_CONFIG_FILE`, `AWS_SHARED_CREDENTIALS_FILE` | Use other files (the lab's trick) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` | Credentials (avoid for real keys) |
| `AWS_MAX_ATTEMPTS`, `AWS_RETRY_MODE` | Retry settings without code changes |

### Checking SDK results with the CLI
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 ls s3://ama-l2-sdk-orders/orders/
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb scan --table-name ama-l2-sdk-orders --query 'Items[].status.S' --output text
~~~

### Try it yourself
(Recreate the project and `lab-config.mjs` from step 1 first.)
1. Write `count.mjs` that uploads 7 objects and counts them with a paginator using `pageSize: 3`. How many pages do you expect? Run it to check.
2. In `errors.mjs`, change `maxAttempts` to 5 and print `err.$metadata.totalRetryDelay` as well. What changes?
3. Add a `DeleteCommand` to `dynamo.mjs` with `ConditionExpression: "#s = :paid"`, so only paid orders can be deleted. Try it on an order whose status is `NEW`.
