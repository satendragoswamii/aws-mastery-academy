## How the CLI works

### Where each setting comes from (precedence)
For **Region** (and most settings), the first one found wins:

~~~text
1. command-line option        --region us-east-1
2. environment variable       AWS_REGION=eu-west-1   (or AWS_DEFAULT_REGION)
3. selected profile           [profile ama-floci] region = ap-south-1   (profile chosen by --profile or AWS_PROFILE)
4. [default] profile          if no profile was selected
~~~

For **credentials**, the CLI searches in this order:
~~~text
1. --profile / AWS_PROFILE pointing to keys, SSO or a role
2. environment variables      AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY (/ AWS_SESSION_TOKEN)
3. ~/.aws/credentials and ~/.aws/config (default profile)
4. container credentials      (ECS task role)
5. instance metadata          (EC2 instance role)
~~~
(Precisely: an explicit `--profile` beats environment keys; without one, environment keys beat the files.) **`aws configure list`** shows the value and the **source** of each setting.

### JMESPath in five patterns
| Pattern | Example | Meaning |
|---|---|---|
| Projection | `Regions[].RegionName` | One field from every item |
| Filter | `Regions[?OptInStatus=='not-opted-in']` | Only items matching a condition |
| Function | `length(Regions)`, `starts_with(RegionName,'ap-')`, `sort_by(AZs,&ZoneId)` | Count, test, sort |
| Multi-select | `{Region:RegionName,OptIn:OptInStatus}` | Rename and pick fields (great with `--output table`) |
| Index / slice | `[0]`, `[-1]`, `[:3]` | First, last, first three |

String literals in filters use backticks (`` `ap-south-` ``) or single quotes inside the query.

### `--filters` vs. `--query`
~~~text
--filters  Name=instance-state-name,Values=running   -> the SERVICE returns less data (server-side)
--query    'Reservations[].Instances[].InstanceId'   -> the CLI reshapes what came back (client-side)
~~~
Use both: filter on the server to reduce data, query on the client to shape it.

### Output formats
| Format | Best for |
|---|---|
| `json` | Programs, full detail |
| `yaml` | Reading nested data |
| `text` | Shell scripts (tab-separated, no quotes) |
| `table` | People |

### `aws s3` vs. `aws s3api`
| `aws s3` (high level) | `aws s3api` (one API call each) |
|---|---|
| `cp`, `mv`, `rm`, `sync`, `ls`, `mb`, `rb` | `put-object`, `get-object`, `list-objects-v2`, … |
| Automatic multipart upload for big files, recursion, parallel transfers | Every parameter of the API |
| `sync` compares size and modification time | You decide everything |
