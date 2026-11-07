## A safe first-day setup for a new AWS account

~~~text
ROOT USER  (email + strong password + MFA, no access keys)
  |  used only for: billing setup, account settings, emergencies
  v
IAM / Identity Center
  +-- account alias:      ama-lab-academy
  +-- password policy:    14+ chars, 4 character types, reuse 5
  +-- group "admins"      -> AdministratorAccess, MFA required
  |      +-- priya (password + MFA)
  +-- group "developers"  -> PowerUserAccess (no IAM changes)
  +-- group "auditors"    -> ReadOnlyAccess
  +-- role  "app-orders"  -> exactly what the app needs (assumed by EC2/Lambda)
  |
  +-- guardrails: Deny dangerous actions without MFA (step 6)
  +-- CloudTrail: records every IAM call and sign-in
~~~

### Why it is shaped this way
| Choice | Reason |
|---|---|
| Root locked away with MFA | Nothing can limit root, so it must be hard to use |
| People get permissions through **groups** | Change one group, not twenty users |
| Applications use **roles** | No long-term keys to leak or rotate |
| Admins need MFA for admin actions | A stolen password alone isn't enough |
| CloudTrail on | You can always answer "who did what, when" |

### In a larger company
Accounts are created with **AWS Organizations** (lesson 19), people sign in once through **IAM Identity Center**, and each account receives roles such as `AdministratorAccess` or `ReadOnly` automatically. IAM users with passwords become rare, but the evaluation rules from step 5 are exactly the same.
