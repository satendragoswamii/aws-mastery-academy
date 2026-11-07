## In the real world

### Keys in a container image
A company in Pune built a Docker image with an access key in an environment file, and pushed it to a public registry by mistake. Bots found the key within minutes. After the clean-up, the team moved every service to ECS **task roles**: there was nothing left to leak.

### The engineer who changed teams
A developer moved from the payments team to the mobile team but kept direct user policies from the old team. A year later an audit found they could still change payment infrastructure. The company removed all direct user policies; now team access comes only from groups, and changing teams is a group change.

### A vendor and the confused deputy
A cost-optimisation SaaS asked customers to create a role trusting its account. Without an external ID, another customer who learned a victim's role ARN could have asked the vendor to analyse "their" account and been shown the victim's data. The vendor added a unique external ID per customer, which is now standard practice.

### One login, forty accounts
A large retailer has forty AWS accounts. Engineers sign in once through Identity Center and pick an account and permission set; behind the scenes they assume roles. There are almost no IAM users anywhere, and leaving the company removes access to all forty accounts at once.
