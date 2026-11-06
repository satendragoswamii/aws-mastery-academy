## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws ec2 describe-security-groups --filters Name=ip-permission.cidr,Values=0.0.0.0/0 Name=ip-permission.from-port,Values=22` | Finds groups allowing SSH from anywhere |
| `aws iam get-account-password-policy` | Shows the custom password policy (or `NoSuchEntity`) |
| `aws iam update-account-password-policy --minimum-password-length 14 …` | Sets the password policy |
| `aws iam delete-account-password-policy` | Removes the custom policy |
| `aws ec2 get-ebs-encryption-by-default` | Is EBS encryption by default on in this Region? |
| `aws ec2 enable-ebs-encryption-by-default` / `disable-…` | Turns it on or off (per Region) |
| `aws s3control put-public-access-block --account-id …` | Blocks public access for every bucket in the account |
| `aws s3control get-public-access-block --account-id …` / `delete-…` | Shows or removes it |
| `aws configservice put-config-rule --config-rule '{…}'` | Creates a Config rule (managed or custom) |
| `aws configservice describe-config-rules` | Lists Config rules |
| `aws configservice delete-config-rule --config-rule-name …` | Deletes a rule |
| `aws iam get-account-summary` | Account-wide IAM counts, including root MFA and root access keys (real AWS) |

### Useful AWS managed Config rules
| Rule identifier | Checks |
|---|---|
| `INCOMING_SSH_DISABLED` | Security groups don't allow SSH from 0.0.0.0/0 |
| `S3_BUCKET_PUBLIC_READ_PROHIBITED` | No publicly readable buckets |
| `ENCRYPTED_VOLUMES` | Attached EBS volumes are encrypted |
| `ROOT_ACCOUNT_MFA_ENABLED` | Root user has MFA |
| `IAM_PASSWORD_POLICY` | Password policy meets your requirements |
| `CLOUD_TRAIL_ENABLED` | A CloudTrail trail exists |

### Try it yourself
1. Check `ec2 get-ebs-encryption-by-default` in `ap-south-1` and `us-east-1`. Turn it on in us-east-1 only, and prove ap-south-1 is unaffected (the setting is per Region). Turn it off again.
2. Create the managed rule `S3_BUCKET_PUBLIC_READ_PROHIBITED` as `ama-l1-no-public-s3`, list it, delete it.
3. For each command in the table, say whether it's "security in the cloud" or "of the cloud". (Trick question: why are they all one kind?)
