## Independent assignment: identities for a school app

A school in Lucknow runs a homework app. Teachers upload assignments, a Lambda function marks quizzes, an EC2 server hosts the website, and an external exam board must audit security once a term.

### Part A: Plan (no AWS needed)
1. List every identity you need (users or Identity Center, groups, roles) and what each may do.
2. For each role, write its trusted principal in one line.
3. Explain why the exam board gets a role, not an IAM user.

### Part B: Build it on Floci
Use `--endpoint-url http://localhost:4566 --region ap-south-1` on every command.
1. Create groups `ama-l3-school-teachers` (S3 full access) and `ama-l3-school-it` (EC2 read-only), users `ama-l3-school-meena` (teachers) and `ama-l3-school-raj` (both), all under the path `/school/`.
2. Use the simulator to show Raj's permissions are the union of both groups, then remove him from `it` and show the difference.
3. Create a role for the web server that trusts EC2, an instance profile, and launch an instance with it. Show the association.
4. Create a role for Lambda (`lambda.amazonaws.com`) with `AWSLambdaBasicExecutionRole`.
5. Create the exam board role trusting account `444455556666` with an external ID and `SecurityAudit`, max session 1 hour. Print its trust policy as a table.
6. Clean up everything in the right order and finish with a summary showing 0 users, groups, roles and instance profiles.

### Part C: Explain (100–150 words)
Explain to the school's IT teacher why the website server must not use Raj's access keys, even though "it works".

### Self-assessment
- [ ] Every command had the endpoint and Region.
- [ ] Policies were attached to groups, not users.
- [ ] Each role's trust policy named exactly one kind of principal.
- [ ] You noted which trust checks Floci would not enforce.
- [ ] The final summary was all zeros.
