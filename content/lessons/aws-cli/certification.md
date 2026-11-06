## Certification relevance

### AWS Certified Cloud Practitioner (CLF-C02)
**Domain 3, task 3.1:** know that the CLI is a way to access AWS programmatically and automate tasks, and that it needs programmatic credentials (access keys or temporary credentials).

| Question wording | Answer |
|---|---|
| "manage AWS services from a terminal and automate with scripts" | **AWS CLI** |
| "credentials needed for the CLI" | **Access key ID and secret access key** (or temporary credentials, e.g. via SSO) |
| "browser-based shell with the CLI pre-installed" | **AWS CloudShell** |

### Developer – Associate (DVA-C02) and SysOps (SOA-C02)
- **Profiles** and the `config` vs. `credentials` files; `--profile`, `AWS_PROFILE`.
- **Credential and Region precedence** (command line > environment > config files > container/instance roles).
- **`--query`** (client-side JMESPath) vs. **`--filters`** (server-side).
- **`--dry-run`** returns `DryRunOperation` (allowed) or `UnauthorizedOperation` (not allowed).
- **Pagination:** `--max-items`, `--page-size`, `--starting-token`, `--no-paginate`.
- **`aws s3` vs. `aws s3api`**, `sync`, multipart upload for large files.
- `aws sts get-caller-identity` to verify the identity in use.

### Exam traps
- `--query` doesn't reduce what the service sends (no speed or cost gain); `--filters` does.
- Instance roles are the right way to give the CLI on EC2 credentials, not access keys on the instance.
- A `DryRunOperation` "error" means the request **would succeed**.
