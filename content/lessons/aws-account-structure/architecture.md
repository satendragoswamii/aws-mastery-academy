## A recommended multi-account landing zone

This is the shape AWS's multi-account guidance and **AWS Control Tower** set up, adapted for the shop:

~~~text
Organization
 Root   [SCPs: deny leaving the org, deny disabling CloudTrail/Config, deny unapproved Regions]
  |
  +-- Management account        Organizations, billing, IAM Identity Center. NO workloads.
  |
  +-- OU Security
  |     +-- log-archive         central CloudTrail + Config logs (S3, write-once, few people can read)
  |     +-- security-tooling    GuardDuty / Security Hub delegated administrator, audit roles
  |
  +-- OU Infrastructure
  |     +-- network             Transit Gateway, shared VPCs, DNS
  |
  +-- OU Workloads
  |     +-- OU Prod   [SCP: India Regions only, no deleting backups]
  |     |     +-- shop-prod
  |     +-- OU Non-prod
  |           +-- shop-staging
  |           +-- shop-dev
  |
  +-- OU Sandbox  [SCP: cheap instance types only; budgets]  one account per developer
  |
  +-- OU Suspended  [SCP: deny all]  accounts waiting to be closed
~~~

### How people get in
~~~text
person -> IAM Identity Center (one login + MFA) -> chooses account + permission set
          e.g. "shop-prod / ReadOnly"   or   "shop-dev / Developer"
          -> temporary credentials for that account (no IAM users needed)
~~~

### Who sees the bill
| Account | Sees |
|---|---|
| Management | The full consolidated bill, Cost Explorer for all accounts |
| Each member | Its own usage (if allowed) |
| Finance team | Cost Explorer via a delegated read-only permission set; cost allocation tags per team |
