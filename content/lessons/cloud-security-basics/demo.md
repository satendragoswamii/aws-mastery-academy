## Lock down the shop's records: key, encryption, private bucket, least privilege, secret

**Lab tier: 🟡 Partially supported in Floci.** These exact commands were run against Floci 2.4.0 on 2026-11-06. Floci really encrypts and decrypts with KMS, stores secrets, refuses public bucket policies and evaluates IAM policies in the simulator. It does **not enforce** IAM permissions on normal requests (see "Floci vs. real AWS" at the end).

> **Important habit:** every command includes `--endpoint-url http://localhost:4566`. Work in **one Terminal window** inside an empty folder (`mkdir -p ~/ama-sec && cd ~/ama-sec`): later steps reuse files and the `$KEY` variable.

### Step 1: Create your own encryption key
~~~bash
KEY=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 kms create-key \
  --description "Shop data key" --query KeyMetadata.KeyId --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms create-alias --alias-name alias/ama-l1-shop-key --target-key-id $KEY
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms describe-key --key-id alias/ama-l1-shop-key \
  --query 'KeyMetadata.{KeyId:KeyId,State:KeyState,Spec:KeySpec,Usage:KeyUsage}' --output table
~~~

~~~text
---------------------------------------------------
|                   DescribeKey                   |
+-------+-----------------------------------------+
|  KeyId|  7bf4f318-e7a8-4262-8737-4c19d273c0f2   |
|  Spec |  SYMMETRIC_DEFAULT                      |
|  State|  Enabled                                |
|  Usage|  ENCRYPT_DECRYPT                        |
+-------+-----------------------------------------+
~~~

A **customer managed key**: symmetric (AES-256), for encrypt/decrypt. The alias is a friendly name you can use instead of the ID. Your key ID will be different.

### Step 2: Encrypt and decrypt something by hand
~~~bash
printf 'card ending 4242' > card.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms encrypt --key-id alias/ama-l1-shop-key \
  --plaintext fileb://card.txt --query CiphertextBlob --output text | base64 --decode > card.enc
grep -c 'card ending' card.enc; wc -c < card.enc
~~~

~~~text
0
     125
~~~

16 bytes of text became 125 bytes of ciphertext, and the words "card ending" appear **0** times in it. Now decrypt:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms decrypt --ciphertext-blob fileb://card.enc \
  --query Plaintext --output text | base64 --decode; echo
~~~

~~~text
card ending 4242
~~~

You didn't name a key when decrypting: the ciphertext carries a reference to it, and KMS decrypted it because you're allowed to use that key. Someone who steals only `card.enc` gets nothing.

### Step 3: A private, encrypted bucket
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api create-bucket --bucket ama-l1-shop-records \
  --create-bucket-configuration LocationConstraint=ap-south-1
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-public-access-block --bucket ama-l1-shop-records \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-bucket-encryption --bucket ama-l1-shop-records \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms","KMSMasterKeyID":"alias/ama-l1-shop-key"},"BucketKeyEnabled":true}]}'
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api get-bucket-encryption --bucket ama-l1-shop-records \
  --query 'ServerSideEncryptionConfiguration.Rules[0].ApplyServerSideEncryptionByDefault'
~~~

~~~text
{
    "Location": "/ama-l1-shop-records"
}
{
    "SSEAlgorithm": "aws:kms",
    "KMSMasterKeyID": "alias/ama-l1-shop-key"
}
~~~

All four Block Public Access switches are on, and new objects should be encrypted with your key by default.

### Step 4: Try to make the bucket public (it should fail)
Create `public-policy.json`, a policy that lets **everyone** (`"Principal": "*"`) read every object:

