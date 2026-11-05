## Troubleshooting

### Lab problems
| Symptom | Cause | Fix |
|---|---|---|
| `InvalidParameterValue … The architecture 'arm64' of the specified image does not match the architecture supported by instance type 't3.micro'` | Arm image on an x86 instance type (or the reverse) | Use an Arm type (`t4g`, `m6g`…) for Arm images, x86 types for x86 images |
| `colima: command not found` | You use Docker Desktop, or Colima isn't installed | Use `docker info` instead |
| `colima list` shows `Stopped` | The VM isn't running, so Docker and Floci aren't either | Ask before starting it; in this course: `colima start` (it keeps your existing settings) |
| `--filters` returns everything | Floci 2.4.0 ignores some EC2 filters | Filter with `--query` on your side |
| `terminate-instances` complains about the instance IDs | The ID list wasn't split (zsh) | Use `${=IDS}` in zsh, `$IDS` in bash |

### Real-world virtualization problems
| Symptom | Likely cause | Fix |
|---|---|---|
| Performance varies on a T-family instance | Burstable instance ran out of CPU credits | Check CPU credit balance in CloudWatch; use unlimited mode or an M/C family |
| App crashes on a Graviton instance | Software or container image built for x86 only | Use multi-architecture images, or an x86 instance type |
| `InsufficientInstanceCapacity` | No spare capacity for that type in that AZ right now | Try another AZ or instance type; use several types in Auto Scaling |
| Licence auditor flags shared hardware | Licence requires dedicated physical cores | Dedicated Hosts (or bare metal) |
| "Noisy neighbour" suspicion | Usually the app itself, or burst credits; Nitro isolates instances well | Measure with CloudWatch before blaming the host |
| Instance type change fails | Type unsupported by the AMI's architecture or virtualisation needs | Choose a compatible type; stop the instance before changing type |
