## Independent assignment: a credentials clean-up for a travel agency

A small travel agency has three IAM users with access keys, one of them created two years ago by a contractor. They want fewer long-term keys and a safe way for staff to get read-only access.

### Part A: Plan (no AWS needed)
1. For each, say whether you would use an access key, a role or SSO, and why: (a) the booking website on EC2, (b) the owner's laptop, (c) a third-party accounting tool that only accepts keys.
2. Write the step-by-step rotation plan for the accounting tool's key, including how you would roll back.
3. List three things to check in CloudTrail if the contractor's key was found in a public repository.

### Part B: Build it on Floci
Work in `~/ama-travel` with lab-only profile files (`AWS_CONFIG_FILE`, `AWS_SHARED_CREDENTIALS_FILE`), an `endpoint_url = http://localhost:4566` line in every profile, and `--endpoint-url http://localhost:4566` on every command.
1. Create users `ama-l2-travel-owner` and `ama-l2-travel-tool`, each with one access key captured **without printing the secret** into profiles `travel-owner` and `travel-tool`.
2. Rotate the `ama-l2-travel-tool` key: second key, switch the profile, verify with `sts get-caller-identity`, deactivate, delete. Show `list-access-keys` before and after.
3. Generate the credential report and show only the user and both `access_key_N_active` columns.
4. Create role `ama-l2-travel-readonly` (trusting `ama-l2-travel-owner`, `ReadOnlyAccess`, max session 1 hour). Create a role profile `travel-readonly` using `source_profile = travel-owner`, run it with `HOME="$PWD"`, and print the assumed-role ARN and the `Expiration` from the cache.
5. Clean up all users, keys, the role and the folder; prove nothing `ama-l2-travel` remains.

### Part C: Explain (100–150 words)
Explain to the agency's owner why "the key expires by itself" is the most important difference between the read-only role and an access key.

### Self-assessment
- [ ] No secret access key ever appeared on screen or in a file outside the lab credentials file.
- [ ] Rotation never left the tool without a working key.
- [ ] The role profile contains no keys, and its session name appears in the assumed-role ARN.
- [ ] Every profile has `endpoint_url`, and no `.aws/cli/cache` was created in your real home folder.
- [ ] Clean-up leaves no `ama-l2-travel` users or roles.
