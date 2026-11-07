## CLI reference for this lesson

### Access keys (IAM)
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam create-access-key --user-name U` | New key; the only time the secret is shown |
| `aws --endpoint-url http://localhost:4566 iam list-access-keys --user-name U` | IDs, status, creation date (never secrets) |
| `aws --endpoint-url http://localhost:4566 iam get-access-key-last-used --access-key-id K` | When, where, which service (real AWS) |
| `aws --endpoint-url http://localhost:4566 iam update-access-key --user-name U --access-key-id K --status Inactive` | Disable (reversible with `Active`) |
| `aws --endpoint-url http://localhost:4566 iam delete-access-key --user-name U --access-key-id K` | Delete permanently |
| `aws --endpoint-url http://localhost:4566 iam generate-credential-report` / `get-credential-report` | Account-wide CSV (base64) |

### STS
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 sts get-caller-identity` | Who am I? Works with any valid credentials |
| `aws --endpoint-url http://localhost:4566 sts assume-role --role-arn ARN --role-session-name NAME [--duration-seconds 900-43200]` | Temporary role credentials |
| `aws --endpoint-url http://localhost:4566 sts get-session-token [--serial-number MFA_ARN --token-code 123456]` | Temporary credentials for yourself, usually with MFA |

### Profile settings for roles
| Setting | Meaning |
|---|---|
| `role_arn` | Role to assume |
| `source_profile` | Profile whose credentials call AssumeRole |
| `credential_source` | Use `Ec2InstanceMetadata`, `EcsContainer` or `Environment` instead of a profile |
| `role_session_name` | Name shown in CloudTrail and the assumed-role ARN |
| `duration_seconds` | Session length (900 up to the role's maximum) |
| `mfa_serial` | Ask for an MFA code before assuming |
| `external_id` | Required by some third-party roles |
| `endpoint_url` | The lab's guard rail: keeps the automatic AssumeRole call on Floci |

### Safe shell patterns
| Pattern | Why |
|---|---|
| `read -r KEY SECRET <<< "$(aws … --query 'AccessKey.[AccessKeyId,SecretAccessKey]' --output text)"` | Capture without printing |
| `unset SECRET` | Remove it from the shell once stored |
| `echo "${#SECRET}"` | Check the length without revealing the value |

### Try it yourself
(Repeat step 1 first.)
1. Create a user with one key, then use the credential report to show `access_key_1_active` is `TRUE`. Deactivate the key and regenerate the report: what changes?
2. Assume `ama-l2-cred-readonly` twice with session names `asha` and `ravi`. Compare the two assumed-role ARNs. Why is the session name useful in logs?
3. Add a second role profile `ama-readonly-30` with `duration_seconds = 1800`. Use it with `HOME="$PWD"` and read the `Expiration` in the new cache file. How far in the future is it?
