## Credentials in a well-run organisation

~~~text
                       Corporate identity (or IAM Identity Center users) + MFA
                                             |
                                    aws sso login (once a day)
                                             |
            +--------------------------------+--------------------------------+
            |                                |                                |
   [profile shop-dev]               [profile shop-prod-read]        [profile shop-prod-deploy]
   sso_role_name = Developer        sso_role_name = ReadOnly        role_arn = ...:role/Deployer
   (account 111111111111)           (account 222222222222)          source_profile = shop-dev
            |                                |                                |
            +------------- temporary credentials (ASIA... + token), 1-12 h ---+

   Workloads:   EC2 -> instance profile     ECS -> task role     Lambda -> execution role
                GitHub Actions -> OIDC -> AssumeRoleWithWebIdentity
   IAM users with access keys:  none, or a short, audited list of exceptions
~~~

### Cross-account access with a role
~~~text
Account A (tools)                                   Account B (production)
user/role "deployer"  -- sts:AssumeRole -->         role "Deployer"
  permission: sts:AssumeRole on B's role              trust policy: Principal = account A's deployer
                                                      permissions: only what deployment needs
~~~
Both sides must agree: A's identity must be **allowed to call** AssumeRole, and B's role must **trust** A. Nobody shares keys between accounts.

### When access keys are still used
| Situation | Better alternative, if possible |
|---|---|
| A tool running outside AWS with no OIDC support | IAM Roles Anywhere (X.509 certificates) |
| An old on-premises script | Roles Anywhere, or a dedicated user with tightly scoped permissions and rotation |
| Local development | IAM Identity Center (SSO) profiles |
| Third-party SaaS integration | A cross-account role with an external ID |

### Guard rails around credentials
- An **SCP** or alarm on `iam:CreateAccessKey` in production accounts.
- **IAM Access Analyzer** and the credential report to find unused keys and users.
- **Secret scanning** in Git hosting and CI to block committed keys.
- **CloudTrail** records every AssumeRole with its session name, so actions trace back to a person.
