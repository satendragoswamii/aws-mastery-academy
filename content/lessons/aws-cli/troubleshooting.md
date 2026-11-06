## Troubleshooting

### Lab issues (seen on Floci 2.4.0)
| Symptom | Cause | Fix |
|---|---|---|
| `DryRunOperation … Request would have succeeded` shown as an error | That's how a successful dry run is reported | Expected (step 4) |
| A filter returns more than expected (`ap-southeast-*` with `ap-south`) | `starts_with` matched a longer name | Make the prefix more specific (`ap-south-`) |
| `s3 sync` re-uploads unchanged files | Files were created and synced within the same second | Wait a second between creating and syncing, as when typing by hand |
| The profile isn't found in a new Terminal window | `AWS_CONFIG_FILE` / `AWS_PROFILE` were set only in the old window | Repeat the `export` lines from steps 1–2 |

### Real-world CLI problems
| Message | Cause | Fix |
|---|---|---|
| `Unable to locate credentials` | No credentials found anywhere in the chain | `aws configure list`; sign in with `aws sso login`; check `AWS_PROFILE` |
| `The config profile (NAME) could not be found` | Typo, or `[NAME]` instead of `[profile NAME]` in `config` | Fix the section name; `aws configure list-profiles` |
| `You must specify a region` | No Region in options, environment or profile | Add `--region` or set `region` in the profile |
| `The SSO session associated with this profile has expired` | SSO token expired | `aws sso login --profile NAME` |
| `ExpiredToken` | Temporary credentials expired | Refresh them (sign in again / re-assume the role) |
| `Bad value for --query` / `Invalid jmespath expression` | Quoting problem in the shell | Wrap the whole query in single quotes; use backticks for literals |
| Output opens in a pager (`less`) | CLI v2 pages long output | `export AWS_PAGER=""` or `--no-cli-pager` |
