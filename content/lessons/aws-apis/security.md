## Security and best practices

### Signing protects you
- SigV4 means your **secret key never crosses the network**. Anyone who sees a request can't reuse it to make different requests.
- Signed requests are valid only for a short time window, which limits replay.
- All AWS endpoints use **TLS**. Never disable certificate checks (`--no-verify-ssl`) against real AWS.

### Protect the keys that sign
1. Prefer **temporary credentials** (IAM roles, IAM Identity Center, `aws sso login`) over long-term access keys.
2. Never put keys in code, scripts, URLs or command history. `curl --user KEY:SECRET` puts them in your shell history and process list. Fine for Floci's dummy `test:test`, **never** for real keys.
3. Rotate and remove unused keys; alert on their use from unexpected places.

### Debug output can leak secrets
`--debug` prints request bodies and headers. Bodies may contain secrets (for example a `create-secret` value), and if you use session credentials the session token appears in headers. **Don't paste debug logs into tickets or chats** without removing those parts.

### Least privilege is defined in API terms
IAM actions map to API operations (`dynamodb:DescribeTable`). To grant the minimum, list the API calls your application actually makes (CloudTrail and IAM Access Analyzer's policy generation can help).

### Retries and safety
Make write operations **idempotent** (client tokens, conditional writes) so automatic retries can't create duplicates or corrupt data.

### In this lab
Floci doesn't verify signatures and answers unsigned requests (step 8). That's convenient for learning, but it's **not** how AWS behaves. Never expose Floci's port to a network.
