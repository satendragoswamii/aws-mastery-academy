## Why SDKs matter

### Applications, not just administration
The console and CLI manage AWS. **Applications use AWS** through SDKs: a shop's checkout writes an order to DynamoDB, a photo app uploads to S3, a Lambda function reads a message from SQS. Every one of those lines is an SDK call.

### The SDK handles the hard, boring parts
Writing raw HTTPS requests, as you did with curl in the APIs lesson, means signing, retrying, paging and parsing yourself. The SDK gives you all of that, tested by AWS:

~~~text
Without an SDK                          With an SDK
--------------------------------------  ------------------------------------
compute SigV4 signature by hand         automatic
retry on 503 / throttling               automatic (maxAttempts)
follow NextContinuationToken            for await (... of paginate...(...))
poll until the table is ACTIVE          await waitUntilTableExists(...)
parse XML or JSON errors                catch (err) { if (err instanceof NoSuchKey) ... }
~~~

### No keys in your code
Because of the **credential provider chain**, the same code runs on a laptop (profile or SSO), in Lambda (execution role) and on EC2 (instance profile) without containing a single access key. That is the main reason leaked keys in source code are avoidable.

### Correctness under real conditions
Real systems see throttling, brief network errors, eventual consistency and two requests arriving at once. SDK retries, waiters and DynamoDB **conditional writes** are the standard tools for those problems.

## Why this matters for you
CLF-C02 asks which tool lets developers call AWS from code (the SDKs). The Developer Associate exam (DVA-C02) goes deep: credential chain order, pagination, exponential back-off, handling `ThrottlingException` and `ConditionalCheckFailedException`, and the DynamoDB document client. Every later lesson about Lambda, DynamoDB and serverless apps builds on this one.
