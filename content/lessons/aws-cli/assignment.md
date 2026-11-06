## Independent assignment: an inventory script for a bakery chain

A bakery chain's IT person wants a script that prints a short inventory of what's in their AWS account, safely, using a profile.

### Part A: Plan (no AWS needed)
1. Write the `~/.aws/config` sections you'd recommend for two accounts (`bakery-dev` with full access, `bakery-prod` read-only), using IAM Identity Center. No access keys.
2. In what order does the CLI choose the Region? Give an example where a leftover environment variable causes a mistake.
3. For each output format, give one situation where it's the best choice.

### Part B: Build it on Floci
Use a **lab-only** profile `ama-bakery` in files inside your assignment folder (`AWS_CONFIG_FILE`, `AWS_SHARED_CREDENTIALS_FILE`), Region ap-south-1, and `--endpoint-url http://localhost:4566` on every command.
1. Create a bucket `ama-l1-bakery-menus`, a queue `ama-l1-bakery-orders` (built from a `--generate-cli-skeleton` file with a 30-second visibility timeout), and a DynamoDB table `ama-l1-bakery-stock` (key `item`).
2. Write `inventory.sh` (run with `bash`) that prints:
   - who you are (`sts get-caller-identity`, Arn only),
   - all bucket names starting with `ama-l1-bakery`,
   - all queue URLs containing `bakery`,
   - all table names starting with `ama-l1-bakery`, as a **count** and as a list.
   Use `--query` and `--output text` for every line.
3. Run `inventory.sh` and paste the output. Then use `--dry-run` to check whether you could launch a `t3.micro` instance.
4. Clean up all three resources and the profile files; prove nothing `ama-l1-bakery` remains.

### Part C: Explain (100–150 words)
Explain why the script starts by printing the caller identity, and what else you'd add before letting it delete anything.

### Self-assessment
- [ ] No real access keys anywhere; the lab files used dummy `test` keys only.
- [ ] Every command in `inventory.sh` has `--endpoint-url http://localhost:4566`.
- [ ] Queries use filters/functions (`starts_with`, `length`, `contains`).
- [ ] The queue's VisibilityTimeout is 30, proven with `get-queue-attributes`.
- [ ] Clean-up leaves no resources and no lab profile files.
