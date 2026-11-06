## Troubleshooting

### Lab errors and surprises (seen on Floci 2.4.0)
| Message | Cause | Fix |
|---|---|---|
| `NoSuchEntity … PasswordPolicy cannot be found` | No custom password policy exists (before step 2, or after clean-up) | Expected. Run step 2 to create one |
| `NoSuchPublicAccessBlockConfiguration` from `s3control get-public-access-block` | Account-level Block Public Access isn't set | Expected before step 4 / after step 6 |
| `get-compliance-details-by-config-rule` returns no results | Floci stores Config rules but doesn't evaluate them | Read the rule's purpose; real AWS evaluates with a recorder |
| `UnknownOperationException` from `aws artifact …` | Floci has no AWS Artifact | Use the console in real AWS |
| A volume shows `Encrypted: False` | Encryption by default was off, or it's on in a different Region | `get-ebs-encryption-by-default --region …` |
| `$VOL` empty in step 6 | New Terminal window | Find it by the tag `ama-l1-srm-vol` with `describe-volumes` |

### "Is this AWS's problem or mine?" A quick test
1. **Could I have configured it differently?** (A setting, policy, rule, patch, choice of service.) → **Yours.**
2. **Is it physical, or below the virtualisation layer, or inside a managed service's platform?** → **AWS's.** Check the AWS Health Dashboard; open a support case.
3. **Is it about data or access?** → **Always yours**, on every service.
