## Why users, groups and roles matter

### Per-person permissions don't scale
With five people, attaching policies to each user is manageable. With fifty, nobody can answer "who can delete production databases?" Groups turn that into "who is in the admins group?", and a person changing teams becomes one command, as step 2 showed.

### Long-term keys are the weak point
Access keys never expire on their own. They end up in laptops, Git repositories, CI settings and chat messages. Roles give **temporary** credentials that expire automatically, so a leaked role credential is useful to an attacker for minutes or hours, not years.

~~~text
access key in a config file   -> valid until someone deletes it
role credentials on EC2       -> rotated automatically, expire in hours
~~~

### Accounts must work together safely
Companies run many AWS accounts (lesson 19) and work with partners. Creating users in every account for every person is unmanageable and insecure. **Cross-account roles** let one identity work in many accounts, with each account deciding exactly what that role may do.

### Services need permissions too
EC2 instances, Lambda functions, ECS tasks and CodeBuild projects all call AWS APIs. Roles are how they get permission without anyone handling secrets.

## Why this matters for you
Choosing between a user, a group and a role is one of the most common exam questions on CLF-C02 and SAA-C03. The answer is almost always: **people in groups (or Identity Center), workloads and partners through roles**.
