## Independent assignment: an organization for a coaching institute

A coaching institute has three products (website, mobile-app backend, video platform), a small security team, and developers who like to experiment. Student data must stay in India. Experiments must never touch production.

### Part A: Design (no AWS needed)
1. Draw an OU and account structure (ASCII). Include where logs go and where developers experiment.
2. List three SCPs you'd attach, where you'd attach each, and why.
3. Explain who pays the bill and two benefits of consolidated billing for this institute.
4. Write the root-user rules you'd give the institute's administrator.

### Part B: Build on Floci
Always use `--endpoint-url http://localhost:4566 --region us-east-1`. Name everything starting `ama-l1-edu`.
1. Create the organization and OUs `ama-l1-edu-security`, `ama-l1-edu-prod` and `ama-l1-edu-sandbox`.
2. Create accounts `ama-l1-edu-logs`, `ama-l1-edu-web-prod` and `ama-l1-edu-dev` (emails at `example.com`) and move each into the right OU. Show `list-accounts-for-parent` for every OU.
3. Create an SCP that denies `organizations:LeaveOrganization` and attach it to the **root**; attach the India-only SCP to `ama-l1-edu-prod`. Show the policies on both targets.
4. Prove `delete-organization` is refused while accounts exist (paste the error), then dismantle everything and prove the organization is gone.

### Part C: Explain (100–150 words)
A developer says, "Just give me admin in the production account, it's faster." Explain what the multi-account structure and SCPs protect, and offer an alternative.

### Self-assessment
- [ ] Workloads are not in the management account.
- [ ] Logs are in their own account in a security OU.
- [ ] The India-only SCP is on prod, not on the root (so global administration still works for the management account, and the sandbox can test other Regions if allowed).
- [ ] Step 4 shows `OrganizationNotEmptyException`, then `AWSOrganizationsNotInUseException` at the end.
- [ ] Part C mentions blast radius and suggests dev/sandbox accounts plus read-only prod access.
