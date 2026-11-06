## In the real world

### From one account to a landing zone
A start-up begins with one account. At 20 engineers, a test script deletes a production table, and finance can't split the bill by product. The team sets up **AWS Control Tower**: a management account, log-archive and audit accounts, and separate prod and non-prod accounts per product. Access moves to IAM Identity Center. The next accidental script runs in a dev account and harms nothing.

### The root user that wasn't protected
A small business's root user had no MFA and an old password reused elsewhere. After a breach of another website, attackers signed in as root, created access keys and launched expensive instances in many Regions. Protecting root (MFA, no keys, unique password) and a Region-restricting SCP would each have stopped most of it.

### Guardrails that can't be switched off
A bank's security team attaches SCPs at the root: deny disabling CloudTrail, deny deleting the central log bucket, deny leaving the organization, deny unapproved Regions. Even an administrator in a workload account can't weaken these. The security team sleeps better.

### Large companies
Big enterprises run hundreds or thousands of accounts. Account creation is automated through pipelines ("account vending"), every new account arrives in the right OU with baseline settings, and consolidated billing plus cost allocation tags give each business unit its own cost reports.
