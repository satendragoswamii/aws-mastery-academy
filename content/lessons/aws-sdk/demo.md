## Talking to S3 and DynamoDB from Node.js

**Lab tier: 🟢 Fully supported in Floci.** These exact scripts were run with Node.js 24.19.0 and AWS SDK for JavaScript v3 (3.1164.0) against Floci 2.4.0 on 2026-11-07.

> **Every client in this lab is pointed at Floci.** `lab-config.mjs` sets `endpoint: "http://localhost:4566"` and the dummy `test` keys, so nothing can reach real AWS. Step 6 deliberately runs with **no** credentials and with lab-only profile files inside the lab folder, so your real `~/.aws` settings are never read or printed. Work in **one Terminal window**.

You need Node.js 18 or newer (`node --version`). Each script is created with a `cat > file <<'EOF' … EOF` block: paste the whole block. You can also create the files in any editor.

### Step 1: Create the project and the shared settings
~~~bash
mkdir -p ~/ama-sdk && cd ~/ama-sdk
npm init -y > /dev/null
npm install --no-fund --no-audit @aws-sdk/client-s3@3 @aws-sdk/client-dynamodb@3 @aws-sdk/lib-dynamodb@3
npm ls --depth=0
cat > lab-config.mjs <<'EOF'
// Shared settings for every lab script. LAB ONLY: these dummy keys work only with Floci.
export const labConfig = {
  region: "ap-south-1",
  endpoint: "http://localhost:4566",              // send every request to Floci, never to real AWS
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
};
export const BUCKET = "ama-l2-sdk-orders";
export const TABLE = "ama-l2-sdk-orders";
EOF
~~~

