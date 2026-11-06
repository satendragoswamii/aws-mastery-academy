## How engineers set up the CLI for many accounts

~~~text
~/.aws/config
  [sso-session company]          sso_start_url = https://company.awsapps.com/start, sso_region = ap-south-1
  [profile shop-dev]             sso_session = company, sso_account_id = 111111111111, sso_role_name = Developer
  [profile shop-prod-read]       sso_session = company, sso_account_id = 222222222222, sso_role_name = ReadOnly
  [profile shop-prod-deploy]     role_arn = arn:aws:iam::222222222222:role/Deployer, source_profile = shop-dev
  (no long-term keys anywhere)

[real AWS only] aws sso login --sso-session company  -> browser login + MFA once -> temporary credentials cached for hours
[real AWS only] aws --profile shop-prod-read s3 ls  -> uses those temporary credentials for account 222222222222
~~~

### Where the CLI runs, and where its credentials come from
| Where | Credentials |
|---|---|
| Your laptop | IAM Identity Center (`aws sso login`) profiles |
| AWS CloudShell | Your console session |
| EC2 instance | The instance profile role (instance metadata) |
| ECS task / Lambda | The task role / function's execution role |
| CI/CD (GitHub Actions, CodeBuild) | OIDC federation to a role, or the build's service role |

In none of these do you need a long-term access key. Keys in files are for exceptions (and for Floci's dummy `test` keys).

### A safe script skeleton (for a real account, not the lab)
~~~text
#!/bin/bash
set -euo pipefail                                   # stop on the first error
export AWS_PROFILE=shop-dev AWS_REGION=ap-south-1   # be explicit
# then the first AWS command prints who we are:  sts get-caller-identity --query Arn --output text
# ... commands, using --query/--output text to pass values between them ...
~~~
