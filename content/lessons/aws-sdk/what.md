## What is an AWS SDK?

### The simple version
The CLI is for **people typing commands**. An SDK (Software Development Kit) is for **programs**. It is a library you add to your code so that your website, app or script can say "save this file to S3" or "read this order from DynamoDB" in its own language.

~~~text
Your code                                   The SDK does the hard part
-----------------------------------------   ---------------------------------------------
s3.send(new GetObjectCommand({...}))   ->   finds credentials and Region
                                            builds the HTTPS request
                                            signs it (SigV4, as in the APIs lesson)
                                            sends it, retries if it fails briefly
                                       <-   turns the answer into a JavaScript object
                                            (or a typed error you can catch)
~~~

### The professional version
AWS publishes official SDKs for JavaScript/TypeScript, Python (**boto3**), Java, Go, .NET, PHP, Ruby, Rust, C++, Kotlin and Swift. They are generated from the **same service models** as the CLI, so every API operation exists in every SDK. Each SDK adds:

| Feature | What it gives you |
|---|---|
| **Clients** | One object per service, configured once and reused |
| **Credential and Region chains** | Finds credentials without keys in your code |
| **Signing** | SigV4 on every request |
| **Retries** | Exponential back-off for throttling, 5xx and network errors |
| **Paginators** | Loop over every page of a List call |
| **Waiters** | Wait until a resource is ready |
| **Typed errors** | `NoSuchKey`, `ConditionalCheckFailedException`… you can catch by type |
| **Helpers** | DynamoDB document client, S3 multipart uploads, presigned URLs |

### The same call in two SDKs
This lesson uses the **AWS SDK for JavaScript v3** in Node.js. For comparison, the same S3 download in Python's boto3 (shown for reading only, not run in this lab):

~~~text
JavaScript v3                                          Python (boto3)
const s3 = new S3Client({ region: "ap-south-1" });    s3 = boto3.client("s3", region_name="ap-south-1")
const r = await s3.send(new GetObjectCommand(          r = s3.get_object(Bucket="shop", Key="a.json")
  { Bucket: "shop", Key: "a.json" }));
const text = await r.Body.transformToString();         text = r["Body"].read().decode()
~~~
The operation names, parameters and errors are the same; only the language style differs.

### What you'll do
Create a small Node.js project, then write scripts that upload and page through orders in S3, handle errors by type, watch retries happen, make a safe conditional update in DynamoDB, and prove where the SDK finds its credentials and Region. Every client is pointed at Floci.
