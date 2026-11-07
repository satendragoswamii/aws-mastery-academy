## Why IAM matters

### Most cloud breaches are identity problems
Leaked access keys in public code, reused passwords without MFA, users with far more permission than they need: these, not clever hacking, cause most AWS security incidents. Under the **shared responsibility model** (lesson 17), AWS secures the cloud; **who can do what in your account is entirely your job**, and IAM is the tool.

### The root user is a single point of failure
The root user can delete every resource, close the account and change billing, and no policy can stop it. An account whose root password is phished, with no MFA, is lost. Protecting root is the very first task in any new account.

### Least privilege limits the damage
If an application's key leaks but it can only read one bucket, the damage is small. If it has `AdministratorAccess`, the attacker owns the account. IAM's **default deny** makes least privilege natural: you only add the permissions that are needed.

~~~text
leaked credential  +  AdministratorAccess  =  whole account lost
leaked credential  +  read one bucket      =  one bucket exposed (and a clear audit trail)
~~~

### Everything else builds on it
EC2 instance roles, Lambda execution roles, cross-account access, Organizations SCPs, S3 bucket policies and KMS key policies all use IAM's language. Learn it once and every service becomes easier.

## Why this matters for you
CLF-C02 asks about the root user, MFA, least privilege, and users versus groups versus roles. Every associate and professional exam assumes you can read a policy and predict whether a request is allowed. IAM is also the first thing interviewers ask a cloud engineer about.
