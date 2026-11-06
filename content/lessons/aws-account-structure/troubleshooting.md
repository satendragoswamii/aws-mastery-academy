## Troubleshooting

### Lab errors (seen on Floci 2.4.0)
| Error | Cause | Fix |
|---|---|---|
| `AWSOrganizationsNotInUseException` | No organization exists (before step 2, or after step 7) | Expected at those points; run step 2 to create one |
| `OrganizationNotEmptyException` | You tried to delete the organization while member accounts exist | Follow step 7's order: policies, OUs, accounts, then the organization |
| `AlreadyInOrganizationException` | You ran step 2 twice | Carry on with the existing one, or dismantle it first |
| `$ROOT`, `$WORK`, `$PROD`… are empty | New Terminal window | Re-read them: `list-roots`, `list-organizational-units-for-parent`, `list-accounts` |
| `DuplicateOrganizationalUnitException` | An OU with that name exists under the same parent | Use the existing OU or delete it |

### In real AWS
| Problem | Likely cause |
|---|---|
| `AccessDenied` for an admin in a member account | An SCP denies it. Check `list-policies-for-target` for the account, its OUs and the root |
| `create-account` stays `IN_PROGRESS` / `FAILED` | Email already used by another AWS account, or account limit reached |
| `ConstraintViolationException` on `remove-account-from-organization` | The account can't stand alone yet (no payment method, contact info) |
| Can't find resources | You're signed in to a different account. Check `sts get-caller-identity` |
