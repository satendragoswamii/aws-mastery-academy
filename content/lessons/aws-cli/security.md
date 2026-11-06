## Security and best practices

### Credentials
1. **Prefer temporary credentials:** `aws sso login` (IAM Identity Center), role profiles, CloudShell, or instance/task roles.
2. **If you must have access keys**, keep them only in `~/.aws/credentials` (readable only by you), never in scripts, `.env` files committed to Git, or command lines (they end up in shell history).
3. **Never use root user keys** with the CLI.
4. **Rotate and remove** keys you don't need; check with `aws iam list-access-keys`.

### Know where a command will go
- Check **`aws sts get-caller-identity`** before destructive commands.
- Be careful with a leftover **`AWS_PROFILE`** or **`AWS_REGION`** in your terminal. `aws configure list` shows what's active and why.
- Use read-only profiles for production by default.

### Dangerous commands need a pause
- `aws s3 rb --force`, `aws s3 rm --recursive`, `aws s3 sync --delete` remove data. Run them with `--dryrun` first: the `s3` high-level commands spell it `--dryrun`, EC2 uses `--dry-run`.
- Review skeleton/JSON input files before running them.

### Output can contain secrets
Commands like `secretsmanager get-secret-value` or `--debug` print sensitive values. Don't run them on shared screens or paste their output into chats.

### The academy's own safety rules
Every lab command passes `--endpoint-url http://localhost:4566`, and this lesson used a **separate config file** so your real `~/.aws` settings (which point at real AWS) were never changed. The academy's tests check that no lesson command is missing the local endpoint.
