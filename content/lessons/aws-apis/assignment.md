## Independent assignment: an API detective for a library app

A library app stores books in a DynamoDB table and cover images in S3. A teammate says, "The CLI is magic". Prove it isn't.

### Part A: Explain (no AWS needed)
1. For each of these, name the API style (JSON, query, REST) and how the operation is identified: DynamoDB `PutItem`, S3 `GetObject`, SQS `SendMessage` (classic), EC2 `DescribeInstances`.
2. List the four parts of a SigV4 credential scope and explain why each is included.
3. A colleague's script lists 1,000 books but the table has 3,500. Explain the probable bug and the fix.
4. Which errors should a client retry, and which should it not? Give two examples of each.

### Part B: Investigate on Floci
Always use `--endpoint-url http://localhost:4566`. Name resources starting `ama-l1-lib`.
1. Create a table `ama-l1-lib-books` (key `isbn`) in ap-south-1. With `--debug`, find and paste the `X-Amz-Target` and the credential scope for `put-item`.
2. Add an item **with curl only** (`DynamoDB_20120810.PutItem`, signed with `--aws-sigv4`). Read it back with the CLI `get-item`.
3. Create a bucket `ama-l1-lib-covers`, upload 7 small files, and page through them **3 at a time** with `--max-keys 3 --no-paginate` and continuation tokens. Paste all three pages.
4. Produce a 404 error from S3 with curl (`NoSuchKey` this time) and paste the code, status and request ID.
5. Clean up and prove nothing `ama-l1-lib` remains.

### Part C: Explain (100–150 words)
Explain to the teammate exactly what the CLI did when they ran one `put-item` command, from typing it to seeing the result.

### Self-assessment
- [ ] Part A1 classifies S3 as REST, DynamoDB as JSON, and SQS (classic) and EC2 as query.
- [ ] The curl `PutItem` worked and the CLI read the item back.
- [ ] Three pages: 3 + 3 + 1 keys, with `IsTruncated` true, true, false.
- [ ] The 404 shows `NoSuchKey` and a request ID.
- [ ] Part C mentions building, signing, sending, authorisation, response parsing and retries.
