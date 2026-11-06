## What is the AWS CLI?

### The simple version
The AWS CLI is a program you use by **typing commands** instead of clicking. Where the console is like ordering from a picture menu, the CLI is like sending precise written orders: faster once you know them, and easy to **save and repeat**.

~~~text
aws  [global options]                    <service>  <action>          <options>
aws  --endpoint-url http://localhost:4566  s3         ls
aws  --endpoint-url http://localhost:4566  dynamodb   describe-table    --table-name orders
aws  --endpoint-url http://localhost:4566  ec2        describe-regions  --query 'Regions[].RegionName' --output text
~~~
(In this academy `--endpoint-url http://localhost:4566` sends every command to Floci. Against real AWS you'd leave it out.)

You've been using it in every lesson. This lesson shows how to use it **well**.

### The professional version
The AWS CLI v2 is a single tool covering every AWS service. It turns each command into a signed API request (as you saw in the APIs lesson) and adds:

| Feature | What it gives you |
|---|---|
| **Profiles** | Named settings for different accounts, roles and Regions |
| **Config resolution** | Clear rules for where credentials and Region come from |
| **Output formats** | `json`, `yaml`, `text`, `table` |
| **`--query` (JMESPath)** | Filter and reshape output on your computer |
| **`--filters`** (some services) | Ask the service to return less data |
| **Pagination and retries** | Automatic, configurable |
| **Waiters** | `aws ec2 wait instance-running` and similar |
| **`--dry-run`** (EC2 and others) | Check permissions and parameters without acting |
| **Skeletons** | `--generate-cli-skeleton` and `--cli-input-json/yaml` for complex inputs |
| **High-level S3** | `aws s3 cp/sync/mv/rm/ls` with multipart uploads and recursion |
| **SSO** | `aws sso login` for IAM Identity Center |

### Where settings live
~~~text
~/.aws/config                         ~/.aws/credentials
[default]                             [default]
region = ap-south-1                   aws_access_key_id = AKIA…
output = json                         aws_secret_access_key = …

[profile shop-prod]                   [shop-dev]
sso_session = company                 aws_access_key_id = …
sso_account_id = 123456789012         aws_secret_access_key = …
sso_role_name = ReadOnly
region = ap-south-1
~~~
Note the difference: in `config`, named sections are written `[profile NAME]`; in `credentials`, just `[NAME]`.

### What you'll do
Create a **lab-only profile** in files inside your lab folder (your real `~/.aws` is never touched), try every output format, write JMESPath queries, do a dry run, prove the settings precedence order, build a queue from a JSON skeleton, and sync a small website to S3.
