## How cloud security works

### 1. Every request is authenticated, then authorised
Every AWS API call (from the console, CLI or SDK) is signed with credentials. AWS then asks two questions:

~~~text
request: "user ama-l1-auditor wants s3:DeleteObject on ama-l1-shop-records/orders/1001.txt"
   |
   v
1. Authentication: is the signature valid? Who is this?        -> user ama-l1-auditor
   |
   v
2. Authorisation: evaluate every policy that applies
      - any explicit Deny?                 -> yes: DENIED
      - any Allow matching action+resource? -> yes: ALLOWED
      - otherwise                           -> DENIED (implicit deny)
~~~

**Default deny** is the key idea: a brand-new user can do nothing. Access is only what you explicitly allow, and an explicit `Deny` always wins over any `Allow`.

### 2. Policies are JSON documents
~~~text
{
  "Effect":   "Allow",                                  <- Allow or Deny
  "Action":   ["s3:GetObject", "s3:ListBucket"],        <- which API calls
  "Resource": "arn:aws:s3:::ama-l1-shop-records/orders/*"  <- on what (ARN)
}
~~~
Least privilege means making `Action` and `Resource` as narrow as possible. `"Action": "*"` with `"Resource": "*"` is full administrator access.

### 3. Encryption: the key is everything
Symmetric encryption (AES-256) uses one key to encrypt and decrypt. The data is only as safe as the key, so AWS keeps keys in **KMS**:

~~~text
your app --- "encrypt this with alias/ama-l1-shop-key" ---> KMS
                                                            | key material stays
your app <-- ciphertext (unreadable) ----------------------+  inside KMS
~~~

- The key material never leaves KMS in plaintext.
- Who may use a key is controlled by the **key policy** and IAM.
- Every use is logged in CloudTrail.

KMS `Encrypt` only handles up to 4 KB. For real data, services use **envelope encryption**: KMS generates a **data key**, the data is encrypted locally with it, and only the encrypted data key is stored next to the data.

### 4. Key types
| Type | Who manages it | You can control its policy? | Typical use |
|---|---|---|---|
| AWS owned keys | AWS, shared across accounts | No | Default encryption in some services |
| AWS managed keys (`aws/s3`, `aws/ebs`…) | AWS, in your account | No | One-click encryption |
| **Customer managed keys** | You | Yes (policy, rotation, deletion) | Compliance, separation of duties |

### 5. Encryption in S3
| Option | Key | Notes |
|---|---|---|
| SSE-S3 (`AES256`) | Managed by S3 | Default for all new objects since January 2023 |
| SSE-KMS (`aws:kms`) | A KMS key | Access to the key is a second permission check; logged |
| DSSE-KMS | Two layers with KMS | For strict compliance requirements |
| SSE-C | You send the key with every request | You must manage the key yourself |

### 6. Secrets: don't store them in code
~~~text
WRONG:  app code / .env file contains   password=Example-Only-123   -> leaks via Git, images, logs
RIGHT:  app calls  secretsmanager get-secret-value --secret-id ama-l1/shop-db  at runtime
        (allowed by IAM, decrypted by KMS, logged in CloudTrail, rotatable)
~~~

### 7. Layers (defence in depth)
~~~text
Internet
  -> AWS WAF / Shield           (block bad requests, absorb DDoS)
  -> public subnet + SG 443     (network: only the load balancer is public)
  -> private subnet + SG        (app reachable only from the load balancer)
  -> IAM role                   (app can read only its own bucket and secret)
  -> KMS encryption             (stolen data is useless)
  -> CloudTrail + GuardDuty     (every action recorded, threats detected)
~~~
