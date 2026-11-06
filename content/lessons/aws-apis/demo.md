## Take the API apart: debug, sign by hand, three styles, errors, pages

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06 with the AWS CLI v2 and macOS's built-in `curl` 8.7 (which can sign AWS requests with `--aws-sigv4`). Floci implements the same API styles as AWS, so the requests are real AWS API requests sent to a local endpoint. Floci doesn't verify signatures (see the end).

> Work in **one Terminal window**. Floci accepts the dummy credentials `test` / `test`, which is why `curl --user "test:test"` works.

### Step 1: See the real request behind a CLI command
Create a table, then ask the CLI to show its internals with `--debug` (filtered to the interesting lines):

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb create-table --table-name ama-l1-api-orders \
  --attribute-definitions AttributeName=orderId,AttributeType=S --key-schema AttributeName=orderId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST --query TableDescription.TableStatus --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb describe-table --table-name ama-l1-api-orders --debug 2>&1 \
  | grep -oE "method=POST, url=[^,]+|'X-Amz-Target': b'[^']+'|Authorization': b'AWS4-HMAC-SHA256 Credential=[^,]+" | sort -u
~~~

~~~text
ACTIVE
'X-Amz-Target': b'DynamoDB_20120810.DescribeTable'
Authorization': b'AWS4-HMAC-SHA256 Credential=test/20261106/ap-south-1/dynamodb/aws4_request
method=POST, url=http://localhost:4566/
~~~

The command became an **HTTP POST** with the operation name in `X-Amz-Target` and a **SigV4** `Authorization` header. Look at the credential scope: access key `test`, date, **Region**, **service**.

### Step 2: The string that gets signed
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb describe-table --table-name ama-l1-api-orders --debug 2>&1 \
  | grep -A4 'StringToSign:' | tail -4
~~~

~~~text
AWS4-HMAC-SHA256
20261106T155308Z
20261106/ap-south-1/dynamodb/aws4_request
6bbf70c807b40fcf69784bea3f06d29be3bdaef12df0ff2f6ffd7f851ca0b363
~~~

Algorithm, timestamp, credential scope, and a SHA-256 hash of the whole request. The CLI signs this with a key derived from your secret; the secret itself never leaves your computer. (Your timestamp and hash will differ.)

### Step 3: Call DynamoDB yourself with curl (JSON style)
~~~bash
curl -s --aws-sigv4 "aws:amz:ap-south-1:dynamodb" --user "test:test" \
  -H 'Content-Type: application/x-amz-json-1.0' -H 'X-Amz-Target: DynamoDB_20120810.DescribeTable' \
  -d '{"TableName":"ama-l1-api-orders"}' http://localhost:4566/ | python3 -m json.tool | head -8
~~~

