## Troubleshooting

### Lab problems
| Symptom | Cause | Fix |
|---|---|---|
| `Instances` is empty right after creating the group | Floci reconciles every ~20 seconds | Wait and describe again |
| `ValidationError … The specified launch template does not exist.` | Template name typo, wrong Region, or template deleted | `aws ec2 describe-launch-templates` in the same Region |
| `ValidationError … New DesiredCapacity=9 must be between MinSize=1 and MaxSize=4.` | Desired outside min–max | Change desired, or `update-auto-scaling-group --max-size` first |
| `$Latest` turns into an empty string | Double quotes let the shell expand `$Latest` | Wrap the whole `--launch-template` value in **single** quotes |
| Instances keep coming back after you terminate them | The group is replacing them to keep desired capacity | Lower desired capacity, or delete the group |
| Group won't delete | Instances still running | `delete-auto-scaling-group --force-delete` |

> **Floci won't catch every mistake.** On Floci 2.4.0 these were accepted silently, but **real AWS rejects them**:
> - a group with neither `--availability-zones` nor `--vpc-zone-identifier` (subnets);
> - a group whose `--min-size` is larger than `--max-size`.
>
> Always give a group at least two AZs, and check that min ≤ desired ≤ max.

### Real-world scaling problems
| Symptom | Likely cause | What to do |
|---|---|---|
| Group never scales out under heavy load | No policy, max already reached, or the metric doesn't reflect load | Check `describe-policies`, max size, and whether CPU really is the bottleneck |
| Scales out and in repeatedly ("flapping") | Target too tight, warm-up too short | Raise the warm-up time; use target tracking instead of hand-made alarms |
| New instances are unhealthy and get replaced in a loop | App fails to start, or health check grace period too short | Read the startup logs; increase the grace period; test the launch template alone |
| Scale-out fails with capacity or limit errors | Service quotas, or no capacity for that instance type in an AZ | Request a quota increase; allow several instance types and several AZs |
| Users logged out after scale-in | Sessions stored on instances | Move sessions to ElastiCache or DynamoDB |
| Bill much higher than expected | Max too high, or scale-in never happens | Review scaling activities; set sensible max; check the scale-in side of the policy |

`describe-scaling-activities` is the first place to look: every launch and termination has a status and a reason.
