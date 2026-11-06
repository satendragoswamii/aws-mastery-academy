## In the real world

### "Production is down and nobody changed anything"
A late-night incident: a setting in production differs from staging. Nobody remembers changing it; there's no code change. CloudTrail shows a console change three weeks earlier by an engineer fixing something "quickly". The team moves production to read-only console access and makes all changes through infrastructure as code.

### The Region panic
A student emails support: "All my EC2 instances were deleted!". The console was simply set to a different Region after they clicked a link to documentation. The instances were fine, in Mumbai. Checking the Region selector first would have saved the scare.

### Console first, code next
A common learning pattern used by AWS engineers themselves: create a resource once in the console to understand the options, then look at what was created (`describe-…` in the CLI or the CloudFormation "IaC generator") and write it as code for every later environment.

### CloudShell for safe admin work
Companies that forbid long-term access keys on laptops point administrators to **CloudShell**: the CLI is ready to use, credentials come from the console session (with MFA), and nothing sensitive is stored locally.
