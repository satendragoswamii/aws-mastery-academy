## Troubleshooting

### Lab errors (seen on Floci 2.4.0)
| Error | Cause | Fix |
|---|---|---|
| `InvalidParameterValue … must be in the same Availability Zone` | Volume and instance are in different AZs | Attach to an instance in the volume's AZ (real AWS says `InvalidVolume.ZoneMismatch`) |
| `IncorrectInstanceState … is not in a state from which it can be attached` | The instance is still `pending` | Run `ec2 wait instance-running --instance-ids …` first |
| `InvalidVolume.NotFound … does not exist` | You asked another Region (or the volume was deleted) | Use `--region ap-south-1` |
| `UnsupportedOperation … CreateSnapshot` | Floci doesn't support EBS snapshots | Read the snapshot steps; practise them in real AWS later |
| Old `terminated` instances appear in your list | They stay visible for a while after termination | Filter with `Name=instance-state-name,Values=running` |
| `$WEB_A` / `$VOL` is empty | New Terminal window | Find IDs with `describe-instances` / `describe-volumes` and the Name tag |

### "I can't find my instance" in real AWS
1. Check the **Region** (console selector or `--region`).
2. Check filters: the console may hide terminated or stopped instances.
3. Check the **account** (`aws sts get-caller-identity`).

### "My volume won't attach"
1. Same AZ as the instance? (`describe-volumes` vs. `describe-instances` → `Placement.AvailabilityZone`.)
2. Volume `available` (not `in-use` elsewhere)? Instance `running` or `stopped`?
3. Device name free on the instance?
4. Encrypted with a KMS key the instance's account may use?
