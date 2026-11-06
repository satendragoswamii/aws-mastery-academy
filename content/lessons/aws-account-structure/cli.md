## AWS CLI commands in this lesson

| Command | What it does |
|---|---|
| `aws sts get-caller-identity` | Shows the account ID and identity you're using |
| `aws organizations describe-organization` | Shows the organization (or "not in use") |
| `aws organizations create-organization --feature-set ALL` | Creates an organization; this account becomes management |
| `aws organizations list-roots` | Gets the root ID (`r-…`) |
| `aws organizations create-organizational-unit --parent-id … --name …` | Creates an OU |
| `aws organizations list-organizational-units-for-parent --parent-id …` | Lists OUs under a parent |
| `aws organizations create-account --email … --account-name …` | Creates a member account |
| `aws organizations describe-create-account-status --create-account-request-id …` | Checks progress (real AWS) |
| `aws organizations list-accounts` | Lists all accounts |
| `aws organizations move-account --account-id … --source-parent-id … --destination-parent-id …` | Moves an account between root/OUs |
| `aws organizations list-accounts-for-parent --parent-id …` | Lists accounts in an OU |
| `aws organizations enable-policy-type --root-id … --policy-type SERVICE_CONTROL_POLICY` | Turns on SCPs |
| `aws organizations create-policy --type SERVICE_CONTROL_POLICY --content file://…` | Creates an SCP |
| `aws organizations attach-policy` / `detach-policy --policy-id … --target-id …` | Attaches/detaches it |
| `aws organizations list-policies-for-target --target-id … --filter SERVICE_CONTROL_POLICY` | Lists SCPs on a target |
| `aws organizations delete-policy` / `delete-organizational-unit` / `remove-account-from-organization` / `delete-organization` | Dismantles |
| `aws organizations close-account --account-id …` | Closes a member account (real AWS) |

### Try it yourself
1. Create the organization again, then a **nested** OU: `ama-l1-workloads` → `ama-l1-prod` (use the workloads OU's ID as `--parent-id`). List the children of each. Dismantle everything.
2. Write an SCP `ama-l1-no-leaving.json` that denies `organizations:LeaveOrganization`, attach it to the root, list it, then detach and delete it, and delete the organization.

### Remember
Every Organizations command needs `--region us-east-1` (global service), and step 7's order is the only order that works.
