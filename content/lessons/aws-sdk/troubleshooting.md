## Troubleshooting

### Lab issues (seen on Floci 2.4.0 with SDK for JavaScript 3.1164)
| Symptom | Cause | Fix |
|---|---|---|
| `CredentialsProviderError: Could not load credentials from any providers` | No credentials in code, environment or the selected files (step 6, on purpose) | Pass credentials in code (lab), set a profile, or run where a role exists |
| `Error: Region is missing` | A client with no `region`, no `AWS_REGION` and no profile Region | Add `region` to the client or export `AWS_REGION` |
| `Network error: ECONNREFUSED` after 3 attempts | Nothing is listening at the endpoint (step 4 on purpose; or Floci isn't running) | Check `docker ps` shows `floci`; check the endpoint port is 4566 |
| `Multiple credential sources detected` warning | Both `AWS_PROFILE` and `AWS_ACCESS_KEY_ID` set (step 6) | Unset one of them |
| `Cannot find package '@aws-sdk/client-s3'` | Script run outside the project folder, or `npm install` skipped | `cd ~/ama-sdk` and run step 1 again |
| `SyntaxError: Cannot use import statement outside a module` | File saved as `.js` instead of `.mjs` | Use the `.mjs` extension, or add `"type": "module"` to `package.json` |

### Real-world SDK problems
| Message | Cause | Fix |
|---|---|---|
| `AccessDenied` / `AccessDeniedException` | The role lacks the action or resource | Add the exact permission to the role's policy; check the error's action and ARN |
| `ExpiredToken` / `ExpiredTokenException` | Temporary credentials expired (old SSO session) | `aws sso login`; long-running code should let the chain refresh credentials |
| `ThrottlingException`, `SlowDown`, `ProvisionedThroughputExceededException` after retries | Too many requests per second | Back off, raise `maxAttempts`, use `retryMode: "adaptive"`, spread the load, or request a quota increase |
| A List call "misses" items | No pagination | Use the paginator |
| `ValidationException` from DynamoDB | Wrong key name/type, or a reserved word like `status` in an expression | Check the key schema; use `ExpressionAttributeNames` (`#s`) |
| `PermanentRedirect` from S3 | Client Region differs from the bucket's Region | Create the client in the bucket's Region |
| Slow Lambda functions | A new client created inside the handler on every call | Create clients outside the handler and reuse them |