~~~json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::ama-l1-shop-records/*"
  }]
}
~~~

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-bucket-policy --bucket ama-l1-shop-records \
  --policy file://public-policy.json
~~~

~~~text
aws: [ERROR]: An error occurred (AccessDenied) when calling the PutBucketPolicy operation: Access Denied
~~~

**This failure is the point.** `BlockPublicPolicy` refuses any policy that would make the bucket public, even from an administrator, until someone deliberately turns the switch off.

### Step 5: Store an encrypted order
~~~bash
printf 'order 1001, customer Asha, total 1499 INR\n' > order-1001.txt
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api put-object --bucket ama-l1-shop-records \
  --key orders/1001.txt --body order-1001.txt --server-side-encryption aws:kms --ssekms-key-id alias/ama-l1-shop-key \
  --query '[ServerSideEncryption,SSEKMSKeyId]' --output text
~~~

~~~text
aws:kms	alias/ama-l1-shop-key
~~~

S3 stored the object encrypted with your KMS key (SSE-KMS). We pass the encryption options explicitly here because Floci doesn't apply the bucket default to new objects (real AWS does).

### Step 6: A least-privilege user
Create `read-orders.json`, which allows reading **only** the `orders/` folder of this one bucket:

~~~json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadOrdersOnly",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": [
      "arn:aws:s3:::ama-l1-shop-records",
      "arn:aws:s3:::ama-l1-shop-records/orders/*"
    ]
  }]
}
~~~

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-user --user-name ama-l1-auditor \
  --query User.Arn --output text
POLICY=$(aws --endpoint-url http://localhost:4566 --region ap-south-1 iam create-policy --policy-name ama-l1-read-orders \
  --policy-document file://read-orders.json --query Policy.Arn --output text)
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam attach-user-policy --user-name ama-l1-auditor --policy-arn $POLICY
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam list-attached-user-policies --user-name ama-l1-auditor \
  --query 'AttachedPolicies[].PolicyName' --output text
~~~

~~~text
arn:aws:iam::000000000000:user/ama-l1-auditor
ama-l1-read-orders
~~~

### Step 7: Ask IAM what this user may do
The **policy simulator** evaluates the user's policies exactly as AWS would for a real request:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::000000000000:user/ama-l1-auditor \
  --action-names s3:GetObject s3:PutObject s3:DeleteObject \
  --resource-arns arn:aws:s3:::ama-l1-shop-records/orders/1001.txt \
  --query 'EvaluationResults[].[EvalActionName,EvalDecision]' --output table
~~~

~~~text
-------------------------------------
|      SimulatePrincipalPolicy      |
+------------------+----------------+
|  s3:GetObject    |  allowed       |
|  s3:PutObject    |  implicitDeny  |
|  s3:DeleteObject |  implicitDeny  |
+------------------+----------------+
~~~

Reading is allowed. Writing and deleting were never granted, so they're **implicitly denied**. Now the same read, but in a different folder:

~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::000000000000:user/ama-l1-auditor \
  --action-names s3:GetObject --resource-arns arn:aws:s3:::ama-l1-shop-records/invoices/1001.txt \
  --query 'EvaluationResults[].[EvalActionName,EvalDecision]' --output text
~~~

~~~text
s3:GetObject	implicitDeny
~~~

Same action, different resource, denied. That's least privilege: narrow actions **and** narrow resources.

### Step 8: Keep the database password out of your code
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager create-secret --name ama-l1/shop-db \
  --secret-string '{"username":"shop_app","password":"Example-Only-123"}' --kms-key-id alias/ama-l1-shop-key \
  --query Name --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager describe-secret --secret-id ama-l1/shop-db \
  --query '{Name:Name,EncryptedWith:KmsKeyId,Rotation:RotationEnabled}' --output table
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager get-secret-value --secret-id ama-l1/shop-db \
  --query SecretString --output text
~~~

~~~text
ama-l1/shop-db
---------------------------------------------------------
|                    DescribeSecret                     |
+------------------------+------------------+-----------+
|      EncryptedWith     |      Name        | Rotation  |
+------------------------+------------------+-----------+
|  alias/ama-l1-shop-key |  ama-l1/shop-db  |  False    |
+------------------------+------------------+-----------+
{"username":"shop_app","password":"Example-Only-123"}
~~~

The application would make the `get-secret-value` call at start-up (allowed by its IAM role), so the password never appears in code or Git. Rotation is off here; in real AWS you'd turn it on with a rotation Lambda function.

### Step 9: Clean up
~~~bash
aws --endpoint-url http://localhost:4566 --region ap-south-1 secretsmanager delete-secret --secret-id ama-l1/shop-db \
  --force-delete-without-recovery --query Name --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3 rm s3://ama-l1-shop-records --recursive
aws --endpoint-url http://localhost:4566 --region ap-south-1 s3api delete-bucket --bucket ama-l1-shop-records
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam detach-user-policy --user-name ama-l1-auditor \
  --policy-arn arn:aws:iam::000000000000:policy/ama-l1-read-orders
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-policy \
  --policy-arn arn:aws:iam::000000000000:policy/ama-l1-read-orders
aws --endpoint-url http://localhost:4566 --region ap-south-1 iam delete-user --user-name ama-l1-auditor
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms delete-alias --alias-name alias/ama-l1-shop-key
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms schedule-key-deletion --key-id $KEY --pending-window-in-days 7 \
  --query DeletionDate --output text
aws --endpoint-url http://localhost:4566 --region ap-south-1 kms describe-key --key-id $KEY --query KeyMetadata.KeyState --output text
~~~

~~~text
ama-l1/shop-db
delete: s3://ama-l1-shop-records/orders/1001.txt
2026-11-13T20:50:22+05:30
PendingDeletion
~~~

The deletion date is exactly 7 days from when you run it.

**KMS keys can't be deleted immediately.** You schedule deletion with a waiting period of 7 to 30 days, during which the key is unusable but can be recovered with `cancel-key-deletion`. Once a key is gone, **everything encrypted with it is gone too**, which is why AWS forces the wait.

### Floci vs. real AWS
- **IAM isn't enforced.** Floci identifies who is calling, but doesn't check permissions on normal requests. In our test, the read-only `ama-l1-auditor` user's own access keys **could delete** an object. Real AWS would refuse with `AccessDenied`. Use `simulate-principal-policy` (step 7) to see what real AWS would decide.
- **Anonymous reads work on Floci.** A plain `curl` to an object URL returned the object; real AWS returns `403 Access Denied` for a private bucket.
- **Default bucket encryption isn't applied** to new objects on Floci (`head-object` showed no encryption); real AWS applies it automatically, so step 5's explicit flags would be optional.
- **Key-deletion window:** Floci accepted `--pending-window-in-days 1`; real AWS rejects anything below 7 with a `ValidationException`.
- **Output details:** real AWS returns the full key ARN (not the alias) in `SSEKMSKeyId` and `KmsKeyId`, and `create-bucket` returns a URL-style `Location`.
- **Matched real AWS:** KMS encryption/decryption, the 7-day deletion state, the Block Public Access refusal, the simulator decisions and Secrets Manager storage.