~~~text
added 34 packages in 9s
ama-sdk@1.0.0 /Users/you/ama-sdk
+-- @aws-sdk/client-dynamodb@3.1164.0
+-- @aws-sdk/client-s3@3.1164.0
`-- @aws-sdk/lib-dynamodb@3.1164.0
~~~

Only three packages are installed: SDK v3 is **modular**, so you add one client per service you use. Your version numbers will be newer, and the package count and time will differ. `lab-config.mjs` holds the settings every script shares. Hard-coded keys are **only** acceptable here because they are Floci's dummy keys.

### Step 2: Create a bucket, wait for it, upload and download
~~~bash
cat > s3-basics.mjs <<'EOF'
import { S3Client, CreateBucketCommand, PutObjectCommand, GetObjectCommand, waitUntilBucketExists } from "@aws-sdk/client-s3";
import { labConfig, BUCKET } from "./lab-config.mjs";

const s3 = new S3Client({ ...labConfig, forcePathStyle: true });   // 1. one client, reused for every call

const created = await s3.send(new CreateBucketCommand({                // 2. a command object per API operation
  Bucket: BUCKET,
  CreateBucketConfiguration: { LocationConstraint: "ap-south-1" },
}));
console.log("CreateBucket HTTP status:", created.$metadata.httpStatusCode);

const waited = await waitUntilBucketExists({ client: s3, maxWaitTime: 30 }, { Bucket: BUCKET });
console.log("Waiter result:", waited.state);

for (let i = 1; i <= 5; i++) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: `orders/order-${i}.json`,
    Body: JSON.stringify({ orderId: `o-${i}`, item: "masala chai", qty: i }),
    ContentType: "application/json",
  }));
}
console.log("Uploaded 5 orders");

const got = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: "orders/order-3.json" }));
console.log("Order 3:", got.ContentType, got.ContentLength, "bytes");
console.log(await got.Body.transformToString());                       // 3. the body is a stream
EOF
node s3-basics.mjs
~~~

~~~text
CreateBucket HTTP status: 200
Waiter result: SUCCESS
Uploaded 5 orders
Order 3: application/json 46 bytes
{"orderId":"o-3","item":"masala chai","qty":3}
~~~

Notice the pattern: **one client**, a **command object** per operation, `await s3.send(...)`. Every response has `$metadata` (here the HTTP status 200). The waiter checked that the bucket really exists before the uploads. The object body arrives as a **stream**; `transformToString()` reads it.

### Step 3: One page vs. every page
~~~bash
cat > paginate.mjs <<'EOF'
import { S3Client, ListObjectsV2Command, paginateListObjectsV2 } from "@aws-sdk/client-s3";
import { labConfig, BUCKET } from "./lab-config.mjs";

const s3 = new S3Client({ ...labConfig, forcePathStyle: true });

// One call returns ONE page. With MaxKeys 2 you only see the first two orders.
const first = await s3.send(new ListObjectsV2Command({ Bucket: BUCKET, MaxKeys: 2 }));
console.log("Single call:", first.KeyCount, "keys, IsTruncated =", first.IsTruncated);

// The paginator follows NextContinuationToken for you.
let page = 0, total = 0;
for await (const p of paginateListObjectsV2({ client: s3, pageSize: 2 }, { Bucket: BUCKET })) {
  page++; total += p.KeyCount;
  console.log(`Page ${page}:`, p.Contents.map((o) => o.Key).join(", "));
}
console.log("Total objects:", total);
EOF
node paginate.mjs
~~~

~~~text
Single call: 2 keys, IsTruncated = true
Page 1: orders/order-1.json, orders/order-2.json
Page 2: orders/order-3.json, orders/order-4.json
Page 3: orders/order-5.json
Total objects: 5
~~~

The single call returned only the first page (`IsTruncated = true` means "there is more"). The paginator made three requests for you. Real S3 returns at most 1,000 keys per page, so code without pagination works in testing and silently misses data in production.

### Step 4: Errors you expect, errors you don't, and retries
~~~bash
cat > errors.mjs <<'EOF'
import { S3Client, GetObjectCommand, ListObjectsV2Command, NoSuchKey, S3ServiceException } from "@aws-sdk/client-s3";
import { labConfig, BUCKET } from "./lab-config.mjs";

// 1. A service error: the request reached S3 and S3 said no.
const s3 = new S3Client({ ...labConfig, forcePathStyle: true });
try {
  await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: "orders/order-99.json" }));
} catch (err) {
  if (err instanceof NoSuchKey) {
    console.log("Not found, so handle it:", err.name);
    console.log("  instanceof S3ServiceException:", err instanceof S3ServiceException);
    console.log("  fault:", err.$fault, "| HTTP:", err.$metadata.httpStatusCode, "| attempts:", err.$metadata.attempts);
    console.log("  requestId:", err.$metadata.requestId);
  } else {
    throw err;                                                          // never swallow errors you didn't expect
  }
}

// 2. A network error: nothing is listening on port 4599, so the SDK retries, then gives up.
const broken = new S3Client({ ...labConfig, endpoint: "http://localhost:4599", forcePathStyle: true, maxAttempts: 3 });
try {
  await broken.send(new ListObjectsV2Command({ Bucket: BUCKET }));
} catch (err) {
  console.log("Network error:", err.code, "| attempts:", err.$metadata?.attempts);
}
EOF
node errors.mjs
~~~

~~~text
Not found, so handle it: NoSuchKey
  instanceof S3ServiceException: true
  fault: client | HTTP: 404 | attempts: 1
  requestId: e4cc3ade-47ab-42bc-935e-c9b92b6e89b8
Network error: ECONNREFUSED | attempts: 3
~~~

Your request ID will differ. Two very different failures:
- **`NoSuchKey`** is a client fault (HTTP 404). The SDK made **1** attempt, because retrying won't make the file appear. The code handled it **by type** and would re-throw anything else.
- **`ECONNREFUSED`** is a network error. The SDK retried automatically, **3** attempts in total (`maxAttempts`), with short back-off pauses, then gave up.

### Step 5: DynamoDB with plain objects and a safe conditional update
~~~bash
cat > dynamo.mjs <<'EOF'
import { DynamoDBClient, CreateTableCommand, waitUntilTableExists, ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { labConfig, TABLE } from "./lab-config.mjs";

const ddb = new DynamoDBClient(labConfig);
const doc = DynamoDBDocumentClient.from(ddb);                           // plain JavaScript objects in and out

await ddb.send(new CreateTableCommand({
  TableName: TABLE,
  AttributeDefinitions: [{ AttributeName: "orderId", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "orderId", KeyType: "HASH" }],
  BillingMode: "PAY_PER_REQUEST",
}));
console.log("Table:", (await waitUntilTableExists({ client: ddb, maxWaitTime: 30 }, { TableName: TABLE })).state);

await doc.send(new PutCommand({ TableName: TABLE, Item: { orderId: "o-1", item: "masala chai", qty: 2, status: "NEW" } }));
const { Item } = await doc.send(new GetCommand({ TableName: TABLE, Key: { orderId: "o-1" } }));
console.log("Item:", JSON.stringify(Item));

const pay = {
  TableName: TABLE,
  Key: { orderId: "o-1" },
  UpdateExpression: "SET #s = :paid",
  ConditionExpression: "#s = :new",                                     // only pay for an order that is still NEW
  ExpressionAttributeNames: { "#s": "status" },
  ExpressionAttributeValues: { ":paid": "PAID", ":new": "NEW" },
  ReturnValues: "ALL_NEW",
};
const first = await doc.send(new UpdateCommand(pay));
console.log("First payment:", first.Attributes.status);
try {
  await doc.send(new UpdateCommand(pay));
} catch (err) {
  if (err instanceof ConditionalCheckFailedException) console.log("Second payment refused:", err.name);
  else throw err;
}
EOF
node dynamo.mjs
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb get-item --table-name ama-l2-sdk-orders --key '{"orderId":{"S":"o-1"}}' --query 'Item.{status:status.S,qty:qty.N}' --output text
~~~

~~~text
Table: SUCCESS
Item: {"orderId":"o-1","item":"masala chai","qty":2,"status":"NEW"}
First payment: PAID
Second payment refused: ConditionalCheckFailedException
2	PAID
~~~

The document client let you write `qty: 2` instead of `{ "N": "2" }`; the CLI read the same item back using the low-level types (`qty.N`, `status.S`). The **condition** `status = NEW` made the payment safe: the first update succeeded, the second was refused with `ConditionalCheckFailedException`. That is how real systems stop an order being paid, or a ticket sold, twice.

### Step 6: Where does the SDK find credentials and Region?
`chain.mjs` creates a client with **no** credentials and **no** Region in the code and prints what the default chain found (only the access key ID, never the secret). First, point the SDK at lab files that don't exist yet and clear any credential variables, so your real `~/.aws` is not used:

~~~bash
cat > chain.mjs <<'EOF'
import { S3Client } from "@aws-sdk/client-s3";

// No region and no credentials in the code: the SDK must find them itself.
const s3 = new S3Client({ endpoint: "http://localhost:4566", forcePathStyle: true });
try {
  const creds = await s3.config.credentials();
  console.log("Access key from:", creds.accessKeyId);
  console.log("Region from:", await s3.config.region());
} catch (err) {
  console.log(err.name + ":", err.message);
}
EOF
export AWS_CONFIG_FILE="$PWD/aws-config" AWS_SHARED_CREDENTIALS_FILE="$PWD/aws-credentials"
unset AWS_PROFILE AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN AWS_REGION AWS_DEFAULT_REGION
node chain.mjs
~~~

~~~text
CredentialsProviderError: Could not load credentials from any providers
~~~

Nothing in the chain had credentials. (On a laptop the instance-metadata step fails quickly; on EC2 it would have found the instance role.) Now give it **environment variables**:

~~~bash
AWS_ACCESS_KEY_ID=lab-env-key AWS_SECRET_ACCESS_KEY=test AWS_REGION=ap-south-1 node chain.mjs
~~~

~~~text
Access key from: lab-env-key
Region from: ap-south-1
~~~

Next, a **lab-only profile** in the lab files:

~~~bash
printf '[profile ama-sdk]\nregion = ap-south-1\n' > aws-config
printf '[ama-sdk]\naws_access_key_id = lab-profile-key\naws_secret_access_key = test\n' > aws-credentials
AWS_PROFILE=ama-sdk node chain.mjs
~~~

~~~text
Access key from: lab-profile-key
Region from: ap-south-1
~~~

Finally, **both at once**, with a different Region in the environment:

~~~bash
AWS_PROFILE=ama-sdk AWS_ACCESS_KEY_ID=lab-env-key AWS_SECRET_ACCESS_KEY=test AWS_REGION=eu-west-1 node chain.mjs
~~~

~~~text
@aws-sdk/credential-provider-node - defaultProvider::fromEnv WARNING:
    Multiple credential sources detected: 
    Both AWS_PROFILE and the pair AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY static credentials are set.
    This SDK will proceed with the AWS_PROFILE value.
    
    However, a future version may change this behavior to prefer the ENV static credentials.
    Please ensure that your environment only sets either the AWS_PROFILE or the
    AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY pair.

Access key from: lab-profile-key
Region from: eu-west-1
~~~

The SDK warned about two credential sources, used the **profile's** key, and took the Region from **`AWS_REGION`**. The lesson: set exactly one credential source. In real deployments the chain finds the role's temporary credentials and your code contains no keys at all.

### Step 7: Clean up
~~~bash
cat > cleanup.mjs <<'EOF'
import { S3Client, paginateListObjectsV2, DeleteObjectsCommand, DeleteBucketCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, DeleteTableCommand } from "@aws-sdk/client-dynamodb";
import { labConfig, BUCKET, TABLE } from "./lab-config.mjs";

const s3 = new S3Client({ ...labConfig, forcePathStyle: true });
for await (const p of paginateListObjectsV2({ client: s3 }, { Bucket: BUCKET })) {
  if (!p.Contents) continue;
  const r = await s3.send(new DeleteObjectsCommand({ Bucket: BUCKET, Delete: { Objects: p.Contents.map((o) => ({ Key: o.Key })) } }));
  console.log("Deleted objects:", r.Deleted.length);
}
await s3.send(new DeleteBucketCommand({ Bucket: BUCKET }));
console.log("Deleted bucket:", BUCKET);
await new DynamoDBClient(labConfig).send(new DeleteTableCommand({ TableName: TABLE }));
console.log("Deleted table:", TABLE);
EOF
node cleanup.mjs
unset AWS_CONFIG_FILE AWS_SHARED_CREDENTIALS_FILE
cd ~ && rm -r ~/ama-sdk
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb list-tables --query 'length(TableNames[?starts_with(@,`ama-l2-sdk`)])'
~~~

~~~text
Deleted objects: 5
Deleted bucket: ama-l2-sdk-orders
Deleted table: ama-l2-sdk-orders
0
~~~

Paginating and batch-deleting objects (`DeleteObjects`, up to 1,000 keys per call) is how real code empties a bucket before deleting it. The `0` confirms the table is gone; `rm -r` removed the project, its `node_modules` and the lab profile files.

### Floci vs. real AWS
- **Same SDK behaviour.** Clients, commands, paginators, waiters, typed errors, retries and the credential chain are features of the SDK and behave the same against real AWS.
- **Endpoint and keys:** with real AWS you would remove `endpoint`, `forcePathStyle` and `credentials` from `lab-config.mjs` and let the chain find role credentials. Keep the Region.
- **Permissions:** Floci does not enforce IAM, so you will never see `AccessDenied` here. On real AWS, an `AccessDenied` error is a client fault and is not retried.
- **Throttling:** Floci does not throttle; real AWS can return `ThrottlingException` or `SlowDown`, which the SDK retries with back-off.
