## CLI reference for this lesson

### Account-level settings
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam get-account-summary` | Counts of users, roles, MFA devices; whether root has MFA |
| `aws --endpoint-url http://localhost:4566 iam create-account-alias --account-alias NAME` | Friendly sign-in URL |
| `aws --endpoint-url http://localhost:4566 iam update-account-password-policy --minimum-password-length 14 …` | Set password rules |
| `aws --endpoint-url http://localhost:4566 iam get-account-password-policy` | Show them (`NoSuchEntity` if none) |
| `aws --endpoint-url http://localhost:4566 iam delete-account-password-policy` | Remove them |

### Users and sign-in
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam create-user --user-name U` | Identity only, no credentials or permissions |
| `aws --endpoint-url http://localhost:4566 iam create-login-profile --user-name U --password P --password-reset-required` | Console password |
| `aws --endpoint-url http://localhost:4566 iam get-login-profile --user-name U` | Does the user have a password? |

### MFA
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam create-virtual-mfa-device --virtual-mfa-device-name N --outfile F --bootstrap-method Base32StringSeed` | New virtual device, seed saved to a file |
| `aws --endpoint-url http://localhost:4566 iam enable-mfa-device --user-name U --serial-number ARN --authentication-code1 C1 --authentication-code2 C2` | Link it with two consecutive codes |
| `aws --endpoint-url http://localhost:4566 iam list-mfa-devices --user-name U` | A user's devices |
| `aws --endpoint-url http://localhost:4566 iam deactivate-mfa-device …` then `delete-virtual-mfa-device` | Remove |

### Checking permissions
| Command | What it does |
|---|---|
| `aws --endpoint-url http://localhost:4566 iam simulate-principal-policy --policy-source-arn USER-ARN --action-names A B` | What can this user do? |
| `aws --endpoint-url http://localhost:4566 iam simulate-custom-policy --policy-input-list "$(cat p.json)" --action-names A --context-entries …` | Test a policy with conditions such as MFA |
