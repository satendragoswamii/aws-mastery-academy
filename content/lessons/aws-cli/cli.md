## CLI reference for this lesson

### Configuration
| Command | What it does |
|---|---|
| `aws --version` | Shows the CLI version (use v2) |
| `aws configure` | Interactive setup of the default (or `--profile`) profile |
| `aws configure set KEY VALUE --profile NAME` | Sets one value |
| `aws configure get KEY` | Reads one value for the current profile |
| `aws configure list [--profile NAME]` | Shows values and their sources |
| `aws configure list-profiles` | Lists profile names |
| `aws sso login --profile NAME` | Signs in with IAM Identity Center |

### Environment variables
| Variable | Purpose |
|---|---|
| `AWS_PROFILE` | Which profile to use |
| `AWS_REGION` / `AWS_DEFAULT_REGION` | Region (beats the profile) |
| `AWS_CONFIG_FILE`, `AWS_SHARED_CREDENTIALS_FILE` | Use different config/credentials files (the lab's trick) |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` | Credentials (avoid for real keys) |
| `AWS_PAGER=""` | Don't open output in a pager |

### Global options
| Option | Purpose |
|---|---|
| `--profile`, `--region`, `--output`, `--query`, `--endpoint-url` | As covered |
| `--no-paginate`, `--max-items`, `--page-size`, `--starting-token` | Pagination control |
| `--debug` | Full request/response log |
| `--cli-input-json file://…` / `--cli-input-yaml` | Read parameters from a file |
| `--generate-cli-skeleton [input\|output\|yaml-input]` | Print a template |
| `--dry-run` (EC2 and some others) | Validate without acting |

### Try it yourself
(Set up the lab profile again first, as in step 1.)
1. Write one `--query` that prints a table of **all three** Mumbai AZs with columns `Name` and `Id`, sorted by `Id`.
2. Use `--query` and `--output text` to put the queue URL of a new queue `ama-l1-cli-try` into a variable `Q`, then `echo $Q`. Delete the queue using `$Q`.
3. Use `aws s3 cp site s3://ama-l1-cli-try2 --recursive` and compare it with `sync`: run each twice. What's the difference? Clean up.