~~~text
{
    "Table": {
        "TableName": "ama-l1-api-orders",
        "TableId": "1aa346f1-fbba-4ccc-a59d-e22eed2acf3d",
        "TableStatus": "ACTIVE",
        "TableArn": "arn:aws:dynamodb:ap-south-1:000000000000:table/ama-l1-api-orders",
        "CreationDateTime": 1793980387.954,
        "ItemCount": 0,
~~~

No AWS CLI involved: `curl` signed the request with SigV4 and got the same answer. **That's all the CLI does.**

### Step 4: SQS the classic way (query style)
~~~bash
curl -s --aws-sigv4 "aws:amz:us-east-1:sqs" --user "test:test" -d 'Action=ListQueues&Version=2012-11-05' http://localhost:4566/; echo
~~~

~~~text
<ListQueuesResponse><ListQueuesResult><QueueUrl>http://localhost:4566/000000000000/smoke</QueueUrl></ListQueuesResult><ResponseMetadata><RequestId>10ac32fb-57c3-4f81-b4c5-6b26e91222f2</RequestId></ResponseMetadata></ListQueuesResponse>
~~~

A form-encoded `Action=` body and an **XML** answer listing Floci's `smoke` queue, with a **RequestId**. (Modern SQS clients use JSON; AWS still supports this older style.)

### Step 5: S3 the REST way, and an error
In REST APIs, the resource is in the URL. Ask for a bucket that doesn't exist:

~~~bash
curl -s --aws-sigv4 "aws:amz:ap-south-1:s3" --user "test:test" -w '\nHTTP %{http_code}\n' http://localhost:4566/ama-l1-api-missing/
~~~

~~~text
<?xml version="1.0" encoding="UTF-8"?><Error><Code>NoSuchBucket</Code><Message>The specified bucket does not exist.</Message><BucketName>ama-l1-api-missing</BucketName><RequestId>195db6aa-e04d-4577-b68d-b4790d5b08d9</RequestId></Error>
HTTP 404
~~~

Every AWS error has the same parts: an **error code** (`NoSuchBucket`), a **message**, an **HTTP status** (404) and a **request ID**. The CLI turns this into the `An error occurred (NoSuchBucket)…` lines you've seen in every lesson.

### Step 6: Pages of results
Create a bucket with five receipts, then ask for **two keys per page**:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket --bucket ama-l1-api-receipts \
  --create-bucket-configuration LocationConstraint=ap-south-1 --output text
for i in 1 2 3 4 5; do printf "receipt $i" > r$i.txt; aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-object \
  --bucket ama-l1-api-receipts --key receipts/r$i.txt --body r$i.txt --query ETag --output text > /dev/null; done
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-objects-v2 --bucket ama-l1-api-receipts --max-keys 2 \
  --no-paginate --query '{Keys:Contents[].Key,IsTruncated:IsTruncated,NextContinuationToken:NextContinuationToken}' --output json
~~~

~~~text
/ama-l1-api-receipts
{
    "Keys": [
        "receipts/r1.txt",
        "receipts/r2.txt"
    ],
    "IsTruncated": true,
    "NextContinuationToken": "receipts/r2.txt"
}
~~~

`IsTruncated: true` means **there's more**. Send the token back to get page 2:

~~~bash
TOKEN=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-objects-v2 --bucket ama-l1-api-receipts --max-keys 2 \
  --no-paginate --query NextContinuationToken --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-objects-v2 --bucket ama-l1-api-receipts --max-keys 2 \
  --no-paginate --continuation-token "$TOKEN" --query '{Keys:Contents[].Key,IsTruncated:IsTruncated}' --output json
~~~

~~~text
{
    "Keys": [
        "receipts/r3.txt",
        "receipts/r4.txt"
    ],
    "IsTruncated": true
}
~~~

Without `--no-paginate`, the CLI follows the tokens for you. `--page-size 2` makes it fetch two at a time, but you still get everything:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api list-objects-v2 --bucket ama-l1-api-receipts --page-size 2 \
  --query 'Contents[].Key' --output text
~~~

~~~text
receipts/r1.txt	receipts/r2.txt
receipts/r3.txt	receipts/r4.txt
receipts/r5.txt
~~~

Three lines = **three API requests** of up to two keys each.

### Step 7: The Region is inside the signature
Repeat step 3, but sign for **us-east-1**:

~~~bash
curl -s --aws-sigv4 "aws:amz:us-east-1:dynamodb" --user "test:test" \
  -H 'Content-Type: application/x-amz-json-1.0' -H 'X-Amz-Target: DynamoDB_20120810.DescribeTable' \
  -d '{"TableName":"ama-l1-api-orders"}' -w '\nHTTP %{http_code}\n' http://localhost:4566/
~~~

~~~text
{"__type":"ResourceNotFoundException","message":"Requested resource not found: Table: ama-l1-api-orders not found"}
HTTP 400
~~~

Same URL, same body; only the signature's Region changed, and the table "doesn't exist". Floci reads the Region from the signature's credential scope; in real AWS each Region also has its own endpoint, and a signature for the wrong Region is rejected.

### Step 8: An unsigned request (Floci only!)
~~~bash
curl -s -H 'Content-Type: application/x-amz-json-1.0' -H 'X-Amz-Target: DynamoDB_20120810.ListTables' -d '{}' \
  -w '\nHTTP %{http_code}\n' http://localhost:4566/
~~~

~~~text
{"TableNames":[]}
HTTP 200
~~~

Floci answered an **unsigned** request (using its default Region, so your Mumbai table isn't listed). **Real AWS would refuse** it with HTTP 400 `MissingAuthenticationTokenException`. Never assume an AWS endpoint is open just because Floci is.

### Step 9: Clean up
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 dynamodb delete-table --table-name ama-l1-api-orders \
  --query TableDescription.TableName --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rb s3://ama-l1-api-receipts --force
~~~

~~~text
ama-l1-api-orders
delete: s3://ama-l1-api-receipts/receipts/r1.txt
delete: s3://ama-l1-api-receipts/receipts/r2.txt
delete: s3://ama-l1-api-receipts/receipts/r4.txt
delete: s3://ama-l1-api-receipts/receipts/r3.txt
delete: s3://ama-l1-api-receipts/receipts/r5.txt
remove_bucket: ama-l1-api-receipts
~~~

(The `delete:` lines may appear in a different order: the CLI deletes in parallel.)

### Floci vs. real AWS
- **Signatures aren't checked.** Floci accepted an unsigned request (step 8) and accepts any key. Real AWS verifies every signature and rejects unsigned, expired or wrong-key requests (`MissingAuthenticationTokenException`, `SignatureDoesNotMatch`, `UnrecognizedClientException`).
- **One endpoint for everything.** Floci serves every service and Region at `localhost:4566`, routing by signature and headers. Real AWS has a separate HTTPS endpoint per service and Region.
- **Continuation tokens:** Floci's `NextContinuationToken` is the last key name; real S3 returns an opaque encoded token. Treat tokens as opaque either way.
- **No throttling.** Floci never throttles, so you won't see `ThrottlingException` here; real AWS will throttle bursts.
- **Matched real AWS:** the JSON, query and REST request shapes, error codes and HTTP statuses, request IDs and pagination fields.
