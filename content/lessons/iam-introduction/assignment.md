## Independent assignment: day one at a new company account

You are the first cloud engineer at a travel company in Goa. The account was just created and only the root user exists.

### Part A: Plan (no AWS needed)
1. Write the root user's checklist for day one, in order.
2. Decide the password policy (length, character types, expiry, reuse) and justify each value.
3. For each person, choose how they get permissions: Anil (IT admin), Meera (developer), Ravi (accountant who only needs billing reports).

### Part B: Build it on Floci
Use `--endpoint-url http://localhost:4566 --region ap-south-1` on every command.
1. Set the account alias `ama-goa-travel` and a password policy of your choice; show it as a table.
2. Create users `ama-l3-goa-anil` and `ama-l3-goa-meera` with console passwords that require a reset. Show one password being rejected by your policy.
3. Give Anil a virtual MFA device enabled with codes from `totp.mjs`. Keep the seed file private.
4. Attach `ReadOnlyAccess` to Meera, plus an inline policy that denies `s3:DeleteBucket`. Use the simulator to show `s3:ListAllMyBuckets` allowed, `s3:DeleteBucket` explicitDeny and `sqs:CreateQueue` implicitDeny.
5. Write a policy allowing `rds:*` but denying `rds:DeleteDBInstance` without MFA, and test it with MFA `true` and `false`.
6. Delete everything, show one `DeleteConflict` on the way, and finish with a summary of 0 users and 0 MFA devices.

### Part C: Explain (100–150 words)
Explain to the company's director why "the developers already have the root password" is a serious risk, and what you will do instead.

### Self-assessment
- [ ] Every command had the endpoint and Region.
- [ ] The MFA seed was never printed and was deleted afterwards.
- [ ] The simulator showed allowed, explicitDeny and implicitDeny for Meera.
- [ ] The MFA policy denied the delete only when MFA was false.
- [ ] The account summary ended at 0 users and 0 MFA devices.
