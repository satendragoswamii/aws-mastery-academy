## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws kms create-key --description …` | Creates a customer managed key |
| `aws kms create-alias --alias-name alias/… --target-key-id …` | Gives a key a friendly name |
| `aws kms describe-key --key-id …` | Shows a key's state, spec and usage |
| `aws kms encrypt --key-id … --plaintext fileb://…` | Encrypts up to 4 KB (returns base64 ciphertext) |
| `aws kms decrypt --ciphertext-blob fileb://…` | Decrypts (returns base64 plaintext) |
| `aws kms schedule-key-deletion --key-id … --pending-window-in-days 7` | Schedules deletion (7–30 days) |
| `aws kms cancel-key-deletion --key-id …` | Cancels a scheduled deletion |
| `aws s3api put-public-access-block --bucket … --public-access-block-configuration …` | Turns on Block Public Access |
| `aws s3api put-bucket-encryption --bucket … --server-side-encryption-configuration …` | Sets default encryption |
| `aws s3api put-object … --server-side-encryption aws:kms --ssekms-key-id …` | Uploads with SSE-KMS |
| `aws iam create-user` / `create-policy` / `attach-user-policy` | Creates a user and gives it a policy |
| `aws iam simulate-principal-policy --policy-source-arn … --action-names … --resource-arns …` | Tests what a user or role may do |
| `aws secretsmanager create-secret --name … --secret-string …` | Stores a secret |
| `aws secretsmanager get-secret-value --secret-id …` | Reads the current secret value |
| `aws secretsmanager delete-secret --secret-id … --force-delete-without-recovery` | Deletes immediately (lab only) |

### Why `base64 --decode`?
The CLI returns binary data (ciphertext, plaintext) as base64 text. `--query CiphertextBlob --output text | base64 --decode > file` turns it back into raw bytes, which `fileb://` reads.

### Try it yourself
1. Create a second key `alias/ama-l1-hr-key`, encrypt `card.txt` with it, then try decrypting while passing the **wrong** key:
   ~~~bash
   aws --endpoint-url http://localhost:4566 --region ap-south-1 kms decrypt --ciphertext-blob fileb://card.enc \
     --key-id alias/ama-l1-hr-key
   ~~~
   Read the error. Then schedule both keys for deletion.
2. Run the simulator for `s3:ListBucket` on `arn:aws:s3:::ama-l1-shop-records` (the bucket itself, not an object). Is it allowed? Which line of `read-orders.json` matters?

### Never do this, even in a lab
- `aws iam create-access-key` for your **root** user.
- Paste real access keys into lesson files, screenshots or Git.
- Use `--force-delete-without-recovery` on a real production secret.
