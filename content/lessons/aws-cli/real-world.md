## In the real world

### "I deleted the wrong thing"
An engineer cleaned up test buckets with a loop, but `AWS_PROFILE` from an earlier session still pointed at **production**. Teams now start every script with `aws sts get-caller-identity` (and often refuse to continue unless the account ID matches), use clearly named profiles (`shop-prod-read`), and give production profiles read-only roles by default.

### Shell prompts that show the profile
Many engineers configure their terminal prompt to display the current `AWS_PROFILE` and Region, in red for production. A small change that prevents big mistakes.

### Static websites deployed with one line
Countless static websites and single-page apps are deployed with `aws s3 sync ./build s3://my-site --delete` followed by a CloudFront cache invalidation. `sync` uploads only what changed, so deploys take seconds.

### JMESPath in daily operations
Operations teams keep a file of useful queries: "all instances without an Owner tag", "volumes not attached to anything", "security groups open to 0.0.0.0/0". Each is one CLI command with `--filters` and `--query`.

### No more keys on laptops
Companies moving to IAM Identity Center replace every `[profile]` with access keys by SSO profiles. Engineers run `aws sso login` each morning; there's nothing long-lived to leak.
