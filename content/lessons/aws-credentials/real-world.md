## In the real world

### The weekend bill
A developer committed a project to a public repository with an access key in a config file. Automated bots found the key within minutes and launched many large instances in several Regions to mine cryptocurrency. By Monday the bill was enormous. The fix took minutes (deactivate the key, terminate the instances, ask AWS Support about the charges); the lesson took longer: keys never go in code, and the team moved to roles and SSO.

### The key nobody dared to delete
An audit found an access key, five years old, belonging to an engineer who had left. Nobody knew what used it. The team **deactivated** it instead of deleting it, watched for errors for two weeks, found one forgotten backup script, moved that script to a role, and then deleted the key. The credential report and key last-used data made the search possible.

### Rotation as a routine
Teams that must keep some access keys (for example, for a third-party tool that only accepts keys) automate rotation: a scheduled job creates the second key, stores it in Secrets Manager, the tool reads it from there, and the old key is deactivated and later deleted. Nobody ever sees the secret.

### Session names that answer "who did this?"
A shared `Admin` role made CloudTrail logs useless: every action showed the same role. After the team switched to IAM Identity Center, each session carried the person's name (`assumed-role/AWSReservedSSO_Admin_…/asha@company.com`), and investigations went from days to minutes.

### Cross-account deployments without shared keys
A pipeline in a tools account deploys to development, test and production accounts by assuming a `Deployer` role in each. Each role trusts only the pipeline's role, and each environment's permissions are separate. No access key exists anywhere in the process.
