## Why account structure matters

### One account for everything doesn't scale
Many companies start with a single account: production, testing, every team, every experiment. Problems follow:
- A developer testing a clean-up script deletes a **production** table.
- Nobody can tell which team spent what.
- One team's runaway test hits the **account-wide quota**, and production can't scale.
- Auditors must review **everything**, because sensitive data could be anywhere.
- Permissions become a tangle of exceptions.

### Accounts are the strongest wall AWS offers
IAM policies inside one account can contain mistakes; a separate account contains them **by default**. That's why AWS's own guidance (the multi-account strategy, and Control Tower) puts each workload and environment in its own account.

### Organizations makes many accounts manageable
Without Organizations, ten accounts mean ten bills, ten sets of settings and ten places to forget something. With it:
- **New accounts in minutes**, already inside the right OU with the right guardrails.
- **Guardrails that can't be switched off** by account administrators (SCPs): "no leaving the organization", "no disabling CloudTrail", "only these Regions".
- **One bill** with combined volume discounts.
- **Central security**: one place to see GuardDuty findings and logs for every account.

### The root user needs special care
The root user can do anything, including closing the account. Compromised root credentials are the worst-case scenario. Protecting it (MFA, no access keys, rarely used) is the first step for any account.

## Why this matters for you
CLF-C02 asks about root user best practices, Organizations, SCPs and consolidated billing. Real jobs start with "which account is this in?", and good engineers know where things belong.
