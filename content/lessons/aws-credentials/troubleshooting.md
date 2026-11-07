## Troubleshooting

### Lab issues (seen on Floci 2.4.0 with AWS CLI 2.35.9)
| Symptom | Cause | Fix |
|---|---|---|
| `LimitExceeded … Cannot exceed quota for AccessKeysPerUser: 2` | A third key for the same user (step 4, on purpose) | Deactivate and delete an old key first |
| `Parameter validation failed: Invalid value for parameter DurationSeconds, value: 600, valid min value: 900` | Session shorter than 15 minutes (step 6, on purpose) | Use 900 seconds or more |
| `Invalid length for parameter RoleSessionName, value: 1, valid min length: 2` | Session name too short | Use at least 2 characters, e.g. a person's name |
| `The config profile () could not be found` | `AWS_PROFILE=` set to an empty value | Use `env -u AWS_PROFILE …` or `unset AWS_PROFILE` |
| A role profile fails with `InvalidClientTokenId` against Floci | The profile has no `endpoint_url`, so the automatic AssumeRole went to **real AWS**, which doesn't know the Floci key | Add `endpoint_url = http://localhost:4566` to the role profile and its source profile |
| `.aws/cli/cache` appears in your real home folder | A role profile was used without `HOME="$PWD"` | Delete the cache files you created; they only hold Floci credentials |

### Real-world credential problems
| Message | Cause | Fix |
|---|---|---|
| `InvalidClientTokenId: The security token included in the request is invalid` | Unknown, deleted or deactivated key ID; or an `ASIA` key without its session token | Check the key's status; set `AWS_SESSION_TOKEN` for temporary credentials |
| `SignatureDoesNotMatch` | Wrong secret, often a copy-paste error or extra space | Re-enter the secret, or create a new key |
| `ExpiredToken` / `ExpiredTokenException` | Temporary credentials expired | Assume the role again / `aws sso login`; long jobs should use auto-refreshing providers |
| `AccessDenied … is not authorized to perform: sts:AssumeRole` | The caller lacks permission, **or** the role's trust policy doesn't trust the caller | Check both sides: the caller's policy and the role's trust policy |
| `ValidationError: The requested DurationSeconds exceeds the MaxSessionDuration set for this role` | Asked for longer than the role allows | Shorten the duration or raise the role's maximum (up to 12 h) |
| `Unable to locate credentials` | Nothing in the credential chain | `aws configure list`; sign in, or select a profile |
