## In the real world

### The founder's root password
A two-person startup in Kochi used the root user for everything, without MFA. The founder reused the same password on a forum that was breached. Attackers signed in, launched GPU instances in several Regions, and changed the contact email. Recovering the account took days. Root MFA would have stopped the attack completely.

### "Admin for everyone, we'll fix it later"
A small agency gave every developer `AdministratorAccess` to save time. An intern's laptop was stolen with access keys in `~/.aws/credentials`. Because the key was admin, the company had to assume everything could have been changed and audit the whole account. Afterwards, developers got `PowerUserAccess` through a group, and admins needed MFA.

### The guardrail that saved production
An operations team added a Deny for `ec2:TerminateInstances` and `rds:DeleteDBInstance` without MFA. Months later, a script using a long-term key tried to "clean up" what it thought were test servers. Every call was denied, the alarm on AccessDenied events fired, and nothing was lost.

### New joiner, day one
A bank creates each new engineer in Identity Center, adds them to the right groups, and forces MFA enrolment at first sign-in. On their last day, disabling one identity removes access to every account. The same rules from this lesson, at scale.
